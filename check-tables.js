const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  console.log('🔍 Checking existing tables...');
  
  // Check main system tables
  console.log('\n--- MAIN SYSTEM TABLES ---');
  const tables = ['products', 'customers', 'invoices'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: EXISTS`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
  
  // Check insole system tables
  console.log('\n--- INSOLE SYSTEM TABLES ---');
  const insoleTables = ['insole_products', 'insole_customers', 'insole_invoices', 'insole_users', 'insole_product_attributes'];
  
  for (const table of insoleTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: EXISTS`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

checkTables().then(() => {
  console.log('\n🏁 Table check completed');
}).catch(error => {
  console.error('💥 Check failed:', error);
});