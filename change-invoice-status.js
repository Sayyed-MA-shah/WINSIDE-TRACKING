// Change WIN-INV-326 status back to draft
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function changeInvoiceStatusToDraft() {
  console.log('🔄 Changing WIN-INV-326 status to draft...');
  
  try {
    // Update the invoice status to draft
    const { data, error } = await supabase
      .from('invoices')
      .update({ 
        status: 'draft'
      })
      .eq('invoice_number', 'WIN-INV-326')
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating invoice status:', error);
      return;
    }
    
    console.log('✅ Successfully changed invoice status!');
    console.log(`📋 Invoice: ${data.invoice_number}`);
    console.log(`📊 Old Status: sent → New Status: ${data.status}`);
    console.log(`🕒 Invoice created: ${data.created_at}`);
    console.log(`📝 Items: ${data.items?.length || 0} items ready for stock deduction`);
    
    console.log('\n🎯 Now you can:');
    console.log('1. Go to the invoice edit page');
    console.log('2. Change status from "draft" to "sent"');
    console.log('3. Watch the improved stock deduction work for all 25 items!');
    
  } catch (error) {
    console.error('❌ Failed to update invoice:', error);
  }
}

changeInvoiceStatusToDraft();