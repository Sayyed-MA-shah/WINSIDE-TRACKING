#!/usr/bin/env node

// This script sets up the database schema on your Bluehost MySQL server
// Run this ONCE after uploading your files to create all the tables

const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'gfnqismy_invoices',
  password: '#Claim77887788',
  database: 'gfnqismy_invoices',
  port: 3306
};

async function setupSchema() {
  let connection;
  
  try {
    console.log('Connecting to Bluehost MySQL database...');
    connection = await mysql.createConnection(config);
    console.log('Connected successfully!');

    // Create products table
    console.log('Creating products table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        brand ENUM('Green Hill', 'Harican', 'Byko') NOT NULL,
        category VARCHAR(100) NOT NULL,
        wholesalePrice DECIMAL(10, 2) NOT NULL,
        retailPrice DECIMAL(10, 2) NOT NULL,
        article VARCHAR(100),
        shelfNo VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create variants table
    console.log('Creating variants table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS variants (
        id VARCHAR(50) PRIMARY KEY,
        productId VARCHAR(50) NOT NULL,
        sku VARCHAR(100) UNIQUE NOT NULL,
        attributes JSON NOT NULL,
        qty INT DEFAULT 0,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Create customers table
    console.log('Creating customers table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('retailer', 'wholesaler') NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create invoices table
    console.log('Creating invoices table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(50) PRIMARY KEY,
        invoiceNumber VARCHAR(100) UNIQUE NOT NULL,
        customerId VARCHAR(50) NOT NULL,
        customerName VARCHAR(255) NOT NULL,
        customerType ENUM('retailer', 'wholesaler') NOT NULL,
        status ENUM('paid', 'pending', 'overdue') DEFAULT 'pending',
        items JSON NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        dueDate DATE,
        FOREIGN KEY (customerId) REFERENCES customers(id)
      )
    `);

    console.log('✅ Database schema created successfully!');
    console.log('You can now run the data initialization script.');
    
  } catch (error) {
    console.error('❌ Error setting up database schema:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupSchema();
