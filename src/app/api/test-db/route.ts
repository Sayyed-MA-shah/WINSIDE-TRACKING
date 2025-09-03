import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('Testing Supabase connection...');
    
    // Test 2: Check if invoices table exists by attempting to read from it
    const { data: invoicesTest, error: invoicesError } = await supabase
      .from('invoices')
      .select('id')
      .limit(1);
    
    if (invoicesError) {
      console.error('Invoices table error:', invoicesError);
      return NextResponse.json({
        success: false,
        error: 'Invoices table not accessible',
        details: invoicesError.message,
        code: invoicesError.code
      });
    }
    
    // Test 3: Check if customers table exists
    const { data: customersTest, error: customersError } = await supabase
      .from('customers')
      .select('id')
      .limit(1);
    
    if (customersError) {
      console.error('Customers table error:', customersError);
      return NextResponse.json({
        success: false,
        error: 'Customers table not accessible',
        details: customersError.message,
        code: customersError.code
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      invoicesCount: invoicesTest?.length || 0,
      customersCount: customersTest?.length || 0,
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
