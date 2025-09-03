-- Categories Table Schema
-- Run this in your Supabase SQL Editor

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON categories(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policy for categories
DROP POLICY IF EXISTS "Allow all category operations" ON categories;
CREATE POLICY "Allow all category operations" ON categories
FOR ALL USING (true);

-- Insert some default categories
INSERT INTO categories (name, description, color) VALUES
('Boxing Gloves', 'Boxing gloves and related equipment', '#EF4444'),
('Boxing Equipment', 'Boxing training and competition equipment', '#F97316'),
('MMA Gear', 'Mixed martial arts equipment', '#8B5CF6'),
('Fitness Equipment', 'General fitness and workout equipment', '#10B981'),
('Apparel', 'Clothing and athletic wear', '#06B6D4'),
('Accessories', 'Sports and training accessories', '#F59E0B'),
('Training Equipment', 'Training aids and equipment', '#84CC16'),
('Protective Gear', 'Safety and protective equipment', '#EF4444')
ON CONFLICT (name) DO NOTHING;
