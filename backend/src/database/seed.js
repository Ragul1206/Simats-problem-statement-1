const db = require('./db');
const bcrypt = require('bcryptjs');

function seedDatabase() {
  console.log('🌱 Seeding Procurement ERP Database...');

  // Clear existing tables
  db.exec(`
    DELETE FROM audit_logs;
    DELETE FROM discount_offers;
    DELETE FROM warranty_claims;
    DELETE FROM emi_schedules;
    DELETE FROM invoices;
    DELETE FROM inventory_transactions;
    DELETE FROM purchase_orders;
    DELETE FROM quotations;
    DELETE FROM rfq_vendors;
    DELETE FROM rfqs;
    DELETE FROM products;
    DELETE FROM vendors;
    DELETE FROM users;
  `);

  const passwordHash = bcrypt.hashSync('password123', 10);

  // 1. Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, department, customer_tier, discount_rate, total_spent, vendor_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('usr-admin-01', 'Alexander Vance', 'admin@company.com', passwordHash, 'admin', 'Executive Leadership', 'Bronze', 0.0, 0, null);
  insertUser.run('usr-pm-01', 'Sarah Jenkins', 'pm@company.com', passwordHash, 'procurement_manager', 'Procurement', 'Bronze', 0.0, 0, null);
  insertUser.run('usr-pe-01', 'David Ross', 'pe@company.com', passwordHash, 'procurement_executive', 'Procurement', 'Bronze', 0.0, 0, null);
  insertUser.run('usr-fm-01', 'Elena Rostova', 'finance@company.com', passwordHash, 'finance_manager', 'Finance & Accounting', 'Bronze', 0.0, 0, null);
  insertUser.run('usr-im-01', 'Marcus Brody', 'inventory@company.com', passwordHash, 'inventory_manager', 'Logistics & Warehouse', 'Bronze', 0.0, 0, null);
  
  // Regular B2B Customer (Gold Tier)
  insertUser.run('usr-cust-01', 'Apex Tech Corp (Customer)', 'customer@apex.com', passwordHash, 'customer', 'B2B Buyer Division', 'Gold', 0.10, 245000.0, null);
  
  // B2B Vendor User
  insertUser.run('usr-vend-01', 'Rajesh Sharma (Vendor Rep)', 'vendor@apexsolutions.com', passwordHash, 'vendor', 'Sales & Contracting', 'Bronze', 0.0, 0, 'vnd-01');

  // 2. Seed Vendors (With GSTIN, Owner Details, & Medal Tiers)
  const insertVendor = db.prepare(`
    INSERT INTO vendors (id, name, code, contact_person, email, phone, address, gstin, gstin_verified, owner_name, owner_email, owner_phone, owner_pan, medal_tier, b2b_trust_score, rating, quality_score, delivery_score, payment_terms, supports_emi, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVendor.run(
    'vnd-01',
    'Apex Solutions Private Ltd',
    'VND-APEX-01',
    'Rajesh Sharma',
    'contact@apexsolutions.com',
    '+91 98765 43210',
    'Plot 45, Tech Park, Industrial Corridor, Mumbai, MH',
    '27AAACA1234A1Z5',
    1,
    'Vikramaditya Singhania',
    'owner@apexsolutions.com',
    '+91 98200 11223',
    'ABCDE1234F',
    'Diamond',
    98,
    4.9,
    97.5,
    98.0,
    'Net 60 / EMI Available',
    1,
    'Active'
  );

  insertVendor.run(
    'vnd-02',
    'TechLogix Industrial Components',
    'VND-TLX-02',
    'Ananya Verma',
    'sales@techlogix.com',
    '+91 98111 22334',
    'Sector 62, Cyber Hub, Gurugram, HR',
    '07AAAAA5678B1Z2',
    1,
    'Anil Kumar Verma',
    'ak.verma@techlogix.com',
    '+91 98100 55443',
    'BCDEF2345G',
    'Platinum',
    92,
    4.7,
    94.0,
    95.0,
    'Net 45 / EMI Available',
    1,
    'Active'
  );

  insertVendor.run(
    'vnd-03',
    'Global Precision Hardware',
    'VND-GPH-03',
    'Michael Chang',
    'info@globalprecision.com',
    '+91 97222 33445',
    'Ambattur Industrial Estate, Chennai, TN',
    '33BBBBA9876C1Z9',
    1,
    'Santhanam Ramanujam',
    'owner@globalprecision.com',
    '+91 94440 99887',
    'CDEFG3456H',
    'Gold',
    84,
    4.4,
    89.0,
    91.0,
    'Net 30',
    1,
    'Active'
  );

  insertVendor.run(
    'vnd-04',
    'Nexus Electronics & Automation',
    'VND-NEX-04',
    'Priya Nair',
    'orders@nexuselectronics.com',
    '+91 96333 44556',
    'Electronic City Phase 1, Bengaluru, KA',
    '19CCCCA4321D1Z4',
    1,
    'Kishore Nair',
    'knair@nexuselectronics.com',
    '+91 98450 77665',
    'DEFGH4567I',
    'Silver',
    76,
    4.1,
    82.0,
    85.0,
    'Net 15',
    0,
    'Active'
  );

  insertVendor.run(
    'vnd-05',
    'Metro Supplies & Spares',
    'VND-MET-05',
    'Suresh Gupta',
    'metro.supplies@gmail.com',
    '+91 95444 55667',
    'GIDC Industrial Area, Ahmedabad, GJ',
    '09DDDDA1111E1Z0',
    0,
    'Suresh Chand Gupta',
    'suresh.gupta@metro.com',
    '+91 98250 33221',
    'EFGHI5678J',
    'Bronze',
    62,
    3.6,
    74.0,
    78.0,
    'Advance Payment Required',
    0,
    'Active'
  );

  // 3. Seed Products
  const insertProduct = db.prepare(`
    INSERT INTO products (id, sku, name, category, description, unit, unit_price, stock_quantity, incoming_stock, reorder_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProduct.run('prd-01', 'SKU-SRV-900', 'Enterprise AI Control Server 4U', 'Hardware & IT', 'High-performance dual Xeon server rack unit with GPU accelerator slots for AI inference', 'Units', 125000.0, 18, 10, 5);
  insertProduct.run('prd-02', 'SKU-SNS-400', 'High-Precision Laser Distance Sensor Array', 'Automation & Sensors', 'IP67 industrial optical sensor array with micro-millimeter precision tracking', 'Kits', 28500.0, 42, 25, 10);
  insertProduct.run('prd-03', 'SKU-PWR-850', 'Heavy Duty Industrial Power Inverter 100kVA', 'Electrical', 'Three-phase modular UPS inverter with active surge protection & grid synchronization', 'Units', 89000.0, 6, 4, 3);
  insertProduct.run('prd-04', 'SKU-NET-600', 'Fiber Optic Managed Switch 48-Port 10G', 'Networking', 'Layer-3 enterprise core switch with dual hot-swappable power supply units', 'Units', 45000.0, 14, 0, 4);
  insertProduct.run('prd-05', 'SKU-CNC-100', 'High Torque Stepper Motor CNC Controller Kit', 'Machinery', '5-Axis digital CNC servo motor drive kit with emergency stop safety relay', 'Sets', 62000.0, 9, 5, 2);

  // 4. Seed RFQs
  const insertRFQ = db.prepare(`
    INSERT INTO rfqs (id, rfq_number, title, product_id, quantity, target_price, specifications, required_delivery_date, payment_terms, status, customer_id, applied_discount_rate, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertRFQ.run('rfq-01', 'RFQ-2026-001', 'Procurement of 10 Enterprise AI Control Servers', 'prd-01', 10, 120000.0, 'Dual Intel Xeon Platinum 8480+, 512GB DDR5 ECC RAM, 4x 3.84TB NVMe SSDs, Redundant 1600W PSUs', '2026-09-15', 'Net 45 / EMI', 'Quotes Received', 'usr-cust-01', 0.10, 'usr-pm-01');
  insertRFQ.run('rfq-02', 'RFQ-2026-002', 'Bulk Order Laser Sensor Arrays for Factory Expansion', 'prd-02', 25, 17500.0, 'IP67 enclosure, RS485 Modbus output, calibration certificate included', '2026-09-30', 'Net 30', 'Quotes Received', null, 0.0, 'usr-pe-01');
  insertRFQ.run('rfq-03', 'RFQ-2026-003', '3-Phase Heavy Duty Power Inverters 100kVA', 'prd-03', 4, 230000.0, '100kVA nominal output, 5-year comprehensive warranty, on-site commissioning required', '2026-10-05', 'Net 60 / EMI', 'Open', null, 0.0, 'usr-pm-01');

  // Assign Vendors to RFQs
  const insertRFQVendor = db.prepare(`
    INSERT INTO rfq_vendors (id, rfq_id, vendor_id, status)
    VALUES (?, ?, ?, ?)
  `);

  insertRFQVendor.run('rfq-v-01', 'rfq-01', 'vnd-01', 'Submitted');
  insertRFQVendor.run('rfq-v-02', 'rfq-01', 'vnd-02', 'Submitted');
  insertRFQVendor.run('rfq-v-03', 'rfq-01', 'vnd-03', 'Submitted');
  insertRFQVendor.run('rfq-v-04', 'rfq-02', 'vnd-01', 'Submitted');
  insertRFQVendor.run('rfq-v-05', 'rfq-02', 'vnd-04', 'Submitted');

  // 5. Seed Quotations (With AI Extracted Fields & Scoring)
  const insertQuote = db.prepare(`
    INSERT INTO quotations (id, quotation_number, rfq_id, vendor_id, file_path, file_name, unit_price, tax_rate, tax_amount, total_amount, lead_time_days, warranty_period_months, payment_terms, supports_emi, quality_cert, ai_extracted, ai_confidence, ai_score, ai_recommendation_reason, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // RFQ 1 Quotes
  insertQuote.run(
    'qte-01',
    'QT-APEX-9001',
    'rfq-01',
    'vnd-01', // Diamond Tier Vendor
    'uploads/quotes/apex_quotation_rfq01.pdf',
    'apex_quotation_rfq01.pdf',
    118000.0, // Unit Price (Lowest & Diamond Tier)
    18.0,
    212400.0,
    1392400.0, // 10 units = 1,180,000 + 212,400 tax
    12, // Lead time 12 days
    24, // 24 Months Warranty
    'Net 60 / EMI Available',
    1,
    'ISO 9001:2015 & CE Certified',
    1,
    0.98,
    94.5,
    '🏆 RECOMMENDED WINNER: Apex Solutions offers the lowest unit price (₹118,000), superior Diamond B2B Trust rating (98%), extended 24-month warranty, zero-downpayment EMI support, and fast 12-day delivery.',
    'Selected'
  );

  insertQuote.run(
    'qte-02',
    'QT-TLX-8820',
    'rfq-01',
    'vnd-02', // Platinum Tier Vendor
    'uploads/quotes/techlogix_quotation_rfq01.pdf',
    'techlogix_quotation_rfq01.pdf',
    122000.0,
    18.0,
    219600.0,
    1439600.0,
    15,
    18,
    'Net 45 / EMI Available',
    1,
    'ISO 9001 & UL Listed',
    1,
    0.95,
    88.2,
    'STRONG CONTENDER: TechLogix provides highly reliable hardware backed by Platinum B2B Trust Tier (92%) and 18-month warranty, but has a 3.4% higher unit cost than Apex.',
    'Pending'
  );

  insertQuote.run(
    'qte-03',
    'QT-GPH-4411',
    'rfq-01',
    'vnd-03', // Gold Tier Vendor
    'uploads/quotes/global_quotation_rfq01.pdf',
    'global_quotation_rfq01.pdf',
    129000.0,
    18.0,
    232200.0,
    1522200.0,
    20,
    12,
    'Net 30',
    0,
    'ISO 9001 Certified',
    1,
    0.92,
    79.0,
    'ACCEPTABLE: Higher price point (₹129,000) and longer lead time (20 days) with no EMI option.',
    'Pending'
  );

  // RFQ 2 Quotes
  insertQuote.run(
    'qte-04',
    'QT-APEX-9002',
    'rfq-02',
    'vnd-01',
    'uploads/quotes/apex_sensors_rfq02.pdf',
    'apex_sensors_rfq02.pdf',
    27000.0,
    18.0,
    121500.0,
    796500.0,
    8,
    24,
    'Net 60',
    1,
    'ISO 9001:2015 & IP67 Rated',
    1,
    0.97,
    93.8,
    'RECOMMENDED: Apex Solutions provides competitive pricing (₹27,000 vs ₹29,500) and fastest delivery (8 days).',
    'Selected'
  );

  // 6. Seed Purchase Orders
  const insertPO = db.prepare(`
    INSERT INTO purchase_orders (id, po_number, rfq_id, quotation_id, vendor_id, product_id, customer_id, quantity, unit_price, subtotal, discount_amount, tax_amount, total_amount, payment_terms, is_emi, emi_tenure_months, delivery_date, shipping_address, status, approved_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // PO 1 from RFQ 1 (Apex Solutions, customer discount applied)
  insertPO.run(
    'po-01',
    'PO-2026-8801',
    'rfq-01',
    'qte-01',
    'vnd-01',
    'prd-01',
    'usr-cust-01',
    10,
    118000.0,
    1180000.0,
    118000.0, // 10% Gold Customer Discount = ₹118,000
    191160.0, // Tax on discounted subtotal
    1253160.0,
    'EMI 6 Months @ 12% p.a.',
    1,
    6,
    '2026-09-15',
    'Apex Tech Center, Block B, Tech Corridor, Bangalore, KA - 560100',
    'Approved',
    'usr-pm-01'
  );

  // 7. Seed Invoices & EMI Schedules
  const insertInvoice = db.prepare(`
    INSERT INTO invoices (id, invoice_number, po_id, vendor_id, customer_id, subtotal, tax_amount, total_amount, due_date, payment_method, is_emi, status, payment_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertInvoice.run(
    'inv-01',
    'INV-APEX-2026-01',
    'po-01',
    'vnd-01',
    'usr-cust-01',
    1062000.0,
    191160.0,
    1253160.0,
    '2026-10-05',
    'EMI Finance (6 Months)',
    1,
    'Approved',
    null
  );

  // EMI Repayment Schedule (6 Months)
  const insertEMI = db.prepare(`
    INSERT INTO emi_schedules (id, invoice_id, po_id, vendor_id, total_amount, principal_amount, down_payment, interest_rate_annual, tenure_months, monthly_emi_amount, emi_start_date, interest_due_day_of_month, paid_installments, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Formula EMI: ₹1,253,160 over 6 months at 12% p.a. approx = ₹216,140/mo
  insertEMI.run(
    'emi-01',
    'inv-01',
    'po-01',
    'vnd-01',
    1253160.0,
    1253160.0,
    0.0,
    12.0,
    6,
    216140.0,
    '2026-10-05',
    5,
    1, // 1 installment paid
    'Active'
  );

  // 8. Seed Warranty Claims
  const insertWarranty = db.prepare(`
    INSERT INTO warranty_claims (id, claim_number, po_id, vendor_id, product_id, item_serial_number, issue_description, claim_amount, status, filed_date, resolution_date, resolution_notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertWarranty.run(
    'wrt-01',
    'WC-2026-0042',
    'po-01',
    'vnd-01',
    'prd-01',
    'SN-SRV-900-8841',
    'Power Supply Module PSU-2 unit failed during thermal stress testing. Requesting rapid replacement module under 24-month comprehensive warranty.',
    4500.0,
    'Under Review',
    '2026-08-18',
    null,
    'Vendor tech team dispatched replacement module via air freight.',
    'usr-cust-01'
  );

  // 9. Seed Discount Offers
  const insertDiscount = db.prepare(`
    INSERT INTO discount_offers (id, code, title, discount_percent, min_order_amount, applicable_tier, valid_until, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDiscount.run('disc-01', 'REGULAR10', 'Regular Customer Gold Privilege Offer', 10.0, 50000.0, 'Gold', '2026-12-31', 'Active');
  insertDiscount.run('disc-02', 'PLATINUM15', 'Platinum VIP Enterprise Buyer Rebate', 15.0, 100000.0, 'Platinum', '2026-12-31', 'Active');
  insertDiscount.run('disc-03', 'SILVER5', 'Silver Member Welcome Discount', 5.0, 25000.0, 'Silver', '2026-12-31', 'Active');

  // 10. Seed Audit Logs
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run('aud-01', 'usr-admin-01', 'Alexander Vance', 'SYSTEM_INIT', 'DATABASE', 'ALL', 'Procurement ERP System initialized with 5 Vendors, 5 Products, GSTIN Verification & AI Recommendation Engine.');
  insertAudit.run('aud-02', 'usr-pm-01', 'Sarah Jenkins', 'RFQ_CREATED', 'RFQ', 'rfq-01', 'Created RFQ-2026-001 for 10 Enterprise AI Control Servers.');
  insertAudit.run('aud-03', 'usr-pe-01', 'David Ross', 'AI_QUOTE_PARSED', 'QUOTATION', 'qte-01', 'AI Extracted quote data from apex_quotation_rfq01.pdf with 98% confidence score.');
  insertAudit.run('aud-04', 'usr-pm-01', 'Sarah Jenkins', 'PO_GENERATED', 'PURCHASE_ORDER', 'po-01', 'Approved PO-2026-8801 for Apex Solutions (Diamond Tier) with 10% Gold Customer Discount.');

  console.log('✅ Procurement ERP Database successfully seeded!');
}

seedDatabase();
