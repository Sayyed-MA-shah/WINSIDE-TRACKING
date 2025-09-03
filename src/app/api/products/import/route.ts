import { NextRequest, NextResponse } from 'next/server';
import { addProduct } from '@/lib/db/shared-db';
import { normalizeCategory } from '@/lib/categories';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must have headers and at least one product' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const products = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length !== headers.length) {
          errors.push(`Line ${i + 1}: Column count mismatch`);
          continue;
        }

        const product: any = {
          id: `prod-${Date.now()}-${i}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          archived: false,
          attributes: [],
          variants: []
        };

        // Map CSV headers to product fields
        headers.forEach((header, index) => {
          const value = values[index];
          
          switch (header) {
            case 'title':
            case 'name':
              product.title = value;
              break;
            case 'article':
            case 'sku':
              product.article = value;
              break;
            case 'description':
              product.description = value;
              break;
            case 'category':
              product.category = normalizeCategory(value);
              break;
            case 'brand':
              product.brand = value;
              break;
            case 'wholesale':
              product.wholesale = parseFloat(value) || 0;
              break;
            case 'retail':
              product.retail = parseFloat(value) || 0;
              break;
            case 'club':
              product.club = parseFloat(value) || 0;
              break;
            case 'cost':
            case 'costbefore':
              product.costBefore = parseFloat(value) || 0;
              break;
            case 'costafter':
              product.costAfter = parseFloat(value) || 0;
              break;
            case 'quantity':
            case 'qty':
              const qty = parseInt(value) || 0;
              product.variants = [{
                id: `var-${Date.now()}-${i}`,
                productId: product.id,
                sku: product.article || `${product.title}-${i}`,
                size: 'One Size',
                color: 'Default',
                quantity: qty,
                qty: qty,
                price: product.retail || 0,
                cost: product.costAfter || 0,
                attributes: {}
              }];
              break;
            case 'taxable':
              product.taxable = value.toLowerCase() === 'true' || value === '1';
              break;
          }
        });

        // Validate required fields
        if (!product.title) {
          errors.push(`Line ${i + 1}: Title/Name is required`);
          continue;
        }

        // Add the product
        addProduct(product);
        products.push(product);
        
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      message: `Successfully imported ${products.length} products`,
      imported: products.length,
      errors: errors,
      products: products
    });

  } catch (error) {
    console.error('Error importing CSV:', error);
    return NextResponse.json(
      { error: 'Failed to import CSV file' },
      { status: 500 }
    );
  }
}
