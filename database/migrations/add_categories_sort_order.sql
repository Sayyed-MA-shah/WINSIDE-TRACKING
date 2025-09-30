-- Migration to add sort_order column to categories table
-- Run this SQL in your Supabase SQL editor

-- Add sort_order column with default value
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 1;

-- Set initial sort_order values based on existing data (ordered by created_at)
UPDATE categories 
SET sort_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM categories
) AS subquery
WHERE categories.id = subquery.id;

-- Create index for better performance on sort_order queries
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);