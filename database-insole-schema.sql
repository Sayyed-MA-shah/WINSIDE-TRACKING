-- INSOLE INVENTORY DATABASE SCHEMA
-- Separate tables for insole clinic inventory management

-- Insole Categories Table
CREATE TABLE IF NOT EXISTS insole_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insole Products Table  
CREATE TABLE IF NOT EXISTS insole_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  brand VARCHAR(255),
  taxable BOOLEAN DEFAULT true,
  attributes JSONB DEFAULT '[]',
  media_main TEXT,
  archived BOOLEAN DEFAULT false,
  wholesale DECIMAL(10,2) DEFAULT 0,
  retail DECIMAL(10,2) DEFAULT 0,
  club DECIMAL(10,2) DEFAULT 0,
  cost_before DECIMAL(10,2) DEFAULT 0,
  cost_after DECIMAL(10,2) DEFAULT 0,
  variants JSONB DEFAULT '[]',
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insole Customers Table
CREATE TABLE IF NOT EXISTS insole_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'UK',
  tax_number VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insole Invoices Table
CREATE TABLE IF NOT EXISTS insole_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  po_number VARCHAR(50),
  customer_id VARCHAR(50) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  paid_amount DECIMAL(10,2) DEFAULT 0,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insole Users Table (for authentication)
CREATE TABLE IF NOT EXISTS insole_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_insole_products_article ON insole_products(article);
CREATE INDEX IF NOT EXISTS idx_insole_products_category ON insole_products(category);
CREATE INDEX IF NOT EXISTS idx_insole_customers_customer_id ON insole_customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_insole_invoices_number ON insole_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_insole_invoices_customer ON insole_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_insole_invoices_date ON insole_invoices(date);
CREATE INDEX IF NOT EXISTS idx_insole_users_username ON insole_users(username);
CREATE INDEX IF NOT EXISTS idx_insole_users_email ON insole_users(email);

-- Insert default insole categories
INSERT INTO insole_categories (name, description, color) VALUES
('Orthotics', 'Custom orthotic insoles', '#10B981'),
('Comfort', 'Comfort and cushioning insoles', '#3B82F6'),
('Sport', 'Athletic and sports insoles', '#F59E0B'),
('Medical', 'Medical grade insoles', '#EF4444'),
('Arch Support', 'Arch support insoles', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- Insert default insole admin user (password should be hashed in real implementation)
-- Password: 'insole123' - should be properly hashed
INSERT INTO insole_users (username, email, password_hash, full_name, role) VALUES
('insole_admin', 'admin@insoleclinic.com', '$2b$10$example_hash_replace_with_real', 'Insole Clinic Admin', 'admin')
ON CONFLICT (username) DO NOTHING;