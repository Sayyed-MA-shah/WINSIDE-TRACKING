import { Pool } from 'pg';

// Support both individual env vars and full DATABASE_URL
const config = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
} : {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const pool = new Pool(config);

export async function connectToDatabase() {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export default pool;
