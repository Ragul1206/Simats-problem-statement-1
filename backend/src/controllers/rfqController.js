const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

exports.getAllRFQs = (req, res) => {
  try {
    let sql = `
      SELECT r.*, p.name as product_name, p.sku as product_sku, p.unit_price as product_base_price,
             (SELECT COUNT(*) FROM quotations q WHERE q.rfq_id = r.id) as quotation_count,
             (SELECT COUNT(*) FROM rfq_vendors rv WHERE rv.rfq_id = r.id) as assigned_vendor_count
      FROM rfqs r
      JOIN products p ON r.product_id = p.id
    `;
    const params = [];

    // Filter by customer if user is customer
    if (req.user && req.user.role === 'customer') {
      sql += ' WHERE r.customer_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY r.created_at DESC';

    const rfqs = db.prepare(sql).all(...params);
    res.json({ rfqs });
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    res.status(500).json({ error: 'Failed to retrieve RFQs' });
  }
};

exports.getRFQById = (req, res) => {
  try {
    const { id } = req.params;
    const rfq = db.prepare(`
      SELECT r.*, p.name as product_name, p.sku as product_sku, p.unit_price as product_base_price, p.category as product_category,
             u.name as creator_name, u.email as creator_email
      FROM rfqs r
      JOIN products p ON r.product_id = p.id
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.id = ?
    `).get(id);

    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    const assignedVendors = db.prepare(`
      SELECT v.*, rv.status as rfq_vendor_status
      FROM rfq_vendors rv
      JOIN vendors v ON rv.vendor_id = v.id
      WHERE rv.rfq_id = ?
    `).all(id);

    const quotations = db.prepare(`
      SELECT q.*, v.name as vendor_name, v.code as vendor_code, v.rating as vendor_rating,
             v.medal_tier as vendor_medal_tier, v.b2b_trust_score as vendor_b2b_trust_score,
             v.quality_score as vendor_quality_score, v.gstin_verified as vendor_gstin_verified
      FROM quotations q
      JOIN vendors v ON q.vendor_id = v.id
      WHERE q.rfq_id = ?
      ORDER BY q.created_at DESC
    `).all(id);

    res.json({ rfq, assignedVendors, quotations });
  } catch (error) {
    console.error('Error fetching RFQ details:', error);
    res.status(500).json({ error: 'Failed to retrieve RFQ details' });
  }
};

exports.createRFQ = (req, res) => {
  try {
    const {
      title,
      product_id,
      quantity,
      target_price,
      specifications,
      required_delivery_date,
      payment_terms,
      vendor_ids,
      customer_id
    } = req.body;

    if (!title || !product_id || !quantity || !required_delivery_date) {
      return res.status(400).json({ error: 'Title, Product, Quantity, and Required Delivery Date are required' });
    }

    const id = 'rfq-' + uuidv4().substring(0, 8);
    const rfqNumber = 'RFQ-2026-' + Math.floor(1000 + Math.random() * 9000);

    // Fetch product unit_price as default target_price if not provided
    let finalTargetPrice = parseFloat(target_price) || 0;
    if (!finalTargetPrice) {
      const prod = db.prepare('SELECT unit_price FROM products WHERE id = ?').get(product_id);
      if (prod) finalTargetPrice = prod.unit_price || 0;
    }

    // Determine Customer Loyalty Discount
    let discountRate = 0.0;
    let targetCustomerId = customer_id || (req.user.role === 'customer' ? req.user.id : null);

    if (targetCustomerId) {
      const custUser = db.prepare('SELECT customer_tier, discount_rate FROM users WHERE id = ?').get(targetCustomerId);
      if (custUser) {
        discountRate = custUser.discount_rate || 0.0;
      }
    }

    db.prepare(`
      INSERT INTO rfqs (id, rfq_number, title, product_id, quantity, target_price, specifications, required_delivery_date, payment_terms, status, customer_id, applied_discount_rate, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open', ?, ?, ?)
    `).run(
      id,
      rfqNumber,
      title,
      product_id,
      quantity,
      finalTargetPrice,
      specifications || '',
      required_delivery_date,
      payment_terms || 'Net 30',
      targetCustomerId,
      discountRate,
      req.user.id
    );

    // Assign Vendors if provided
    if (vendor_ids && Array.isArray(vendor_ids)) {
      const insertVendor = db.prepare('INSERT INTO rfq_vendors (id, rfq_id, vendor_id, status) VALUES (?, ?, ?, ?)');
      vendor_ids.forEach(vId => {
        insertVendor.run('rfq-v-' + uuidv4().substring(0, 8), id, vId, 'Assigned');
      });
    }

    const created = db.prepare('SELECT * FROM rfqs WHERE id = ?').get(id);
    res.status(201).json({ message: 'RFQ created successfully', rfq: created });
  } catch (error) {
    console.error('Error creating RFQ:', error);
    res.status(500).json({ error: 'Failed to create RFQ' });
  }
};
