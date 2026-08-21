const db = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { JWT_SECRET } = require('../middleware/auth');

exports.login = (req, res) => {
  try {
    const { email, password, portal } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Role portal validation if specified
    if (portal === 'company' && ['customer', 'vendor'].includes(user.role)) {
      return res.status(403).json({ error: 'This account is not authorized for the Company Portal. Please use the Customer or Vendor login portal.' });
    }
    if (portal === 'customer' && user.role !== 'customer' && user.role !== 'admin') {
      return res.status(403).json({ error: 'This account is not authorized for the Customer Portal.' });
    }
    if (portal === 'vendor' && user.role !== 'vendor' && user.role !== 'admin') {
      return res.status(403).json({ error: 'This account is not authorized for the Vendor Portal.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, customer_tier: user.customer_tier, vendor_id: user.vendor_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Fetch vendor details if vendor user
    let vendorDetails = null;
    if (user.vendor_id) {
      vendorDetails = db.prepare('SELECT * FROM vendors WHERE id = ?').get(user.vendor_id);
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        customer_tier: user.customer_tier,
        discount_rate: user.discount_rate,
        total_spent: user.total_spent,
        vendor_id: user.vendor_id,
        vendorDetails
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

exports.registerVendor = (req, res) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      address,
      gstin,
      ownerName,
      ownerEmail,
      ownerPhone,
      ownerPan,
      password
    } = req.body;

    if (!companyName || !email || !gstin || !ownerName || !password) {
      return res.status(400).json({ error: 'Company Name, Email, GSTIN, Owner Name, and Password are required' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User email already registered' });
    }

    const vendorId = 'vnd-' + uuidv4().substring(0, 8);
    const userId = 'usr-' + uuidv4().substring(0, 8);
    const vendorCode = 'VND-' + companyName.substring(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
    const passwordHash = bcrypt.hashSync(password, 10);

    // Create Vendor record
    db.prepare(`
      INSERT INTO vendors (id, name, code, contact_person, email, phone, address, gstin, gstin_verified, owner_name, owner_email, owner_phone, owner_pan, medal_tier, b2b_trust_score, rating, quality_score, delivery_score, payment_terms, supports_emi, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, 'Bronze', 70, 4.0, 80.0, 85.0, 'Net 30', 1, 'Active')
    `).run(vendorId, companyName, vendorCode, contactPerson || ownerName, email, phone || '', address || '', gstin, ownerName, ownerEmail || email, ownerPhone || phone || '', ownerPan || '',);

    // Create User record
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, department, vendor_id)
      VALUES (?, ?, ?, ?, 'vendor', 'Supplier Representative', ?)
    `).run(userId, contactPerson || companyName, email, passwordHash, vendorId);

    const token = jwt.sign(
      { id: userId, name: contactPerson || companyName, email, role: 'vendor', vendor_id: vendorId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'B2B Vendor registered successfully',
      token,
      user: {
        id: userId,
        name: contactPerson || companyName,
        email,
        role: 'vendor',
        vendor_id: vendorId
      }
    });
  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({ error: 'Failed to register vendor account' });
  }
};

exports.getCurrentUser = (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, role, department, customer_tier, discount_rate, total_spent, vendor_id FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};
