import { connectToDatabase } from './connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Product {
  id: string;
  name: string;
  brand: string;
  costPrice: number;
  wholesalePrice: number;
  retailPrice: number;
  clubPrice: number;
  stock: number;
  minStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function getAllProducts(): Promise<Product[]> {
  const connection = await connectToDatabase();
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM products ORDER BY name'
    );
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      brand: row.brand,
      costPrice: parseFloat(row.cost_price),
      wholesalePrice: parseFloat(row.wholesale_price),
      retailPrice: parseFloat(row.retail_price),
      clubPrice: parseFloat(row.club_price),
      stock: row.stock,
      minStock: row.min_stock || 10,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  } finally {
    await connection.end();
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const connection = await connectToDatabase();
  try {
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      brand: row.brand,
      costPrice: parseFloat(row.cost_price),
      wholesalePrice: parseFloat(row.wholesale_price),
      retailPrice: parseFloat(row.retail_price),
      clubPrice: parseFloat(row.club_price),
      stock: row.stock,
      minStock: row.min_stock || 10,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  } finally {
    await connection.end();
  }
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const connection = await connectToDatabase();
  try {
    const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO products (id, name, brand, cost_price, wholesale_price, retail_price, club_price, stock, min_stock) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        productData.name,
        productData.brand,
        productData.costPrice,
        productData.wholesalePrice,
        productData.retailPrice,
        productData.clubPrice,
        productData.stock,
        productData.minStock
      ]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Failed to create product');
    }
    
    const newProduct = await getProductById(id);
    if (!newProduct) {
      throw new Error('Failed to retrieve created product');
    }
    
    return newProduct;
  } finally {
    await connection.end();
  }
}

export async function updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
  const connection = await connectToDatabase();
  try {
    const setParts: string[] = [];
    const values: any[] = [];
    
    if (productData.name !== undefined) {
      setParts.push('name = ?');
      values.push(productData.name);
    }
    if (productData.brand !== undefined) {
      setParts.push('brand = ?');
      values.push(productData.brand);
    }
    if (productData.costPrice !== undefined) {
      setParts.push('cost_price = ?');
      values.push(productData.costPrice);
    }
    if (productData.wholesalePrice !== undefined) {
      setParts.push('wholesale_price = ?');
      values.push(productData.wholesalePrice);
    }
    if (productData.retailPrice !== undefined) {
      setParts.push('retail_price = ?');
      values.push(productData.retailPrice);
    }
    if (productData.clubPrice !== undefined) {
      setParts.push('club_price = ?');
      values.push(productData.clubPrice);
    }
    if (productData.stock !== undefined) {
      setParts.push('stock = ?');
      values.push(productData.stock);
    }
    if (productData.minStock !== undefined) {
      setParts.push('min_stock = ?');
      values.push(productData.minStock);
    }
    
    if (setParts.length === 0) {
      throw new Error('No fields to update');
    }
    
    setParts.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const [result] = await connection.execute<ResultSetHeader>(
      `UPDATE products SET ${setParts.join(', ')} WHERE id = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Product not found or no changes made');
    }
    
    const updatedProduct = await getProductById(id);
    if (!updatedProduct) {
      throw new Error('Failed to retrieve updated product');
    }
    
    return updatedProduct;
  } finally {
    await connection.end();
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const connection = await connectToDatabase();
  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM products WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Product not found');
    }
  } finally {
    await connection.end();
  }
}

export async function updateProductStock(id: string, quantityChange: number): Promise<void> {
  const connection = await connectToDatabase();
  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [quantityChange, id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Product not found');
    }
  } finally {
    await connection.end();
  }
}
