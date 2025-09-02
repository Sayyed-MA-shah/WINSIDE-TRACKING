import { NextRequest, NextResponse } from 'next/server';
import { getAllInvoices, createInvoice } from '@/lib/db/invoices';
import { connectToDatabase } from '@/lib/db/connection';

export async function GET() {
  try {
    const invoices = await getAllInvoices();
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Start a transaction for invoice creation and stock updates
    const connection = await connectToDatabase();
    
    try {
      await connection.beginTransaction();
      
      // Create the invoice
      const invoiceId = await createInvoice(body);
      
      // Update stock for each item
      if (body.items && Array.isArray(body.items)) {
        for (const item of body.items) {
          if (item.variantId) {
            // Deduct stock from the specific variant (negative quantity)
            await connection.execute(
              'UPDATE product_variants SET qty = qty - ? WHERE id = ?',
              [item.quantity, item.variantId]
            );
          }
        }
      }
      
      await connection.commit();
      return NextResponse.json({ id: invoiceId });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
