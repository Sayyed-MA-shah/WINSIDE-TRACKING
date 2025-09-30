import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, addProduct } from '@/lib/db/shared-db';

export async function GET() {
  try {
    console.log('API: Attempting to fetch products...');
    const products = await getAllProducts();
    console.log('API: Successfully fetched products:', products.length);
    
    // Check for products with images
    const productsWithImages = products.filter(product => product.mediaMain && product.mediaMain.trim());
    console.log('🔍 API: Products with mediaMain:', productsWithImages.length, 'out of', products.length);
    
    if (productsWithImages.length > 0) {
      console.log('🔍 API: Sample product with image:', {
        article: productsWithImages[0].article,
        mediaMain: productsWithImages[0].mediaMain
      });
      console.log('🔍 API: All products with images:', productsWithImages.map(p => ({
        article: p.article,
        mediaMain: p.mediaMain
      })));
    }
    
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
    console.log('API: Product data received:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.article) {
      console.error('API: Missing required field: article');
      return NextResponse.json({ error: 'Article is required' }, { status: 400 });
    }
    
    if (!data.title) {
      console.error('API: Missing required field: title');
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    if (!data.category) {
      console.error('API: Missing required field: category');
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    
    if (!data.brand) {
      console.error('API: Missing required field: brand');
      return NextResponse.json({ error: 'Brand is required' }, { status: 400 });
    }
    
    console.log('API: All required fields present, calling addProduct...');
    const product = await addProduct(data);
    
    if (!product) {
      console.error('API: Failed to create product in database');
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
    
    console.log('API: Product created successfully:', product.id);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('API: Error creating product:', error);
    console.error('API: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
