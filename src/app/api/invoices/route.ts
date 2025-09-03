import { NextRequest, NextResponse } from 'next/server';
import { getAllInvoices, createInvoice } from '@/lib/db/shared-db';

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
    console.log('API: Received invoice data:', JSON.stringify(body, null, 2));
    
    // Create the invoice
    const invoice = await createInvoice(body);
    
    if (!invoice) {
      console.error('API: createInvoice returned null/undefined');
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }
    
    console.log('API: Invoice created successfully:', invoice.id);
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('API: Error creating invoice:', error);
    console.error('API: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('API: Error message:', error instanceof Error ? error.message : String(error));
    
    return NextResponse.json({ 
      error: 'Failed to create invoice',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
