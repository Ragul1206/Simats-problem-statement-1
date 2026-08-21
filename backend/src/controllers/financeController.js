const db = require('../database/db');

exports.getFinanceOverview = (req, res) => {
  try {
    let invoicesSql = `
      SELECT inv.*, v.name as vendor_name, v.code as vendor_code, po.po_number
      FROM invoices inv
      JOIN vendors v ON inv.vendor_id = v.id
      JOIN purchase_orders po ON inv.po_id = po.id
    `;
    const invoiceParams = [];

    if (req.user && req.user.role === 'customer') {
      invoicesSql += ' WHERE inv.customer_id = ?';
      invoiceParams.push(req.user.id);
    } else if (req.user && req.user.role === 'vendor' && req.user.vendor_id) {
      invoicesSql += ' WHERE inv.vendor_id = ?';
      invoiceParams.push(req.user.vendor_id);
    }

    invoicesSql += ' ORDER BY inv.created_at DESC';
    const invoices = db.prepare(invoicesSql).all(...invoiceParams);

    // Fetch EMI Schedules
    let emiSql = `
      SELECT emi.*, v.name as vendor_name, po.po_number, inv.invoice_number
      FROM emi_schedules emi
      JOIN vendors v ON emi.vendor_id = v.id
      JOIN purchase_orders po ON emi.po_id = po.id
      JOIN invoices inv ON emi.invoice_id = inv.id
    `;
    const emiParams = [];

    if (req.user && req.user.role === 'vendor' && req.user.vendor_id) {
      emiSql += ' WHERE emi.vendor_id = ?';
      emiParams.push(req.user.vendor_id);
    }

    emiSql += ' ORDER BY emi.created_at DESC';
    const emiSchedules = db.prepare(emiSql).all(...emiParams);

    // Customer Discount Offers
    const discountOffers = db.prepare('SELECT * FROM discount_offers WHERE status = "Active"').all();

    // Key Stats
    const totalPayables = invoices.reduce((sum, inv) => sum + (inv.status !== 'Paid' ? inv.total_amount : 0), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? inv.total_amount : 0), 0);
    const activeEmiCount = emiSchedules.filter(e => e.status === 'Active').length;

    res.json({
      invoices,
      emiSchedules,
      discountOffers,
      stats: {
        totalPayables,
        totalPaid,
        activeEmiCount,
        invoiceCount: invoices.length
      }
    });
  } catch (error) {
    console.error('Error fetching finance overview:', error);
    res.status(500).json({ error: 'Failed to retrieve finance data' });
  }
};

exports.payEMIInstallment = (req, res) => {
  try {
    const { emi_id } = req.body;

    const emi = db.prepare('SELECT * FROM emi_schedules WHERE id = ?').get(emi_id);
    if (!emi) {
      return res.status(404).json({ error: 'EMI Schedule not found' });
    }

    const newPaidCount = emi.paid_installments + 1;
    const isCompleted = newPaidCount >= emi.tenure_months;

    db.prepare(`
      UPDATE emi_schedules 
      SET paid_installments = ?,
          status = ?
      WHERE id = ?
    `).run(newPaidCount, isCompleted ? 'Completed' : 'Active', emi_id);

    if (isCompleted) {
      db.prepare("UPDATE invoices SET status = 'Paid', payment_date = CURRENT_DATE WHERE id = ?").run(emi.invoice_id);
    }

    res.json({
      message: `Successfully processed installment payment #${newPaidCount} of ${emi.tenure_months}`,
      paid_installments: newPaidCount,
      isCompleted
    });
  } catch (error) {
    console.error('Error paying EMI installment:', error);
    res.status(500).json({ error: 'Failed to process installment payment' });
  }
};
