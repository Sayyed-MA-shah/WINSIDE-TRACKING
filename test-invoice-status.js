// Test stock deduction with invoice status
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInvoiceStockDeduction() {
  console.log('🧪 Testing invoice status and stock deduction...');
  console.log('🕒 Test run at:', new Date().toISOString());
  
  try {
    // Check recent invoices and their status
    const { data: recentInvoices, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, status, items, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching invoices:', error);
      return;
    }
    
    console.log('📋 Recent invoices and their status:');
    recentInvoices?.forEach(invoice => {
      console.log(`  ${invoice.invoice_number}: ${invoice.status} (${invoice.items?.length || 0} items) - ${invoice.created_at}`);
    });
    
    // Check if any invoices have status 'sent' (which triggers stock deduction)
    const sentInvoices = recentInvoices?.filter(inv => inv.status === 'sent') || [];
    console.log(`\n📤 Invoices with "sent" status (triggers stock deduction): ${sentInvoices.length}`);
    
    const draftInvoices = recentInvoices?.filter(inv => inv.status === 'draft') || [];
    console.log(`📝 Invoices with "draft" status (no stock deduction): ${draftInvoices.length}`);
    
    const paidInvoices = recentInvoices?.filter(inv => inv.status === 'paid') || [];
    console.log(`💰 Invoices with "paid" status: ${paidInvoices.length}`);
    
    // Look at the most recent invoice in detail
    if (recentInvoices && recentInvoices.length > 0) {
      const latestInvoice = recentInvoices[0];
      console.log(`\n🔍 Latest invoice details:`);
      console.log(`  ID: ${latestInvoice.id}`);
      console.log(`  Number: ${latestInvoice.invoice_number}`);
      console.log(`  Status: ${latestInvoice.status}`);
      console.log(`  Items: ${JSON.stringify(latestInvoice.items, null, 2)}`);
      
      // Check if this invoice should have triggered stock deduction
      if (latestInvoice.status === 'sent' && latestInvoice.items?.length > 0) {
        console.log(`\n✅ This invoice SHOULD have triggered stock deduction!`);
        
        // Let's check the current stock of the products in this invoice
        for (const item of latestInvoice.items) {
          if (item.productId && item.variantId) {
            const { data: product } = await supabase
              .from('products')
              .select('*')
              .eq('id', item.productId)
              .single();
            
            if (product) {
              const variant = product.variants?.find(v => v.id === item.variantId);
              if (variant) {
                console.log(`    Product: ${product.title}`);
                console.log(`    Variant: ${variant.sku}`);
                console.log(`    Invoice Qty: ${item.quantity}`);
                console.log(`    Current Stock: ${variant.qty}`);
                console.log(`    Expected Stock After: ${variant.qty} (should be original - ${item.quantity})`);
              }
            }
          }
        }
      } else if (latestInvoice.status !== 'sent') {
        console.log(`\n⚠️  This invoice status is "${latestInvoice.status}" - stock deduction only happens with "sent" status!`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testInvoiceStockDeduction();