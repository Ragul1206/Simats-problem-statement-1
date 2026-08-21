const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

exports.getAllVendors = (req, res) => {
  try {
    const vendors = db.prepare('SELECT * FROM vendors ORDER BY b2b_trust_score DESC, rating DESC').all();
    res.json({ vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to retrieve vendors' });
  }
};

exports.getVendorById = (req, res) => {
  try {
    const { id } = req.params;
    const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const quotes = db.prepare(`
      SELECT q.*, r.title as rfq_title 
      FROM quotations q 
      JOIN rfqs r ON q.rfq_id = r.id 
      WHERE q.vendor_id = ? 
      ORDER BY q.created_at DESC
    `).all(id);

    const pos = db.prepare(`
      SELECT po.*, p.name as product_name 
      FROM purchase_orders po 
      JOIN products p ON po.product_id = p.id 
      WHERE po.vendor_id = ? 
      ORDER BY po.created_at DESC
    `).all(id);

    const claims = db.prepare(`
      SELECT wc.*, p.name as product_name 
      FROM warranty_claims wc 
      JOIN products p ON wc.product_id = p.id 
      WHERE wc.vendor_id = ? 
      ORDER BY wc.created_at DESC
    `).all(id);

    res.json({ vendor, quotes, pos, claims });
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    res.status(500).json({ error: 'Failed to retrieve vendor details' });
  }
};

exports.createVendor = (req, res) => {
  try {
    const {
      name,
      contact_person,
      email,
      phone,
      address,
      gstin,
      owner_name,
      owner_email,
      owner_phone,
      owner_pan,
      medal_tier,
      payment_terms,
      supports_emi
    } = req.body;

    if (!name || !email || !gstin || !owner_name) {
      return res.status(400).json({ error: 'Vendor Name, Email, GSTIN, and Owner Name are required' });
    }

    const id = 'vnd-' + uuidv4().substring(0, 8);
    const code = 'VND-' + name.substring(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

    const medalScores = { Diamond: 98, Platinum: 92, Gold: 84, Silver: 76, Bronze: 62 };
    const trustScore = medalScores[medal_tier] || 75;

    db.prepare(`
      INSERT INTO vendors (id, name, code, contact_person, email, phone, address, gstin, gstin_verified, owner_name, owner_email, owner_phone, owner_pan, medal_tier, b2b_trust_score, rating, quality_score, delivery_score, payment_terms, supports_emi, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, 4.5, 88.0, 90.0, ?, ?, 'Active')
    `).run(
      id,
      name,
      code,
      contact_person || owner_name,
      email,
      phone || '',
      address || '',
      gstin,
      owner_name,
      owner_email || email,
      owner_phone || phone || '',
      owner_pan || '',
      medal_tier || 'Gold',
      trustScore,
      payment_terms || 'Net 30',
      supports_emi !== undefined ? (supports_emi ? 1 : 0) : 1
    );

    const newVendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
    res.status(201).json({ message: 'Vendor added successfully', vendor: newVendor });
  } catch (error) {
    console.error('Error adding vendor:', error);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
};

exports.updateVendor = (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      contact_person,
      email,
      phone,
      address,
      gstin,
      owner_name,
      owner_email,
      owner_phone,
      owner_pan,
      medal_tier,
      rating,
      quality_score,
      delivery_score,
      payment_terms,
      supports_emi,
      status
    } = req.body;

    const existing = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const medalScores = { Diamond: 98, Platinum: 92, Gold: 84, Silver: 76, Bronze: 62 };
    const trustScore = medalScores[medal_tier || existing.medal_tier] || existing.b2b_trust_score;

    db.prepare(`
      UPDATE vendors 
      SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?, gstin = ?, owner_name = ?, owner_email = ?, owner_phone = ?, owner_pan = ?, medal_tier = ?, b2b_trust_score = ?, rating = ?, quality_score = ?, delivery_score = ?, payment_terms = ?, supports_emi = ?, status = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      contact_person || existing.contact_person,
      email || existing.email,
      phone !== undefined ? phone : existing.phone,
      address !== undefined ? address : existing.address,
      gstin || existing.gstin,
      owner_name || existing.owner_name,
      owner_email !== undefined ? owner_email : existing.owner_email,
      owner_phone !== undefined ? owner_phone : existing.owner_phone,
      owner_pan !== undefined ? owner_pan : existing.owner_pan,
      medal_tier || existing.medal_tier,
      trustScore,
      rating !== undefined ? rating : existing.rating,
      quality_score !== undefined ? quality_score : existing.quality_score,
      delivery_score !== undefined ? delivery_score : existing.delivery_score,
      payment_terms || existing.payment_terms,
      supports_emi !== undefined ? (supports_emi ? 1 : 0) : existing.supports_emi,
      status || existing.status,
      id
    );

    const updated = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
    res.json({ message: 'Vendor updated successfully', vendor: updated });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
};
