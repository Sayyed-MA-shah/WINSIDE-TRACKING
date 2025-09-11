import { NextRequest, NextResponse } from 'next/server';
import { migrateProductsToSupabase } from '@/lib/data/migrate-to-supabase';

export async function POST(request: NextRequest) {
  try {
    // Check if this is authorized (you might want to add authentication here)
    const { authorization } = await request.json();
    
    if (authorization !== 'migrate-products-now') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await migrateProductsToSupabase();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Products migrated successfully to Supabase' 
    });
    
  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
