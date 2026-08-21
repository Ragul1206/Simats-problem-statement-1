-- Supabase / PostgreSQL Schema for Procurement ERP Database

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer',
  department VARCHAR(255),
  customer_tier VARCHAR(50) DEFAULT 'Bronze',
  discount_rate NUMERIC(5,2) DEFAULT 0.0,
  total_spent NUMERIC(15,2) DEFAULT 0.0,
  vendor_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  gstin VARCHAR(50),
  gstin_verified INTEGER DEFAULT 0,
  owner_name VARCHAR(255),
  owner_email VARCHAR(255),
  owner_phone VARCHAR(50),
  owner_pan VARCHAR(50),
  medal_tier VARCHAR(50) DEFAULT 'Bronze',
  b2b_trust_score NUMERIC(5,2) DEFAULT 70.0,
  rating NUMERIC(3,2) DEFAULT 4.0,
  quality_score NUMERIC(5,2) DEFAULT 80.0,
  delivery_score NUMERIC(5,2) DEFAULT 80.0,
  payment_terms VARCHAR(255),
  supports_emi INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  unit VARCHAR(50) DEFAULT 'Units',
  unit_price NUMERIC(15,2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  incoming_stock INT DEFAULT 0,
  reorder_level INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RFQs Table
CREATE TABLE IF NOT EXISTS rfqs (
  id VARCHAR(255) PRIMARY KEY,
  rfq_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  specifications TEXT,
  required_delivery_date DATE,
  payment_terms VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Open',
  customer_id VARCHAR(255),
  applied_discount_rate NUMERIC(5,2) DEFAULT 0.0,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RFQ Vendors Table
CREATE TABLE IF NOT EXISTS rfq_vendors (
  id VARCHAR(255) PRIMARY KEY,
  rfq_id VARCHAR(255) REFERENCES rfqs(id) ON DELETE CASCADE,
  vendor_id VARCHAR(255) REFERENCES vendors(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
  id VARCHAR(255) PRIMARY KEY,
  quotation_number VARCHAR(100) UNIQUE NOT NULL,
  rfq_id VARCHAR(255) REFERENCES rfqs(id) ON DELETE CASCADE,
  vendor_id VARCHAR(255) REFERENCES vendors(id) ON DELETE CASCADE,
  file_path TEXT,
  file_name TEXT,
  unit_price NUMERIC(15,2) NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 18.0,
  tax_amount NUMERIC(15,2) DEFAULT 0.0,
  total_amount NUMERIC(15,2) NOT NULL,
  lead_time_days INT DEFAULT 7,
  warranty_period_months INT DEFAULT 12,
  payment_terms VARCHAR(255),
  supports_emi INTEGER DEFAULT 0,
  quality_cert VARCHAR(255),
  ai_extracted INTEGER DEFAULT 0,
  ai_confidence NUMERIC(5,2) DEFAULT 0.0,
  ai_score NUMERIC(5,2) DEFAULT 0.0,
  ai_recommendation_reason TEXT,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id VARCHAR(255) PRIMARY KEY,
  po_number VARCHAR(100) UNIQUE NOT NULL,
  rfq_id VARCHAR(255) REFERENCES rfqs(id) ON DELETE SET NULL,
  quotation_id VARCHAR(255) REFERENCES quotations(id) ON DELETE SET NULL,
  vendor_id VARCHAR(255) REFERENCES vendors(id) ON DELETE CASCADE,
  product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  customer_id VARCHAR(255),
  quantity INT NOT NULL,
  unit_price NUMERIC(15,2) NOT NULL,
  subtotal NUMERIC(15,2) NOT NULL,
  discount_amount NUMERIC(15,2) DEFAULT 0.0,
  tax_amount NUMERIC(15,2) DEFAULT 0.0,
  total_amount NUMERIC(15,2) NOT NULL,
  payment_terms VARCHAR(255),
  is_emi INTEGER DEFAULT 0,
  emi_tenure_months INT DEFAULT 0,
  delivery_date DATE,
  shipping_address TEXT,
  status VARCHAR(50) DEFAULT 'Created',
  approved_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(255) PRIMARY KEY,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  po_id VARCHAR(255) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  vendor_id VARCHAR(255) REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id VARCHAR(255),
  subtotal NUMERIC(15,2) NOT NULL,
  tax_amount NUMERIC(15,2) DEFAULT 0.0,
  total_amount NUMERIC(15,2) NOT NULL,
  due_date DATE,
  payment_method VARCHAR(100),
  is_emi INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Pending',
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. EMI Schedules Table
CREATE TABLE IF NOT EXISTS emi_schedules (
  id VARCHAR(255) PRIMARY KEY,
  invoice_id VARCHAR(255) REFERENCES invoices(id) ON DELETE CASCADE,
  po_id VARCHAR(255) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  vendor_id VARCHAR(255) REFERENCES vendors(id) ON DELETE CASCADE,
  total_amount NUMERIC(15,2) NOT NULL,
  principal_amount NUMERIC(15,2) NOT NULL,
  down_payment NUMERIC(15,2) DEFAULT 0.0,
  interest_rate_annual NUMERIC(5,2) DEFAULT 0.0,
  tenure_months INT NOT NULL,
  monthly_emi_amount NUMERIC(15,2) NOT NULL,
  emi_start_date DATE,
  interest_due_day_of_month INT DEFAULT 5,
  paid_installments INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Warranty Claims Table
CREATE TABLE IF NOT EXISTS warranty_claims (
  id VARCHAR(255) PRIMARY KEY,
  claim_number VARCHAR(100) UNIQUE NOT NULL,
  po_id VARCHAR(255) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  vendor_id VARCHAR(255) REFERENCES vendors(id) ON DELETE CASCADE,
  product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  item_serial_number VARCHAR(100),
  issue_description TEXT,
  claim_amount NUMERIC(15,2) DEFAULT 0.0,
  status VARCHAR(50) DEFAULT 'Filed',
  filed_date DATE DEFAULT CURRENT_DATE,
  resolution_date DATE,
  resolution_notes TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Discount Offers Table
CREATE TABLE IF NOT EXISTS discount_offers (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL,
  min_order_amount NUMERIC(15,2) DEFAULT 0.0,
  applicable_tier VARCHAR(50) DEFAULT 'All',
  valid_until DATE,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Inventory Transactions Table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  reference_type VARCHAR(50),
  reference_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  user_name VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
