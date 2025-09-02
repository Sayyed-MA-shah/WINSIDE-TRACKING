import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { authorization } = await request.json();
    
    // Simple authorization check
    if (authorization !== 'clear-all-data-now') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const DATA_DIR = path.join(process.cwd(), 'data');
    
    // Remove data directory if it exists
    if (fs.existsSync(DATA_DIR)) {
      fs.rmSync(DATA_DIR, { recursive: true, force: true });
      console.log('Removed data directory');
    }
    
    // Create empty data directory with empty files
    fs.mkdirSync(DATA_DIR, { recursive: true });
    
    const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
    const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
    
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify([], null, 2));
    
    console.log('Created fresh empty data files');

    return NextResponse.json({
      message: 'All application data cleared successfully',
      cleared: {
        products: true,
        customers: true,
        localStorage: 'Will be cleared on next page load'
      }
    });

  } catch (error) {
    console.error('Error clearing data:', error);
    return NextResponse.json(
      { error: 'Failed to clear application data' },
      { status: 500 }
    );
  }
}
