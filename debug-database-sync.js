// Database synchronization test
// Run this to check if both environments see the same data

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseSync() {
  console.log('🔍 Testing database synchronization...');
  
  // Test 1: Check current database connection
  console.log('📡 Database URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  // Test 2: Get recent invoices to verify data visibility
  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log('📊 Recent invoices count:', invoices?.length || 0);
    if (invoices && invoices.length > 0) {
      console.log('🧾 Latest invoice:', {
        id: invoices[0].id,
        invoice_number: invoices[0].invoice_number,
        po_number: invoices[0].po_number,
        created_at: invoices[0].created_at
      });
    }
    
    // Test 3: Get product stock levels
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .order('updated_at', { ascending: false })
      .limit(10);
    
    if (productError) {
      console.error('❌ Product query error:', productError);
      return;
    }
    
    console.log('📦 Product stock levels:');
    products?.forEach(product => {
      console.log(`  ${product.name}: ${product.stock_quantity} units`);
    });
    
    // Test 4: Check recent stock changes
    const { data: stockHistory, error: historyError } = await supabase
      .from('stock_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (historyError) {
      console.error('❌ Stock history error:', historyError);
    } else {
      console.log('📈 Recent stock changes:', stockHistory?.length || 0);
      stockHistory?.forEach(change => {
        console.log(`  ${change.product_id}: ${change.quantity_change} (${change.reason})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Add a timestamp for tracking
console.log('🕒 Test run at:', new Date().toISOString());
testDatabaseSync();