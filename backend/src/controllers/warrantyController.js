const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

exports.getAllWarrantyClaims = (req, res) => {
  try {
    let sql = `
      SELECT wc.*, p.name as product_name, v.name as vendor_name, v.code as vendor_code, po.po_number
      FROM warranty_claims wc
      JOIN products p ON wc.product_id = p.id
      JOIN vendors v ON wc.vendor_id = v.id
      JOIN purchase_orders po ON wc.po_id = po.id
    `;
    const params = [];

    if (req.user && req.user.role === 'vendor' && req.user.vendor_id) {
      sql += ' WHERE wc.vendor_id = ?';
      params.push(req.user.vendor_id);
    }

    sql += ' ORDER BY wc.created_at DESC';

    const claims = db.prepare(sql).all(...params);
    res.json({ claims });
  } catch (error) {
    console.error('Error fetching warranty claims:', error);
    res.status(500).json({ error: 'Failed to retrieve warranty claims' });
  }
};

exports.createWarrantyClaim = (req, res) => {
  try {
    const { po_id, item_serial_number, issue_description, claim_amount } = req.body;

    if (!po_id || !issue_description) {
      return res.status(400).json({ error: 'PO ID and Issue Description are required' });
    }

    const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(po_id);
    if (!po) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    const claimId = 'wrt-' + uuidv4().substring(0, 8);
    const claimNumber = 'WC-2026-' + Math.floor(1000 + Math.random() * 9000);

    db.prepare(`
      INSERT INTO warranty_claims (id, claim_number, po_id, vendor_id, product_id, item_serial_number, issue_description, claim_amount, status, filed_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Filed', CURRENT_DATE, ?)
    `).run(
      claimId,
      claimNumber,
      po_id,
      po.vendor_id,
      po.product_id,
      item_serial_number || 'SN-' + Math.floor(100000 + Math.random() * 900000),
      issue_description,
      claim_amount ? parseFloat(claim_amount) : 0.0,
      req.user.name
    );

    const created = db.prepare('SELECT * FROM warranty_claims WHERE id = ?').get(claimId);
    res.status(201).json({ message: 'Warranty claim ticket submitted successfully', claim: created });
  } catch (error) {
    console.error('Error creating warranty claim:', error);
    res.status(500).json({ error: 'Failed to file warranty claim' });
  }
};

exports.updateWarrantyClaimStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Claim Status is required' });
    }

    db.prepare(`
      UPDATE warranty_claims 
      SET status = ?, 
          resolution_notes = ?,
          resolution_date = CASE WHEN ? IN ('Approved', 'Replacement Shipped', 'Refunded', 'Rejected') THEN CURRENT_DATE ELSE resolution_date END
      WHERE id = ?
    `).run(status, resolution_notes || '', status, id);

    const updated = db.prepare('SELECT * FROM warranty_claims WHERE id = ?').get(id);
    res.json({ message: 'Warranty claim status updated successfully', claim: updated });
  } catch (error) {
    console.error('Error updating warranty claim:', error);
    res.status(500).json({ error: 'Failed to update warranty claim' });
  }
};
