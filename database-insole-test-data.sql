-- Test Data for INSOLE CLINIC System
-- This script creates test users, products, customers for the insole system

-- Test user for login
INSERT INTO insole_users (username, password_hash, display_name, email) 
VALUES ('admin', '$2a$12$LQv3c1yqBwEHxv8fxvjjO.OW1mWcqqr7F2oIv7Y8sS7W4KGG.L4G.', 'Insole Admin', 'admin@insoleclinic.com')
ON CONFLICT (username) DO NOTHING;

-- Test categories
INSERT INTO insole_categories (name, description, color) VALUES
('Orthotics', 'Custom orthotic insoles', '#3B82F6'),
('Sports', 'Athletic and sports insoles', '#EF4444'),
('Comfort', 'Comfort and cushioning insoles', '#10B981'),
('Medical', 'Medical grade insoles', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- Test products
INSERT INTO insole_products (name, description, category_id, price, cost, stock, sku) VALUES
('Custom Orthotic Insole', 'Made-to-measure orthotic insole for foot correction', 
  (SELECT id FROM insole_categories WHERE name = 'Orthotics' LIMIT 1), 
  120.00, 45.00, 25, 'ORH-001'),
('Sports Performance Insole', 'High-performance athletic insole with shock absorption', 
  (SELECT id FROM insole_categories WHERE name = 'Sports' LIMIT 1), 
  35.00, 12.00, 50, 'SPT-001'),
('Comfort Gel Insole', 'Gel-filled comfort insole for everyday wear', 
  (SELECT id FROM insole_categories WHERE name = 'Comfort' LIMIT 1), 
  25.00, 8.00, 75, 'CMF-001'),
('Diabetic Medical Insole', 'Specialized insole for diabetic foot care', 
  (SELECT id FROM insole_categories WHERE name = 'Medical' LIMIT 1), 
  95.00, 35.00, 20, 'MED-001')
ON CONFLICT (sku) DO NOTHING;

-- Test customers
INSERT INTO insole_customers (name, email, phone, address, notes) VALUES
('John Smith', 'john.smith@email.com', '07123456789', '123 High Street, London, SW1A 1AA', 'Regular customer, prefers orthotic solutions'),
('Sarah Johnson', 'sarah.j@email.com', '07987654321', '456 Oak Avenue, Manchester, M1 1AA', 'Athlete, requires sports insoles'),
('Michael Brown', 'mike.brown@email.com', '07555123456', '789 Park Road, Birmingham, B1 1AA', 'Diabetic patient, needs medical grade insoles'),
('Emma Wilson', 'emma.w@email.com', '07777888999', '321 Church Lane, Leeds, LS1 1AA', 'Works long hours, comfort insoles needed')
ON CONFLICT (email) DO NOTHING;