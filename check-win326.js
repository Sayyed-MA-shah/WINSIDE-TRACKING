// Check invoice WIN-INV-326 stock deduction
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkInvoiceWIN326() {
  console.log('🔍 Checking invoice WIN-INV-326 stock deduction...');
  
  try {
    // Get the specific invoice WIN-INV-326
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('invoice_number', 'WIN-INV-326')
      .single();
    
    if (error) {
      console.error('❌ Error fetching invoice:', error);
      return;
    }
    
    console.log(`📋 Invoice Details:`);
    console.log(`  Number: ${invoice.invoice_number}`);
    console.log(`  Status: ${invoice.status}`);
    console.log(`  Created: ${invoice.created_at}`);
    console.log(`  Items: ${invoice.items?.length || 0}`);
    
    if (invoice.status === 'sent') {
      console.log('✅ Invoice status is "sent" - stock deduction should have been triggered');
    } else {
      console.log(`⚠️  Invoice status is "${invoice.status}" - stock deduction only triggers with "sent" status`);
    }
    
    console.log('\n📦 Checking each item for stock deduction...');
    
    for (let i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      console.log(`\n--- Item ${i + 1} ---`);
      console.log(`Product ID: ${item.productId}`);
      console.log(`Variant ID: ${item.variantId}`);
      console.log(`Quantity: ${item.quantity}`);
      
      // Get the current product and variant
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.productId)
        .single();
      
      if (!product) {
        console.log('❌ Product not found');
        continue;
      }
      
      console.log(`Product: ${product.title} (${product.article})`);
      console.log(`Last Updated: ${product.updated_at}`);
      
      if (item.variantId) {
        const variant = product.variants?.find(v => v.id === item.variantId);
        if (!variant) {
          console.log('❌ VARIANT MISMATCH!');
          console.log(`  Requested: ${item.variantId}`);
          console.log(`  Available: ${product.variants?.map(v => v.id).join(', ') || 'none'}`);
          console.log('💡 This explains why stock wasn\'t deducted!');
        } else {
          console.log(`✅ Variant found: ${variant.sku}`);
          console.log(`Current Stock: ${variant.qty}`);
          
          // Check if stock was likely deducted by looking at update time
          const invoiceDate = new Date(invoice.created_at);
          const productUpdate = new Date(product.updated_at);
          
          if (productUpdate > invoiceDate) {
            console.log('✅ Product was updated after invoice creation - stock likely deducted');
          } else {
            console.log('⚠️  Product not updated after invoice - stock may not have been deducted');
          }
          
          console.log(`Expected stock after deduction: ${variant.qty} (should be original - ${item.quantity})`);
        }
      } else {
        console.log('⚠️  No variant ID - product without variants');
      }
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkInvoiceWIN326();