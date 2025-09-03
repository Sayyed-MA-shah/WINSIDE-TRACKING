import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, updateInvoice, deleteInvoice } from '@/lib/db/shared-db';

// GET /api/invoices/[id] - Get invoice by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await getInvoiceById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('PUT /api/invoices/[id] - Updating invoice:', id);
    console.log('PUT /api/invoices/[id] - Update data:', JSON.stringify(body, null, 2));
    
    const updatedInvoice = await updateInvoice(id, body);
    
    if (!updatedInvoice) {
      console.error('PUT /api/invoices/[id] - Invoice not found:', id);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    console.log('PUT /api/invoices/[id] - Successfully updated invoice:', updatedInvoice.id);
    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('PUT /api/invoices/[id] - Error updating invoice:', error);
    console.error('PUT /api/invoices/[id] - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to update invoice', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteInvoice(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
