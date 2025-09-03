-- SAFE Database Schema Update (Preserves Existing Data)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table (safe - won't drop existing)
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

-- SAFE: Add missing columns to existing customers table (won't drop data)
DO $$ 
BEGIN
    -- Add company column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'company') THEN
        ALTER TABLE customers ADD COLUMN company VARCHAR(255);
    END IF;
    
    -- Add type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'type') THEN
        ALTER TABLE customers ADD COLUMN type VARCHAR(20) CHECK (type IN ('retail', 'wholesale', 'club')) DEFAULT 'retail';
    END IF;
    
    -- Add total_orders column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'total_orders') THEN
        ALTER TABLE customers ADD COLUMN total_orders INTEGER DEFAULT 0;
    END IF;
    
    -- Add total_spent column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'total_spent') THEN
        ALTER TABLE customers ADD COLUMN total_spent DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Enable RLS for customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy for customers
DROP POLICY IF EXISTS "Allow all customer operations" ON customers;
CREATE POLICY "Allow all customer operations" ON customers
FOR ALL USING (true);

-- SAFE: Fix invoices table for TEXT customer_id (preserves existing invoices if any)
-- First, let's check if we need to alter the customer_id column type
DO $$
BEGIN
    -- Check if customer_id is not TEXT and change it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'customer_id' 
        AND data_type != 'text'
    ) THEN
        -- Drop foreign key constraints if they exist
        ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_customer_id_fkey;
        
        -- Change customer_id to TEXT
        ALTER TABLE invoices ALTER COLUMN customer_id TYPE TEXT;
    END IF;
    
    -- Add paid_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'paid_amount') THEN
        ALTER TABLE invoices ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Create invoices table if it doesn't exist at all
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id TEXT NOT NULL, -- Use TEXT to match our VARCHAR customer IDs
    customer_name VARCHAR(255),
    date DATE,
    items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('draft', 'sent', 'pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
    payment_status VARCHAR(20) CHECK (payment_status IN ('paid', 'unpaid', 'partial')) DEFAULT 'unpaid',
    due_date DATE,
    notes TEXT,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- Enable RLS for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policy for invoices
DROP POLICY IF EXISTS "Allow all invoice operations" ON invoices;
CREATE POLICY "Allow all invoice operations" ON invoices
FOR ALL USING (true);

-- Re-add your customer (since it was lost)
INSERT INTO customers (id, name, email, phone, company, address, type, total_orders, total_spent) VALUES
('CUST-001', 'John Doe', 'john.doe@example.com', '+1-234-567-8900', 'Doe Enterprises', '123 Main St, City, State 12345', 'retail', 5, 750.00),
('CUST-id-nctqiobuz', 'Maaz Ali shah', 'maaz@example.com', '+1-234-567-8901', 'Shah Enterprises', '456 Business Ave, City, State 12346', 'retail', 0, 0.00)
ON CONFLICT (id) DO NOTHING;
