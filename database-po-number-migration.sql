-- Add po_number column to invoices table
-- Run this in your Supabase SQL Editor

-- Add po_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'po_number') THEN
        ALTER TABLE invoices ADD COLUMN po_number VARCHAR(100);
    END IF;
END $$;

-- Create index for better performance on PO number searches
CREATE INDEX IF NOT EXISTS idx_invoices_po_number ON invoices(po_number);

-- Update the existing exports/views to include po_number if needed
-- This ensures compatibility with any existing queries