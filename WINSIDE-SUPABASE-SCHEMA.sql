-- WINSIDE Complete Database Schema for Supabase
-- Execute this in Supabase SQL Editor to create all required tables
-- This replaces any existing schema files

-- Drop existing tables if they exist (optional - remove these lines if you want to keep existing data)
-- DROP TABLE IF EXISTS invoice_items CASCADE;
-- DROP TABLE IF EXISTS invoices CASCADE;
-- DROP TABLE IF EXISTS variants CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS customers CASCADE;

-- 1. Customers table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    company TEXT,
    address TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('retail', 'wholesale', 'club')),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    article TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT NOT NULL CHECK (brand IN ('greenhil', 'harican', 'byko')),
    taxable BOOLEAN DEFAULT TRUE,
    attributes TEXT[] DEFAULT '{}',
    media_main TEXT,
    archived BOOLEAN DEFAULT FALSE,
    wholesale DECIMAL(10,2) NOT NULL,
    retail DECIMAL(10,2) NOT NULL,
    club DECIMAL(10,2) NOT NULL,
    cost_before DECIMAL(10,2) NOT NULL,
    cost_after DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Variants table
CREATE TABLE IF NOT EXISTS variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    attributes JSONB DEFAULT '{}',
    qty INTEGER DEFAULT 0,
    wholesale DECIMAL(10,2),
    retail DECIMAL(10,2),
    club DECIMAL(10,2),
    cost_before DECIMAL(10,2),
    cost_after DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(id),
    invoice_number TEXT UNIQUE,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'overdue')),
    payment_method TEXT,
    discount DECIMAL(10,2) DEFAULT 0.00,
    tax DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Invoice Items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id),
    variant_id TEXT REFERENCES variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(type);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_article ON products(article);

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON variants(sku);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_variant_id ON invoice_items(variant_id);

-- Insert sample data (optional - remove if you don't want sample data)
INSERT INTO customers (id, name, phone, address, type, created_at) VALUES
('cust-sample-1', 'John Doe', '+1234567890', '123 Main St, City', 'retail', NOW()),
('cust-sample-2', 'ABC Company', '+1987654321', '456 Business Ave, City', 'wholesale', NOW()),
('cust-sample-3', 'XYZ Club', '+1122334455', '789 Club Lane, City', 'club', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (
    id, article, title, category, brand, wholesale, retail, club, 
    cost_before, cost_after, created_at
) VALUES
('prod-sample-1', 'BGC-1001', 'Green Hill Protein Powder', 'Supplements', 'greenhil', 25.00, 35.00, 30.00, 20.00, 22.00, NOW()),
('prod-sample-2', 'HAR-2001', 'Harican Energy Drink', 'Beverages', 'harican', 3.00, 5.00, 4.00, 2.00, 2.50, NOW()),
('prod-sample-3', 'BYK-3001', 'Byko Vitamin Complex', 'Vitamins', 'byko', 15.00, 25.00, 20.00, 12.00, 14.00, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO variants (
    id, product_id, sku, attributes, qty, created_at
) VALUES
('var-sample-1', 'prod-sample-1', 'BGC-1001-1KG', '{"size": "1kg", "flavor": "vanilla"}', 100, NOW()),
('var-sample-2', 'prod-sample-1', 'BGC-1001-2KG', '{"size": "2kg", "flavor": "vanilla"}', 50, NOW()),
('var-sample-3', 'prod-sample-2', 'HAR-2001-250ML', '{"size": "250ml", "flavor": "original"}', 200, NOW()),
('var-sample-4', 'prod-sample-3', 'BYK-3001-60TAB', '{"size": "60 tablets", "type": "regular"}', 150, NOW())
ON CONFLICT (id) DO NOTHING;

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variants_updated_at BEFORE UPDATE ON variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'WINSIDE database schema created successfully! 🎉' AS status;
