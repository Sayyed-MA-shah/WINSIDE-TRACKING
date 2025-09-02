import mysql from 'mysql2/promise';

// Database configuration - update these with your hosting provider details
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'invoice_management',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database schema...');
    
    // Connect without database first
    const connectionConfig = { ...config };
    delete connectionConfig.database;
    const connection = await mysql.createConnection(connectionConfig);
    
    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
    console.log(`✅ Database "${config.database}" created/verified`);
    
    // Close connection and reconnect to the database
    await connection.end();
    const dbConnection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Create tables
    console.log('📋 Creating tables...');

    // Customers table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        address TEXT NOT NULL,
        type ENUM('retail', 'wholesale', 'club') NOT NULL,
        total_orders INT DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Customers table created');

    // Products table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        article VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        brand ENUM('greenhil', 'harican', 'byko') NOT NULL,
        taxable BOOLEAN DEFAULT TRUE,
        attributes JSON,
        media_main VARCHAR(255),
        archived BOOLEAN DEFAULT FALSE,
        wholesale DECIMAL(10,2) NOT NULL,
        retail DECIMAL(10,2) NOT NULL,
        club DECIMAL(10,2) NOT NULL,
        cost_before DECIMAL(10,2) NOT NULL,
        cost_after DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Products table created');

    // Product variants table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id VARCHAR(255) PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        sku VARCHAR(255) NOT NULL UNIQUE,
        attributes JSON,
        qty INT NOT NULL DEFAULT 0,
        wholesale DECIMAL(10,2),
        retail DECIMAL(10,2),
        club DECIMAL(10,2),
        cost_before DECIMAL(10,2),
        cost_after DECIMAL(10,2),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Product variants table created');

    // Invoices table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(255) PRIMARY KEY,
        invoice_number VARCHAR(255) NOT NULL UNIQUE,
        customer_id VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255),
        subtotal DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) DEFAULT 0.00,
        tax DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status ENUM('draft', 'sent', 'pending', 'paid', 'overdue', 'cancelled') NOT NULL,
        payment_status ENUM('paid', 'unpaid', 'partial'),
        paid_amount DECIMAL(10,2) DEFAULT 0.00,
        due_date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Invoices table created');

    // Invoice items table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id VARCHAR(255) PRIMARY KEY,
        invoice_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        product_name VARCHAR(255),
        sku VARCHAR(255),
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Invoice items table created');

    await dbConnection.end();
    
    console.log('\n🎉 Database schema setup complete!');
    console.log('📊 Tables created:');
    console.log('   • customers');
    console.log('   • products');
    console.log('   • product_variants');
    console.log('   • invoices');
    console.log('   • invoice_items');
    console.log('\n🚀 Ready to insert your Byko products!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
