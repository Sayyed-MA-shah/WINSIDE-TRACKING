import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, updateProduct, deleteProduct, getProductById } from '@/lib/db/shared-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductById(params.id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('API: Attempting to update product:', params.id);
    const data = await request.json();
    console.log('API: Update data:', data);
    
    const product = await updateProduct(params.id, data);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    console.log('API: Product updated successfully');
    return NextResponse.json(product);
  } catch (error) {
    console.error('API: Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('API: Attempting to delete product:', params.id);
    const success = await deleteProduct(params.id);
    
    if (!success) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    console.log('API: Product deleted successfully');
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('API: Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
