-- Optional: Create a backup of categories table before migration
-- Run this BEFORE running add_categories_sort_order.sql if you want extra safety

CREATE TABLE categories_backup_$(date +%Y%m%d) AS 
SELECT * FROM categories;

-- This creates a backup table with today's date
-- Example: categories_backup_20250929