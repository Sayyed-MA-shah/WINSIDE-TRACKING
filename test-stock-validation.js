// Test the improved stock deduction with better error logging
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mock the functions we need from shared-db.ts
async function testValidateStockAvailability(invoiceItems) {
  console.log('🔍 Testing stock validation with improved error logging...');
  
  for (const item of invoiceItems) {
    console.log(`\n📋 Checking item:`, {
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity
    });
    
    // Get the product
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', item.productId)
      .single();
    
    if (error) {
      console.error('❌ Product not found:', error);
      continue;
    }
    
    console.log(`📦 Product found: ${product.title}`);
    console.log(`🏷️  Available variants:`, product.variants?.map(v => ({ id: v.id, sku: v.sku, qty: v.qty })) || []);
    
    // Check if variant exists
    if (item.variantId) {
      const variant = product.variants?.find(v => v.id === item.variantId);
      if (!variant) {
        console.error('❌ VARIANT MISMATCH:', {
          requestedVariantId: item.variantId,
          availableVariantIds: product.variants?.map(v => v.id) || [],
          productTitle: product.title
        });
        console.log('💡 This is why stock deduction fails silently!');
      } else {
        console.log(`✅ Variant found: ${variant.sku} (${variant.qty} units available)`);
        if (variant.qty >= item.quantity) {
          console.log(`✅ Stock sufficient: ${variant.qty} >= ${item.quantity}`);
        } else {
          console.log(`❌ Insufficient stock: ${variant.qty} < ${item.quantity}`);
        }
      }
    }
  }
}

async function runDiagnostic() {
  console.log('🧪 Running stock deduction diagnostic...\n');
  
  // Test with the problematic invoice WIN-INV-330
  const problemInvoiceItems = [
    {
      id: "existing_item_0_1757864317796_9coew",
      total: 149.95,
      quantity: 5,
      productId: "baf89ba3-8a05-481a-8fe2-05f40aad9287",
      unitPrice: 29.99,
      variantId: "variant-5928kef0s"
    }
  ];
  
  await testValidateStockAvailability(problemInvoiceItems);
  
  console.log('\n🔍 Now testing with a corrected variant ID...');
  
  // Get the actual variant IDs for this product and test with the correct one
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', 'baf89ba3-8a05-481a-8fe2-05f40aad9287')
    .single();
  
  if (product && product.variants && product.variants.length > 0) {
    const correctedItems = [
      {
        id: "test_item",
        total: 149.95,
        quantity: 2,
        productId: "baf89ba3-8a05-481a-8fe2-05f40aad9287",
        unitPrice: 29.99,
        variantId: product.variants[0].id // Use the actual first variant ID
      }
    ];
    
    await testValidateStockAvailability(correctedItems);
  }
}

runDiagnostic();