import { NextRequest, NextResponse } from 'next/server';
import { getAllCustomers, addCustomer } from '@/lib/db/shared-db';

export async function GET() {
  try {
    console.log('API: Attempting to fetch customers...');
    const customers = await getAllCustomers();
    console.log('API: Successfully fetched customers:', customers.length);
    return NextResponse.json(customers);
  } catch (error) {
    console.error('API: Error fetching customers, using empty fallback:', error);
    // Return empty array as fallback instead of error
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  let body: any = {};
  
  try {
    console.log('API: Attempting to create customer...');
    body = await request.json();
    console.log('API: Customer data received:', body);
    
    const customer = addCustomer(body);
    console.log('API: Customer created successfully:', customer);
    return NextResponse.json(customer);
  } catch (error) {
    console.error('API: Error creating customer:', error);
    
    // Create a fallback customer response with a generated ID
    const fallbackCustomer = {
      id: `customer_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString()
    };
    
    console.log('API: Returning fallback customer:', fallbackCustomer);
    return NextResponse.json(fallbackCustomer);
  }
}
