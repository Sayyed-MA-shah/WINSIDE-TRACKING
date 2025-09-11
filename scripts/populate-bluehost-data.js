#!/usr/bin/env node

// This script populates your Bluehost database with real Byko products
// Run this AFTER running the schema setup script

const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'gfnqismy_invoices',
  password: '#Claim77887788',
  database: 'gfnqismy_invoices',
  port: 3306
};

// Sample customers
const sampleCustomers = [
  {
    id: 'cust-001',
    name: 'ABC Retail Store',
    type: 'retailer',
    email: 'abc@retailstore.com',
    phone: '+1-555-0101',
    address: '123 Main Street, City, State 12345'
  },
  {
    id: 'cust-002', 
    name: 'XYZ Wholesale Hub',
    type: 'wholesaler',
    email: 'orders@xyzwholesale.com',
    phone: '+1-555-0102',
    address: '456 Industrial Ave, City, State 12346'
  },
  {
    id: 'cust-003',
    name: 'Fashion Forward Boutique',
    type: 'retailer', 
    email: 'contact@fashionforward.com',
    phone: '+1-555-0103',
    address: '789 Fashion Blvd, City, State 12347'
  }
];

// Sample Byko products
const bykoProducts = [
  {
    id: 'prod-001',
    name: 'Byko Premium T-Shirt',
    brand: 'Byko',
    category: 'T-Shirts',
    wholesalePrice: 12.50,
    retailPrice: 25.00,
    article: 'BYK-TS-001',
    shelfNo: 'A1-001'
  },
  {
    id: 'prod-002', 
    name: 'Byko Classic Polo',
    brand: 'Byko',
    category: 'Polo Shirts',
    wholesalePrice: 18.75,
    retailPrice: 37.50,
    article: 'BYK-PL-002',
    shelfNo: 'A1-002'
  },
  {
    id: 'prod-003',
    name: 'Byko Casual Hoodie',
    brand: 'Byko', 
    category: 'Hoodies',
    wholesalePrice: 32.50,
    retailPrice: 65.00,
    article: 'BYK-HD-003',
    shelfNo: 'A2-001'
  }
];

// Sample variants for each product
const variants = [
  // T-Shirt variants
  { id: 'var-001', productId: 'prod-001', sku: 'BYK-TS-001-RED-S', attributes: { Size: 'S', Color: 'Red' }, qty: 50 },
  { id: 'var-002', productId: 'prod-001', sku: 'BYK-TS-001-RED-M', attributes: { Size: 'M', Color: 'Red' }, qty: 75 },
  { id: 'var-003', productId: 'prod-001', sku: 'BYK-TS-001-BLUE-S', attributes: { Size: 'S', Color: 'Blue' }, qty: 45 },
  { id: 'var-004', productId: 'prod-001', sku: 'BYK-TS-001-BLUE-M', attributes: { Size: 'M', Color: 'Blue' }, qty: 60 },
  
  // Polo variants
  { id: 'var-005', productId: 'prod-002', sku: 'BYK-PL-002-WHITE-M', attributes: { Size: 'M', Color: 'White' }, qty: 40 },
  { id: 'var-006', productId: 'prod-002', sku: 'BYK-PL-002-WHITE-L', attributes: { Size: 'L', Color: 'White' }, qty: 35 },
  { id: 'var-007', productId: 'prod-002', sku: 'BYK-PL-002-BLACK-M', attributes: { Size: 'M', Color: 'Black' }, qty: 30 },
  
  // Hoodie variants
  { id: 'var-008', productId: 'prod-003', sku: 'BYK-HD-003-GRAY-L', attributes: { Size: 'L', Color: 'Gray' }, qty: 25 },
  { id: 'var-009', productId: 'prod-003', sku: 'BYK-HD-003-GRAY-XL', attributes: { Size: 'XL', Color: 'Gray' }, qty: 20 }
];

async function populateDatabase() {
  let connection;
  
  try {
    console.log('Connecting to Bluehost MySQL database...');
    connection = await mysql.createConnection(config);
    console.log('Connected successfully!');

    // Insert customers
    console.log('Inserting sample customers...');
    for (const customer of sampleCustomers) {
      await connection.execute(
        `INSERT IGNORE INTO customers (id, name, type, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)`,
        [customer.id, customer.name, customer.type, customer.email, customer.phone, customer.address]
      );
    }

    // Insert products
    console.log('Inserting Byko products...');
    for (const product of bykoProducts) {
      await connection.execute(
        `INSERT IGNORE INTO products (id, name, brand, category, wholesalePrice, retailPrice, article, shelfNo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [product.id, product.name, product.brand, product.category, product.wholesalePrice, product.retailPrice, product.article, product.shelfNo]
      );
    }

    // Insert variants
    console.log('Inserting product variants...');
    for (const variant of variants) {
      await connection.execute(
        `INSERT IGNORE INTO variants (id, productId, sku, attributes, qty) VALUES (?, ?, ?, ?, ?)`,
        [variant.id, variant.productId, variant.sku, JSON.stringify(variant.attributes), variant.qty]
      );
    }

    console.log('✅ Database populated successfully!');
    console.log(`✅ Inserted ${sampleCustomers.length} customers`);
    console.log(`✅ Inserted ${bykoProducts.length} products`);
    console.log(`✅ Inserted ${variants.length} variants`);
    console.log('Your dashboard should now show real data!');
    
  } catch (error) {
    console.error('❌ Error populating database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

populateDatabase();
