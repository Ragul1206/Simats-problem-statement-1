const supabase = require('./supabaseClient');
const bcrypt = require('bcryptjs');

async function seedSupabase() {
  console.log('🌱 Starting Supabase Database Seeding...');

  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseKey || supabaseKey === 'YOUR_SUPABASE_ANON_KEY' || supabaseKey === 'YOUR_SUPABASE_SERVICE_ROLE_KEY') {
    console.error('\n❌ ERROR: Supabase API Key is missing or set to placeholder in backend/.env!');
    console.error('👉 Please paste your actual Supabase Anon or Service Role key into backend/.env:');
    console.error('   SUPABASE_ANON_KEY=eyJhbGciOi...\n');
    console.error('📍 Where to find your key:');
    console.error('   Open https://supabase.com/dashboard/project/fmbkkuccbkkmnighvopg/settings/api');
    console.error('   Copy the "anon" (public) or "service_role" (secret) key.\n');
    process.exit(1);
  }

  const passwordHash = bcrypt.hashSync('password123', 10);

  // 1. Seed Users
  console.log('Inserting Users...');
  const users = [
    { id: 'usr-admin-01', name: 'Alexander Vance', email: 'admin@company.com', password_hash: passwordHash, role: 'admin', department: 'Executive Leadership', customer_tier: 'Bronze', discount_rate: 0.0, total_spent: 0, vendor_id: null },
    { id: 'usr-pm-01', name: 'Sarah Jenkins', email: 'pm@company.com', password_hash: passwordHash, role: 'procurement_manager', department: 'Procurement', customer_tier: 'Bronze', discount_rate: 0.0, total_spent: 0, vendor_id: null },
    { id: 'usr-pe-01', name: 'David Ross', email: 'pe@company.com', password_hash: passwordHash, role: 'procurement_executive', department: 'Procurement', customer_tier: 'Bronze', discount_rate: 0.0, total_spent: 0, vendor_id: null },
    { id: 'usr-fm-01', name: 'Elena Rostova', email: 'finance@company.com', password_hash: passwordHash, role: 'finance_manager', department: 'Finance & Accounting', customer_tier: 'Bronze', discount_rate: 0.0, total_spent: 0, vendor_id: null },
    { id: 'usr-im-01', name: 'Marcus Brody', email: 'inventory@company.com', password_hash: passwordHash, role: 'inventory_manager', department: 'Logistics & Warehouse', customer_tier: 'Bronze', discount_rate: 0.0, total_spent: 0, vendor_id: null },
    { id: 'usr-cust-01', name: 'Apex Tech Corp (Customer)', email: 'customer@apex.com', password_hash: passwordHash, role: 'customer', department: 'B2B Buyer Division', customer_tier: 'Gold', discount_rate: 0.10, total_spent: 245000.0, vendor_id: null },
    { id: 'usr-vend-01', name: 'Rajesh Sharma (Vendor Rep)', email: 'vendor@apexsolutions.com', password_hash: passwordHash, role: 'vendor', department: 'Sales & Contracting', customer_tier: 'Bronze', discount_rate: 0.0, total_spent: 0, vendor_id: 'vnd-01' }
  ];
  const { error: userErr } = await supabase.from('users').upsert(users);
  if (userErr) {
    console.error('❌ Error inserting users:', userErr.message);
    if (userErr.message.includes('API key') || userErr.message.includes('JWT')) {
      console.error('👉 Make sure you copied your valid Anon Key or Service Role Key into backend/.env');
      process.exit(1);
    }
  } else {
    console.log('✅ Users inserted successfully.');
  }

  // 2. Seed Vendors
  console.log('Inserting Vendors...');
  const vendors = [
    { id: 'vnd-01', name: 'Apex Solutions Private Ltd', code: 'VND-APEX-01', contact_person: 'Rajesh Sharma', email: 'contact@apexsolutions.com', phone: '+91 98765 43210', address: 'Plot 45, Tech Park, Industrial Corridor, Mumbai, MH', gstin: '27AAACA1234A1Z5', gstin_verified: 1, owner_name: 'Vikramaditya Singhania', owner_email: 'owner@apexsolutions.com', owner_phone: '+91 98200 11223', owner_pan: 'ABCDE1234F', medal_tier: 'Diamond', b2b_trust_score: 98, rating: 4.9, quality_score: 97.5, delivery_score: 98.0, payment_terms: 'Net 60 / EMI Available', supports_emi: 1, status: 'Active' },
    { id: 'vnd-02', name: 'TechLogix Industrial Components', code: 'VND-TLX-02', contact_person: 'Ananya Verma', email: 'sales@techlogix.com', phone: '+91 98111 22334', address: 'Sector 62, Cyber Hub, Gurugram, HR', gstin: '07AAAAA5678B1Z2', gstin_verified: 1, owner_name: 'Anil Kumar Verma', owner_email: 'ak.verma@techlogix.com', owner_phone: '+91 98100 55443', owner_pan: 'BCDEF2345G', medal_tier: 'Platinum', b2b_trust_score: 92, rating: 4.7, quality_score: 94.0, delivery_score: 95.0, payment_terms: 'Net 45 / EMI Available', supports_emi: 1, status: 'Active' },
    { id: 'vnd-03', name: 'Global Precision Hardware', code: 'VND-GPH-03', contact_person: 'Michael Chang', email: 'info@globalprecision.com', phone: '+91 97222 33445', address: 'Ambattur Industrial Estate, Chennai, TN', gstin: '33BBBBA9876C1Z9', gstin_verified: 1, owner_name: 'Santhanam Ramanujam', owner_email: 'owner@globalprecision.com', owner_phone: '+91 94440 99887', owner_pan: 'CDEFG3456H', medal_tier: 'Gold', b2b_trust_score: 84, rating: 4.4, quality_score: 89.0, delivery_score: 91.0, payment_terms: 'Net 30', supports_emi: 1, status: 'Active' },
    { id: 'vnd-04', name: 'Nexus Electronics & Automation', code: 'VND-NEX-04', contact_person: 'Priya Nair', email: 'orders@nexuselectronics.com', phone: '+91 96333 44556', address: 'Electronic City Phase 1, Bengaluru, KA', gstin: '19CCCCA4321D1Z4', gstin_verified: 1, owner_name: 'Kishore Nair', owner_email: 'knair@nexuselectronics.com', owner_phone: '+91 98450 77665', owner_pan: 'DEFGH4567I', medal_tier: 'Silver', b2b_trust_score: 76, rating: 4.1, quality_score: 82.0, delivery_score: 85.0, payment_terms: 'Net 15', supports_emi: 0, status: 'Active' },
    { id: 'vnd-05', name: 'Metro Supplies & Spares', code: 'VND-MET-05', contact_person: 'Suresh Gupta', email: 'metro.supplies@gmail.com', phone: '+91 95444 55667', address: 'GIDC Industrial Area, Ahmedabad, GJ', gstin: '09DDDDA1111E1Z0', gstin_verified: 0, owner_name: 'Suresh Chand Gupta', owner_email: 'suresh.gupta@metro.com', owner_phone: '+91 98250 33221', owner_pan: 'EFGHI5678J', medal_tier: 'Bronze', b2b_trust_score: 62, rating: 3.6, quality_score: 74.0, delivery_score: 78.0, payment_terms: 'Advance Payment Required', supports_emi: 0, status: 'Active' }
  ];
  const { error: vendErr } = await supabase.from('vendors').upsert(vendors);
  if (vendErr) console.error('❌ Error inserting vendors:', vendErr.message);
  else console.log('✅ Vendors inserted successfully.');

  // 3. Seed Products
  console.log('Inserting Products...');
  const products = [
    { id: 'prd-01', sku: 'SKU-SRV-900', name: 'Enterprise AI Control Server 4U', category: 'Hardware & IT', description: 'High-performance dual Xeon server rack unit with GPU accelerator slots for AI inference', unit: 'Units', unit_price: 125000.0, stock_quantity: 18, incoming_stock: 10, reorder_level: 5 },
    { id: 'prd-02', sku: 'SKU-SNS-400', name: 'High-Precision Laser Distance Sensor Array', category: 'Automation & Sensors', description: 'IP67 industrial optical sensor array with micro-millimeter precision tracking', unit: 'Kits', unit_price: 28500.0, stock_quantity: 42, incoming_stock: 25, reorder_level: 10 },
    { id: 'prd-03', sku: 'SKU-PWR-850', name: 'Heavy Duty Industrial Power Inverter 100kVA', category: 'Electrical', description: 'Three-phase modular UPS inverter with active surge protection & grid synchronization', unit: 'Units', unit_price: 89000.0, stock_quantity: 6, incoming_stock: 4, reorder_level: 3 },
    { id: 'prd-04', sku: 'SKU-NET-600', name: 'Fiber Optic Managed Switch 48-Port 10G', category: 'Networking', description: 'Layer-3 enterprise core switch with dual hot-swappable power supply units', unit: 'Units', unit_price: 45000.0, stock_quantity: 14, incoming_stock: 0, reorder_level: 4 },
    { id: 'prd-05', sku: 'SKU-CNC-100', name: 'High Torque Stepper Motor CNC Controller Kit', category: 'Machinery', description: '5-Axis digital CNC servo motor drive kit with emergency stop safety relay', unit: 'Sets', unit_price: 62000.0, stock_quantity: 9, incoming_stock: 5, reorder_level: 2 }
  ];
  const { error: prodErr } = await supabase.from('products').upsert(products);
  if (prodErr) console.error('❌ Error inserting products:', prodErr.message);
  else console.log('✅ Products inserted successfully.');

  // 4. Seed RFQs
  console.log('Inserting RFQs...');
  const rfqs = [
    { id: 'rfq-01', rfq_number: 'RFQ-2026-001', title: 'Procurement of 10 Enterprise AI Control Servers', product_id: 'prd-01', quantity: 10, specifications: 'Dual Intel Xeon Platinum 8480+, 512GB DDR5 ECC RAM, 4x 3.84TB NVMe SSDs, Redundant 1600W PSUs', required_delivery_date: '2026-09-15', payment_terms: 'Net 45 / EMI', status: 'Quotes Received', customer_id: 'usr-cust-01', applied_discount_rate: 0.10, created_by: 'usr-pm-01' },
    { id: 'rfq-02', rfq_number: 'RFQ-2026-002', title: 'Bulk Order Laser Sensor Arrays for Factory Expansion', product_id: 'prd-02', quantity: 25, specifications: 'IP67 enclosure, RS485 Modbus output, calibration certificate included', required_delivery_date: '2026-09-30', payment_terms: 'Net 30', status: 'Quotes Received', customer_id: null, applied_discount_rate: 0.0, created_by: 'usr-pe-01' },
    { id: 'rfq-03', rfq_number: 'RFQ-2026-003', title: '3-Phase Heavy Duty Power Inverters 100kVA', product_id: 'prd-03', quantity: 4, specifications: '100kVA nominal output, 5-year comprehensive warranty, on-site commissioning required', required_delivery_date: '2026-10-05', payment_terms: 'Net 60 / EMI', status: 'Open', customer_id: null, applied_discount_rate: 0.0, created_by: 'usr-pm-01' }
  ];
  const { error: rfqErr } = await supabase.from('rfqs').upsert(rfqs);
  if (rfqErr) console.error('❌ Error inserting RFQs:', rfqErr.message);
  else console.log('✅ RFQs inserted successfully.');

  // 5. Seed Discount Offers & Audit Logs
  console.log('Inserting Discount Offers & Audit Logs...');
  const discountOffers = [
    { id: 'disc-01', code: 'REGULAR10', title: 'Regular Customer Gold Privilege Offer', discount_percent: 10.0, min_order_amount: 50000.0, applicable_tier: 'Gold', valid_until: '2026-12-31', status: 'Active' },
    { id: 'disc-02', code: 'PLATINUM15', title: 'Platinum VIP Enterprise Buyer Rebate', discount_percent: 15.0, min_order_amount: 100000.0, applicable_tier: 'Platinum', valid_until: '2026-12-31', status: 'Active' },
    { id: 'disc-03', code: 'SILVER5', title: 'Silver Member Welcome Discount', discount_percent: 5.0, min_order_amount: 25000.0, applicable_tier: 'Silver', valid_until: '2026-12-31', status: 'Active' }
  ];
  await supabase.from('discount_offers').upsert(discountOffers);

  const auditLogs = [
    { id: 'aud-01', user_id: 'usr-admin-01', user_name: 'Alexander Vance', action: 'SYSTEM_INIT', entity_type: 'DATABASE', entity_id: 'ALL', details: 'Procurement ERP System initialized with Supabase PostgreSQL connection.' },
    { id: 'aud-02', user_id: 'usr-pm-01', user_name: 'Sarah Jenkins', action: 'RFQ_CREATED', entity_type: 'RFQ', entity_id: 'rfq-01', details: 'Created RFQ-2026-001 for 10 Enterprise AI Control Servers.' }
  ];
  await supabase.from('audit_logs').upsert(auditLogs);

  console.log('🎉 Supabase database seeding completed successfully!');
}

if (require.main === module) {
  seedSupabase().then(() => process.exit(0)).catch(err => {
    console.error('Fatal seed error:', err);
    process.exit(1);
  });
}

module.exports = seedSupabase;
