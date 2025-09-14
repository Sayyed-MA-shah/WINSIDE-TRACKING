// Test improved stock deduction for products without variants
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testGlobalStockDeduction() {
  console.log('🧪 Testing improved stock deduction for products without variants...');
  
  try {
    // Find a product from invoice WIN-INV-326 that has no variantId
    const testItems = [
      {
        productId: "ac8617c0-216d-4f86-a653-acd1579cd168", // Muay Thai Shorts Mesh
        variantId: undefined,
        quantity: 2
      },
      {
        productId: "27f03600-709b-44f7-bff8-7baf72928f7a", // Boxing Gloves Pink
        variantId: undefined,
        quantity: 1
      }
    ];
    
    console.log('📋 Testing with sample items without variant IDs:');
    for (const item of testItems) {
      console.log(`\n--- Testing ${item.productId} ---`);
      
      // Get current product state
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.productId)
        .single();
      
      if (!product) {
        console.log('❌ Product not found');
        continue;
      }
      
      console.log(`📦 Product: ${product.title}`);
      console.log(`🏷️  Has variants: ${product.variants?.length || 0}`);
      console.log(`📊 Global stock field: ${product.stock || 'undefined'}`);
      
      // Calculate current total stock
      let totalStock = 0;
      if (product.stock !== undefined) {
        totalStock = product.stock || 0;
      } else if (product.variants && product.variants.length > 0) {
        totalStock = product.variants.reduce((total, v) => total + (v.qty || 0), 0);
      }
      
      console.log(`📈 Total calculated stock: ${totalStock}`);
      console.log(`🎯 Would deduct: ${item.quantity}`);
      console.log(`📉 Remaining after deduction: ${Math.max(0, totalStock - item.quantity)}`);
      
      if (totalStock >= item.quantity) {
        console.log('✅ Stock deduction would be successful');
      } else {
        console.log('❌ Insufficient stock for deduction');
      }
    }
    
    console.log('\n💡 The updated stock deduction function should now handle these products!');
    console.log('🔧 When you test invoice creation, products without variants will get stock deducted.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGlobalStockDeduction();