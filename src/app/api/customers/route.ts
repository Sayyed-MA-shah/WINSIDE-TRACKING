import { NextRequest, NextResponse } from 'next/server';
import { getAllCustomers, addCustomer } from '@/lib/db/shared-db';

export async function GET() {
  try {
    console.log('API: Attempting to fetch customers...');
    const customers = await getAllCustomers();
    console.log('API: Successfully fetched customers:', customers.length);
    return NextResponse.json(customers);
  } catch (error) {
    console.error('API: Error fetching customers:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API: Attempting to create customer...');
    const body = await request.json();
    console.log('API: Customer data received:', body);
    
    const customer = await addCustomer(body);
    
    if (!customer) {
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
    
    console.log('API: Customer created successfully:', customer);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('API: Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
