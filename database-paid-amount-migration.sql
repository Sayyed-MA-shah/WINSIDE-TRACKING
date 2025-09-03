-- Add paid_amount column to invoices table
-- Run this in your Supabase SQL Editor

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0;
