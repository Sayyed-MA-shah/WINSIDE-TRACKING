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

    // Read all products with variants (handle gracefully if table doesn't exist)
    let products = [];
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          variants (*)
        `)
        .order('created_at', { ascending: true });

      if (productsError) {
        console.warn('Could not read products with variants, trying without variants:', productsError);
        
        // Try without variants relationship
        const { data: simpleProducts, error: simpleError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: true });
          
        if (simpleError) {
          console.warn('Could not read products table:', simpleError);
        } else {
          products = simpleProducts || [];
        }
      } else {
        products = productsData || [];
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
