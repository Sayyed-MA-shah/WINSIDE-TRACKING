-- WINSIDE Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Products table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(20) CHECK (brand IN ('Green Hill', 'Harican', 'Byko')) NOT NULL,
    category VARCHAR(100) NOT NULL,
    wholesalePrice DECIMAL(10, 2) NOT NULL,
    retailPrice DECIMAL(10, 2) NOT NULL,
    article VARCHAR(100),
    shelfNo VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Variants table  
CREATE TABLE variants (
    id VARCHAR(50) PRIMARY KEY,
    productId VARCHAR(50) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    attributes JSONB NOT NULL,
    qty INTEGER DEFAULT 0,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Customers table
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('retailer', 'wholesaler')) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoiceNumber VARCHAR(100) UNIQUE NOT NULL,
    customerId VARCHAR(50) NOT NULL,
    customerName VARCHAR(255) NOT NULL,
    customerType VARCHAR(20) CHECK (customerType IN ('retailer', 'wholesaler')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('paid', 'pending', 'overdue')) DEFAULT 'pending',
    items JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dueDate DATE,
    FOREIGN KEY (customerId) REFERENCES customers(id)
);

-- Sample customers
INSERT INTO customers (id, name, type, email, phone, address) VALUES
('cust-001', 'ABC Retail Store', 'retailer', 'abc@retailstore.com', '+1-555-0101', '123 Main Street, City, State'),
('cust-002', 'XYZ Wholesale Hub', 'wholesaler', 'orders@xyzwholesale.com', '+1-555-0102', '456 Industrial Ave, City, State'),
('cust-003', 'Fashion Forward Boutique', 'retailer', 'contact@fashionforward.com', '+1-555-0103', '789 Fashion Blvd, City, State');

-- Sample Byko products
INSERT INTO products (id, name, brand, category, wholesalePrice, retailPrice, article, shelfNo) VALUES
('prod-001', 'Byko Premium T-Shirt', 'Byko', 'T-Shirts', 12.50, 25.00, 'BYK-TS-001', 'A1-001'),
('prod-002', 'Byko Classic Polo', 'Byko', 'Polo Shirts', 18.75, 37.50, 'BYK-PL-002', 'A1-002'),
('prod-003', 'Byko Casual Hoodie', 'Byko', 'Hoodies', 32.50, 65.00, 'BYK-HD-003', 'A2-001'),
('prod-004', 'Green Hill Training Shorts', 'Green Hill', 'Shorts', 15.00, 30.00, 'GH-SH-001', 'B1-001'),
('prod-005', 'Harican Sport Jacket', 'Harican', 'Jackets', 45.00, 90.00, 'HAR-JK-001', 'C1-001');

-- Sample variants
INSERT INTO variants (id, productId, sku, attributes, qty) VALUES
-- Byko T-Shirt variants
('var-001', 'prod-001', 'BYK-TS-001-RED-S', '{"Size": "S", "Color": "Red"}', 50),
('var-002', 'prod-001', 'BYK-TS-001-RED-M', '{"Size": "M", "Color": "Red"}', 75),
('var-003', 'prod-001', 'BYK-TS-001-BLUE-S', '{"Size": "S", "Color": "Blue"}', 45),
('var-004', 'prod-001', 'BYK-TS-001-BLUE-M', '{"Size": "M", "Color": "Blue"}', 60),

-- Byko Polo variants
('var-005', 'prod-002', 'BYK-PL-002-WHITE-M', '{"Size": "M", "Color": "White"}', 40),
('var-006', 'prod-002', 'BYK-PL-002-WHITE-L', '{"Size": "L", "Color": "White"}', 35),
('var-007', 'prod-002', 'BYK-PL-002-BLACK-M', '{"Size": "M", "Color": "Black"}', 30),

-- Byko Hoodie variants
('var-008', 'prod-003', 'BYK-HD-003-GRAY-L', '{"Size": "L", "Color": "Gray"}', 25),
('var-009', 'prod-003', 'BYK-HD-003-GRAY-XL', '{"Size": "XL", "Color": "Gray"}', 20),

-- Green Hill variants
('var-010', 'prod-004', 'GH-SH-001-BLACK-M', '{"Size": "M", "Color": "Black"}', 60),
('var-011', 'prod-004', 'GH-SH-001-BLACK-L', '{"Size": "L", "Color": "Black"}', 55),

-- Harican variants
('var-012', 'prod-005', 'HAR-JK-001-BLUE-M', '{"Size": "M", "Color": "Blue"}', 15),
('var-013', 'prod-005', 'HAR-JK-001-BLUE-L', '{"Size": "L", "Color": "Blue"}', 12);
