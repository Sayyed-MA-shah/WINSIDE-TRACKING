-- WINSIDE Invoice Table Schema Fix
-- Run this in your Supabase SQL Editor

-- First, enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create invoices table with correct column types for our application
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
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "Allow all invoice operations" ON invoices;
CREATE POLICY "Allow all invoice operations" ON invoices
FOR ALL USING (true);

-- Note: We're using TEXT for customer_id instead of UUID foreign key
-- because our customers table uses VARCHAR(50) IDs, not UUIDs
