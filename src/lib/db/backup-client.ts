import { supabase } from '../supabase';
import { Customer, Product, Invoice } from '../types';

// Safe backup function using regular supabase client (no service role needed)
export async function createClientBackup(): Promise<{
  success: boolean;
  data?: {
    customers: Customer[];
    products: Product[];
    invoices: Invoice[];
    timestamp: string;
    version: string;
  };
  error?: string;
}> {
  try {
    console.log('🔄 Creating backup with regular client access...');

    // Read all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: true });

    if (customersError) {
      console.warn('Could not read customers:', customersError);
    }

    // Read all products (use same approach as getAllProducts function)
    let products = [];
    try {
      console.log('🔍 Fetching products...');
      
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.warn('Could not read products table:', productsError);
      } else {
        products = productsData || [];
        console.log(`📦 Found ${products.length} products in database`);
      }
      
      // Try to get variants separately if products exist
      if (products.length > 0) {
        try {
          const { data: variantsData, error: variantsError } = await supabase
            .from('variants')
            .select('*');
            
          if (!variantsError && variantsData) {
            console.log(`🔗 Found ${variantsData.length} variants`);
            // Attach variants to products
            products = products.map(product => ({
              ...product,
              variants: variantsData.filter(variant => variant.product_id === product.id)
            }));
          }
        } catch (variantError) {
          console.warn('Could not fetch variants, continuing without them:', variantError);
        }
      }
    } catch (error) {
      console.warn('Products table may not exist:', error);
    }

    // Read all invoices
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: true });

    if (invoicesError) {
      console.warn('Could not read invoices:', invoicesError);
    }

    const backup = {
      customers: customers || [],
      products: products || [],
      invoices: invoices || [],
      timestamp: new Date().toISOString(),
      version: '1.0',
      metadata: {
        totalCustomers: customers?.length || 0,
        totalProducts: products?.length || 0,
        totalInvoices: invoices?.length || 0,
        backupType: 'client',
        source: 'WINSIDE Dashboard (Client Access)'
      }
    };

    console.log('✅ Client backup created successfully');
    console.log(`📊 Backup contains: ${backup.metadata.totalCustomers} customers, ${backup.metadata.totalProducts} products, ${backup.metadata.totalInvoices} invoices`);

    return {
      success: true,
      data: backup
    };

  } catch (error) {
    console.error('❌ Client backup failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Helper function to download backup as JSON file
export function downloadBackup(backupData: any): void {
  const dataStr = JSON.stringify(backupData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `winside-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
