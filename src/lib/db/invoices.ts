import { connectToDatabase } from './connection';
import { Invoice } from '@/lib/types';

export async function getAllInvoices(): Promise<Invoice[]> {
  const connection = await connectToDatabase();
  
  try {
    const [invoiceRows] = await connection.execute(`
      SELECT i.*, c.name as customer_name, c.phone as customer_phone, 
             c.company as customer_company, c.address as customer_address, c.type as customer_type
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
    `);
    
    const invoices = [];
    
    for (const invoice of invoiceRows as any[]) {
      const [itemRows] = await connection.execute(`
        SELECT ii.*, p.title as product_title, p.article as product_article
        FROM invoice_items ii
        JOIN products p ON ii.product_id = p.id
        WHERE ii.invoice_id = ?
      `, [invoice.id]);
      
      invoices.push({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        customerId: invoice.customer_id,
        customer: {
          id: invoice.customer_id,
          name: invoice.customer_name,
          phone: invoice.customer_phone,
          company: invoice.customer_company,
          address: invoice.customer_address,
          type: invoice.customer_type,
          createdAt: new Date(),
          totalOrders: 0,
          totalSpent: 0
        },
        items: (itemRows as any[]).map(item => ({
          id: item.id,
          productId: item.product_id,
          variantId: item.variant_id,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          total: parseFloat(item.total)
        })),
        subtotal: parseFloat(invoice.subtotal),
        tax: parseFloat(invoice.tax_amount),
        total: parseFloat(invoice.total),
        paidAmount: parseFloat(invoice.paid_amount),
        balanceDue: parseFloat(invoice.balance_due),
        status: invoice.status,
        dueDate: new Date(invoice.due_date),
        createdAt: new Date(invoice.created_at),
        paidAt: invoice.paid_at ? new Date(invoice.paid_at) : undefined
      });
    }
    
    return invoices;
  } finally {
    await connection.end();
  }
}

export async function createInvoice(invoiceData: {
  invoiceNumber: string;
  customerId: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  status: string;
  dueDate: Date;
}): Promise<string> {
  const connection = await connectToDatabase();
  
  try {
    await connection.beginTransaction();
    
    // Insert invoice
    const [invoiceResult] = await connection.execute(`
      INSERT INTO invoices (
        invoice_number, customer_id, subtotal, discount_amount, tax_amount, 
        total, paid_amount, balance_due, status, due_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      invoiceData.invoiceNumber,
      invoiceData.customerId,
      invoiceData.subtotal,
      invoiceData.discountAmount,
      invoiceData.taxAmount,
      invoiceData.total,
      invoiceData.paidAmount,
      invoiceData.balanceDue,
      invoiceData.status,
      invoiceData.dueDate
    ]);
    
    const invoiceId = (invoiceResult as any).insertId;
    
    // Insert invoice items
    for (const item of invoiceData.items) {
      await connection.execute(`
        INSERT INTO invoice_items (invoice_id, product_id, variant_id, quantity, unit_price, total)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [invoiceId, item.productId, item.variantId, item.quantity, item.unitPrice, item.total]);
    }
    
    await connection.commit();
    return invoiceId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  const connection = await connectToDatabase();
  
  try {
    await connection.beginTransaction();
    
    // Delete invoice items first (foreign key constraint)
    await connection.execute('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
    
    // Delete invoice
    await connection.execute('DELETE FROM invoices WHERE id = ?', [id]);
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}
