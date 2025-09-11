import { connectToDatabase } from './connection';
import { Customer } from '@/lib/types';

export async function getAllCustomers(): Promise<Customer[]> {
  const connection = await connectToDatabase();
  
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM customers ORDER BY created_at DESC'
    );
    
    return (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      company: row.company,
      address: row.address,
      type: row.type,
      createdAt: new Date(row.created_at),
      totalOrders: row.total_orders,
      totalSpent: parseFloat(row.total_spent)
    }));
  } finally {
    await connection.end();
  }
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'totalOrders' | 'totalSpent'>): Promise<Customer> {
  const connection = await connectToDatabase();
  
  try {
    const [result] = await connection.execute(
      'INSERT INTO customers (name, phone, company, address, type) VALUES (?, ?, ?, ?, ?)',
      [customer.name, customer.phone, customer.company, customer.address, customer.type]
    );
    
    const insertId = (result as any).insertId;
    
    const [rows] = await connection.execute(
      'SELECT * FROM customers WHERE id = ?',
      [insertId]
    );
    
    const row = (rows as any[])[0];
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      company: row.company,
      address: row.address,
      type: row.type,
      createdAt: new Date(row.created_at),
      totalOrders: row.total_orders,
      totalSpent: parseFloat(row.total_spent)
    };
  } finally {
    await connection.end();
  }
}

export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
  const connection = await connectToDatabase();
  
  try {
    await connection.execute(
      'UPDATE customers SET name = ?, phone = ?, company = ?, address = ?, type = ? WHERE id = ?',
      [customer.name, customer.phone, customer.company, customer.address, customer.type, id]
    );
    
    const [rows] = await connection.execute(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    );
    
    const row = (rows as any[])[0];
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      company: row.company,
      address: row.address,
      type: row.type,
      createdAt: new Date(row.created_at),
      totalOrders: row.total_orders,
      totalSpent: parseFloat(row.total_spent)
    };
  } finally {
    await connection.end();
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  const connection = await connectToDatabase();
  
  try {
    await connection.execute('DELETE FROM customers WHERE id = ?', [id]);
  } finally {
    await connection.end();
  }
}
