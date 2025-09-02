import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, addProduct } from '@/lib/db/shared-db';

export async function GET() {
  try {
    console.log('API: Attempting to fetch products...');
    const products = await getAllProducts();
    console.log('API: Successfully fetched products:', products.length);
    return NextResponse.json(products);
  } catch (error) {
    console.error('API: Error fetching products:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API: Attempting to create product...');
    const data = await request.json();
    console.log('API: Product data:', data);
    
    const product = await addProduct(data);
    
    if (!product) {
      console.error('API: Failed to create product in database');
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
    
    console.log('API: Product created successfully:', product.id);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('API: Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
