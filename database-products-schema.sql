-- Products Table Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    article VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(50) NOT NULL CHECK (brand IN ('greenhil', 'harican', 'byko')),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_article ON products(article);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_archived ON products(archived);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for products
DROP POLICY IF EXISTS "Allow all product operations" ON products;
CREATE POLICY "Allow all product operations" ON products
FOR ALL USING (true);

-- Create customers table if it doesn't exist (needed for the application)
-- Drop the table if it exists with wrong UUID type, then recreate
DROP TABLE IF EXISTS customers CASCADE;
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    address TEXT,
    type VARCHAR(20) CHECK (type IN ('retail', 'wholesale', 'club')) DEFAULT 'retail',
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy for customers
DROP POLICY IF EXISTS "Allow all customer operations" ON customers;
CREATE POLICY "Allow all customer operations" ON customers
FOR ALL USING (true);

-- Insert a default customer if none exists
INSERT INTO customers (id, name, email, phone, company, address, type, total_orders, total_spent) VALUES
('CUST-001', 'John Doe', 'john.doe@example.com', '+1-234-567-8900', 'Doe Enterprises', '123 Main St, City, State 12345', 'retail', 5, 750.00)
ON CONFLICT (id) DO NOTHING;

-- Insert some sample products for testing
INSERT INTO products (article, title, category, brand, taxable, attributes, wholesale, retail, club, cost_before, cost_after, variants) VALUES
('BGC-1011', 'Boxing Gloves Classic', 'Boxing Gloves', 'greenhil', true, '["Size", "Color"]', 55.00, 79.99, 67.99, 42.00, 48.00, '[
  {
    "id": "var-001",
    "productId": "BGC-1011",
    "sku": "BGC-1011-10oz-RED",
    "attributes": {"Size": "10oz", "Color": "RED"},
    "qty": 15
  },
  {
    "id": "var-002", 
    "productId": "BGC-1011",
    "sku": "BGC-1011-12oz-BLUE",
    "attributes": {"Size": "12oz", "Color": "BLUE"},
    "qty": 20
  }
]'),
('MT-2001', 'Muay Thai Shorts', 'Apparel', 'harican', true, '["Size", "Color"]', 25.00, 39.99, 32.99, 18.00, 22.00, '[
  {
    "id": "var-003",
    "productId": "MT-2001", 
    "sku": "MT-2001-M-BLACK",
    "attributes": {"Size": "M", "Color": "BLACK"},
    "qty": 8
  }
]'),
('TR-3001', 'Training Pads', 'Training Equipment', 'byko', true, '["Type"]', 35.00, 49.99, 42.99, 28.00, 32.00, '[
  {
    "id": "var-004",
    "productId": "TR-3001",
    "sku": "TR-3001-FOCUS",
    "attributes": {"Type": "Focus Pads"},
    "qty": 12
  }
]')
ON CONFLICT (article) DO NOTHING;
