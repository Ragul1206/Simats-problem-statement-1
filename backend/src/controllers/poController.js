const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

exports.getAllPurchaseOrders = (req, res) => {
  try {
    let sql = `
      SELECT po.*, p.name as product_name, v.name as vendor_name, v.code as vendor_code,
             v.medal_tier as vendor_medal_tier, v.gstin as vendor_gstin,
             r.rfq_number
      FROM purchase_orders po
      JOIN products p ON po.product_id = p.id
      JOIN vendors v ON po.vendor_id = v.id
      JOIN rfqs r ON po.rfq_id = r.id
    `;
    const params = [];

    if (req.user && req.user.role === 'customer') {
      sql += ' WHERE po.customer_id = ?';
      params.push(req.user.id);
    } else if (req.user && req.user.role === 'vendor' && req.user.vendor_id) {
      sql += ' WHERE po.vendor_id = ?';
      params.push(req.user.vendor_id);
    }

    sql += ' ORDER BY po.created_at DESC';

    const pos = db.prepare(sql).all(...params);
    res.json({ pos });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Failed to retrieve purchase orders' });
  }
};

exports.getPOById = (req, res) => {
  try {
    const { id } = req.params;
    const po = db.prepare(`
      SELECT po.*, p.name as product_name, p.sku as product_sku, p.category as product_category,
             v.name as vendor_name, v.code as vendor_code, v.gstin as vendor_gstin, v.owner_name as vendor_owner,
             v.phone as vendor_phone, v.email as vendor_email, v.address as vendor_address, v.medal_tier as vendor_medal_tier,
             q.warranty_period_months, q.payment_terms as quotation_terms
      FROM purchase_orders po
      JOIN products p ON po.product_id = p.id
      JOIN vendors v ON po.vendor_id = v.id
      JOIN quotations q ON po.quotation_id = q.id
      WHERE po.id = ?
    `).get(id);

    if (!po) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    // Fetch related EMI Schedule if present
    const emi = db.prepare('SELECT * FROM emi_schedules WHERE po_id = ?').get(id);

    // Fetch related Invoice if present
    const invoice = db.prepare('SELECT * FROM invoices WHERE po_id = ?').get(id);

    res.json({ po, emi, invoice });
  } catch (error) {
    console.error('Error fetching PO details:', error);
    res.status(500).json({ error: 'Failed to retrieve Purchase Order details' });
  }
};

exports.createPOFromQuotation = (req, res) => {
  try {
    const { quotation_id, is_emi, emi_tenure_months, shipping_address } = req.body;

    if (!quotation_id) {
      return res.status(400).json({ error: 'Quotation ID is required to generate Purchase Order' });
    }

    const quote = db.prepare(`
      SELECT q.*, r.product_id, r.quantity, r.customer_id, r.applied_discount_rate
      FROM quotations q
      JOIN rfqs r ON q.rfq_id = r.id
      WHERE q.id = ?
    `).get(quotation_id);

    if (!quote) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const poId = 'po-' + uuidv4().substring(0, 8);
    const poNumber = 'PO-2026-' + Math.floor(1000 + Math.random() * 9000);

    const subtotal = quote.unit_price * quote.quantity;
    
    // Apply Customer Loyalty Discount if applicable
    const discountRate = quote.applied_discount_rate || 0.0;
    const discountAmount = subtotal * discountRate;
    const discountedSubtotal = subtotal - discountAmount;
    
    const taxAmount = discountedSubtotal * (quote.tax_rate / 100);
    const totalAmount = discountedSubtotal + taxAmount;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (quote.lead_time_days || 14));
    const deliveryDateStr = deliveryDate.toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO purchase_orders (id, po_number, rfq_id, quotation_id, vendor_id, product_id, customer_id, quantity, unit_price, subtotal, discount_amount, tax_amount, total_amount, payment_terms, is_emi, emi_tenure_months, delivery_date, shipping_address, status, approved_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved', ?)
    `).run(
      poId,
      poNumber,
      quote.rfq_id,
      quote.id,
      quote.vendor_id,
      quote.product_id,
      quote.customer_id,
      quote.quantity,
      quote.unit_price,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      quote.payment_terms,
      is_emi ? 1 : (quote.supports_emi ? 1 : 0),
      emi_tenure_months || 6,
      deliveryDateStr,
      shipping_address || 'Central Warehousing Complex, Industrial Zone A, Tech City',
      req.user.name
    );

    // Update product incoming stock count
    db.prepare('UPDATE products SET incoming_stock = incoming_stock + ? WHERE id = ?').run(quote.quantity, quote.product_id);

    // Update RFQ status to Closed
    db.prepare("UPDATE rfqs SET status = 'Closed' WHERE id = ?").run(quote.rfq_id);

    // Auto-generate Invoice in Finance
    const invId = 'inv-' + uuidv4().substring(0, 8);
    const invNumber = 'INV-' + poNumber.replace('PO-', '');
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    db.prepare(`
      INSERT INTO invoices (id, invoice_number, po_id, vendor_id, customer_id, subtotal, tax_amount, total_amount, due_date, payment_method, is_emi, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved')
    `).run(
      invId,
      invNumber,
      poId,
      quote.vendor_id,
      quote.customer_id,
      discountedSubtotal,
      taxAmount,
      totalAmount,
      dueDate.toISOString().split('T')[0],
      is_emi ? 'EMI Payment' : 'Bank Transfer',
      is_emi ? 1 : 0
    );

    // Auto-generate EMI Schedule if EMI selected
    if (is_emi || quote.supports_emi) {
      const tenure = emi_tenure_months || 6;
      const annualRate = 12.0;
      const monthlyRate = annualRate / 12 / 100;
      const monthlyEmi = (totalAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);

      db.prepare(`
        INSERT INTO emi_schedules (id, invoice_id, po_id, vendor_id, total_amount, principal_amount, down_payment, interest_rate_annual, tenure_months, monthly_emi_amount, emi_start_date, interest_due_day_of_month, paid_installments, status)
        VALUES (?, ?, ?, ?, ?, ?, 0.0, ?, ?, ?, ?, 5, 0, 'Active')
      `).run(
        'emi-' + uuidv4().substring(0, 8),
        invId,
        poId,
        quote.vendor_id,
        totalAmount,
        totalAmount,
        annualRate,
        tenure,
        Math.round(monthlyEmi),
        dueDate.toISOString().split('T')[0]
      );
    }

    // Add Audit Log
    db.prepare('INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      'aud-' + uuidv4().substring(0, 8),
      req.user.id,
      req.user.name,
      'PO_APPROVED',
      'PURCHASE_ORDER',
      poId,
      `Generated ${poNumber} for ${quote.quantity} units (Total ₹${totalAmount.toLocaleString('en-IN')}).`
    );

    const newPO = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(poId);
    res.status(201).json({ message: 'Purchase Order created successfully', purchaseOrder: newPO });
  } catch (error) {
    console.error('Error creating Purchase Order:', error);
    res.status(500).json({ error: 'Failed to create Purchase Order' });
  }
};
