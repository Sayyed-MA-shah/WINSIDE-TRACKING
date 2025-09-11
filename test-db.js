// Test database connection
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);
    console.log('Password:', process.env.DB_PASSWORD ? '***masked***' : 'NOT SET');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
      connectTimeout: 10000,
      acquireTimeout: 10000,
    });

    console.log('✅ Database connection successful!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', rows);
    
    await connection.end();
    console.log('🎉 Database is ready for setup!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Full error:', error);
    console.log('\n🔧 Common Bluehost issues:');
    console.log('1. Check if you gave the user ALL PRIVILEGES on the database');
    console.log('2. Try connecting from Bluehost cPanel phpMyAdmin first');
    console.log('3. Make sure the database and user both exist');
    console.log('4. Check if remote connections are allowed');
  }
}

testConnection();
