-- Quick Fix: Create Customers Table Only
-- Run this in your Supabase SQL Editor if you just want to fix the customer error

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate customers table
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

-- Insert a sample customer
INSERT INTO customers (id, name, email, phone, company, address, type, total_orders, total_spent) VALUES
('CUST-001', 'John Doe', 'john.doe@example.com', '+1-234-567-8900', 'Doe Enterprises', '123 Main St, City, State 12345', 'retail', 5, 750.00)
ON CONFLICT (id) DO NOTHING;
