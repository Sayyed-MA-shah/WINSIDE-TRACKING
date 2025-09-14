// Check specific product stock for invoice WIN-INV-330
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSpecificProductStock() {
  console.log('🔍 Checking stock for product in invoice WIN-INV-330...');
  
  try {
    // Get the specific product: baf89ba3-8a05-481a-8fe2-05f40aad9287
    // Variant: variant-5928kef0s
    // Quantity ordered: 5
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', 'baf89ba3-8a05-481a-8fe2-05f40aad9287')
      .single();
    
    if (error) {
      console.error('❌ Error fetching product:', error);
      return;
    }
    
    console.log(`📦 Product: ${product.title} (${product.article})`);
    console.log(`🏷️  Brand: ${product.brand}`);
    console.log(`📅 Last Updated: ${product.updated_at}`);
    
    const targetVariant = product.variants?.find(v => v.id === 'variant-5928kef0s');
    
    if (targetVariant) {
      console.log(`\n🎯 Target Variant: ${targetVariant.sku}`);
      console.log(`📊 Current Stock: ${targetVariant.qty}`);
      console.log(`📋 Invoice Quantity: 5`);
      console.log(`🧮 Expected Stock After Deduction: ${targetVariant.qty} (should be original stock - 5)`);
      
      if (targetVariant.qty > 50) {
        console.log(`\n⚠️  Stock level seems high - deduction might not have happened!`);
        console.log(`   If stock deduction worked, this should be much lower.`);
      } else {
        console.log(`\n✅ Stock level looks like deduction might have happened.`);
      }
    } else {
      console.log('❌ Target variant not found!');
    }
    
    console.log('\n🔍 All variants for this product:');
    product.variants?.forEach(variant => {
      console.log(`  ${variant.sku}: ${variant.qty} units`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

checkSpecificProductStock();