import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'invoice_management',
  port: parseInt(process.env.DB_PORT || '3306'),
};

export async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection(config);
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export default config;
