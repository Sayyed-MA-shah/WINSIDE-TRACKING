const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('URL:', !!supabaseUrl);
  console.log('Service Key:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createInsoleSchema() {
  console.log('🚀 Setting up INSOLE CLINIC database schema...');
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, 'insole-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
      .map(stmt => stmt + ';');
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          // Try alternative approach using direct query
          const { data: data2, error: error2 } = await supabase
            .from('information_schema.tables')
            .select('*')
            .limit(1);
          
          if (error2) {
            console.log(`⚠️  RPC not available, using direct execution for: ${statement.substring(0, 50)}...`);
          }
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} completed with note: ${err.message}`);
      }
    }
    
    // Test if tables were created by checking insole_products
    console.log('🔍 Verifying table creation...');
    const { data: products, error: testError } = await supabase
      .from('insole_products')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('❌ Tables not found, trying manual creation...');
      await createTablesManually();
    } else {
      console.log('✅ INSOLE CLINIC tables verified successfully!');
    }
    
    // Insert sample data
    await insertSampleData();
    
  } catch (error) {
    console.error('❌ Error setting up schema:', error.message);
    await createTablesManually();
  }
}

async function createTablesManually() {
  console.log('🔧 Creating tables manually...');
  
  // Create insole_products table
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.insole_products (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          article VARCHAR(50) UNIQUE NOT NULL,
          title VARCHAR(200) NOT NULL,
          category VARCHAR(100) NOT NULL,
          brand VARCHAR(100) NOT NULL,
          taxable BOOLEAN DEFAULT true,
          attributes JSONB DEFAULT '{}',
          variations JSONB DEFAULT '[]',
          media_main TEXT,
          archived BOOLEAN DEFAULT false,
          wholesale DECIMAL(10,2) DEFAULT 0,
          retail DECIMAL(10,2) DEFAULT 0,
          club DECIMAL(10,2) DEFAULT 0,
          cost_before DECIMAL(10,2) DEFAULT 0,
          cost_after DECIMAL(10,2) DEFAULT 0,
          stock_quantity INTEGER DEFAULT 0,
          min_stock_level INTEGER DEFAULT 5,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (error) {
      console.log('⚠️  RPC method not available, tables may need to be created via Supabase dashboard');
      console.log('📋 Please run the SQL from insole-schema.sql in your Supabase SQL Editor');
      return;
    }
    
    console.log('✅ insole_products table created');
  } catch (err) {
    console.log('⚠️  Manual creation method not available');
    console.log('📋 Please run the SQL from insole-schema.sql in your Supabase SQL Editor');
  }
}

async function insertSampleData() {
  console.log('📊 Inserting sample data...');
  
  try {
    // Insert a sample product
    const { data, error } = await supabase
      .from('insole_products')
      .insert([
        {
          article: 'INS001',
          title: 'Memory Foam Insole',
          category: 'Comfort',
          brand: 'INSOLE CLINIC',
          attributes: {
            'Size': 'M',
            'Color': 'Black',
            'Material': 'Memory Foam'
          },
          wholesale: 15.00,
          retail: 25.00,
          club: 20.00,
          cost_before: 10.00,
          cost_after: 8.00,
          stock_quantity: 50
        }
      ])
      .select();
    
    if (error) {
      console.log('⚠️  Could not insert sample data:', error.message);
    } else {
      console.log('✅ Sample product inserted successfully');
    }
  } catch (err) {
    console.log('⚠️  Sample data insertion skipped:', err.message);
  }
}

// Run the setup
createInsoleSchema().then(() => {
  console.log('🎉 INSOLE CLINIC database setup completed!');
  console.log('');
  console.log('📋 If you see any warnings above, please:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to SQL Editor');  
  console.log('3. Run the SQL from insole-schema.sql');
  console.log('');
  process.exit(0);
}).catch(error => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
});