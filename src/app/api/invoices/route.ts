import { NextRequest, NextResponse } from 'next/server';
import { getAllInvoices, createInvoice } from '@/lib/db/invoices-supabase';

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
    
    // Create the invoice
    const invoiceId = await createInvoice(body);
    
    // Note: Stock updates would need to be implemented in Supabase
    // For now, just create the invoice
    
    return NextResponse.json({ id: invoiceId });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
