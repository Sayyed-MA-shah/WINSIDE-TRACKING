// Database synchronization test (CommonJS version)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseSync() {
  console.log('🔍 Testing database synchronization...');
  console.log('🕒 Test run at:', new Date().toISOString());
  
  // Test 1: Check current database connection
  console.log('📡 Database URL:', supabaseUrl?.substring(0, 30) + '...');
  
  try {
    // Test 2: Get recent invoices to verify data visibility
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
        total_amount: invoices[0].total_amount,
        created_at: invoices[0].created_at
      });
    }
    
    // Test 3: Get product stock levels - first check what columns exist
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (productError) {
      console.error('❌ Product query error:', productError);
      
      // Try alternative column names
      const { data: productsAlt, error: altError } = await supabase
        .from('products')
        .select('id, product_name, quantity, stock, updated_at')
        .limit(5);
        
      if (altError) {
        console.error('❌ Alternative product query also failed:', altError);
      } else {
        console.log('📦 Products with alternative columns:', productsAlt);
      }
      return;
    }
    
    console.log('📦 Product table structure (first 3 products):');
    if (products && products.length > 0) {
      console.log('🏗️  Available columns:', Object.keys(products[0]));
      products.slice(0, 3).forEach(product => {
        console.log(`  Product ${product.id}:`, product);
      });
    }
    
    // Test 4: Check if stock_history table exists and get recent changes
    const { data: stockHistory, error: historyError } = await supabase
      .from('stock_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (historyError) {
      console.log('⚠️  Stock history table might not exist:', historyError.message);
    } else {
      console.log('📈 Recent stock changes:', stockHistory?.length || 0);
      stockHistory?.forEach(change => {
        console.log(`  Product ${change.product_id}: ${change.quantity_change} (${change.reason}) at ${change.created_at}`);
      });
    }
    
    // Test 5: Check products with actual stock and find one we can test with
    console.log('🎯 Looking for products with available stock for testing...');
    const productsWithStock = products?.filter(product => 
      product.variants && product.variants.some(variant => variant.qty > 0)
    ) || [];
    
    console.log(`📦 Found ${productsWithStock.length} products with stock:`);
    productsWithStock.slice(0, 3).forEach(product => {
      const stockVariants = product.variants.filter(v => v.qty > 0);
      console.log(`  ${product.title}:`);
      stockVariants.forEach(variant => {
        console.log(`    - ${variant.sku}: ${variant.qty} units`);
      });
    });
    
    // Test 6: Simple connection test
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Basic connection test failed:', testError);
    } else {
      console.log('✅ Database connection successful');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDatabaseSync();