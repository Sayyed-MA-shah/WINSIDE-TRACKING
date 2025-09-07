import { supabaseAdmin } from '../supabase';
import { Customer, Product, Invoice } from '../types';

// Safe backup function - only reads data, never modifies
export async function createBackup(): Promise<{
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
    console.log('🔄 Creating backup - reading data only...');

    // Check if supabaseAdmin is properly configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available - this operation must be run server-side');
    }

    // Read all customers
    const { data: customers, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .order('created_at', { ascending: true });

    if (customersError) throw customersError;

    // Read all products with variants
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        variants (*)
      `)
      .order('created_at', { ascending: true });

    if (productsError) throw productsError;

    // Read all invoices
    const { data: invoices, error: invoicesError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: true });

    if (invoicesError) throw invoicesError;

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
        backupType: 'full',
        source: 'WINSIDE Dashboard'
      }
    };

    console.log('✅ Backup created successfully');
    console.log(`📊 Backup contains: ${backup.metadata.totalCustomers} customers, ${backup.metadata.totalProducts} products, ${backup.metadata.totalInvoices} invoices`);

    return {
      success: true,
      data: backup
    };

  } catch (error) {
    console.error('❌ Backup failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Safe restore function - only adds new data or updates existing (never deletes)
export async function restoreFromBackup(backupData: {
  customers: any[];
  products: any[];
  invoices: any[];
  timestamp: string;
  version: string;
}): Promise<{
  success: boolean;
  summary?: {
    customersProcessed: number;
    productsProcessed: number;
    invoicesProcessed: number;
    customersAdded: number;
    productsAdded: number;
    invoicesAdded: number;
    customersUpdated: number;
    productsUpdated: number;
    invoicesUpdated: number;
  };
  error?: string;
}> {
  try {
    console.log('🔄 Starting safe restore process...');
    console.log('⚠️  SAFE MODE: Only adding new data or updating existing. No deletions.');

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available - this operation must be run server-side');
    }

    const summary = {
      customersProcessed: 0,
      productsProcessed: 0,
      invoicesProcessed: 0,
      customersAdded: 0,
      productsAdded: 0,
      invoicesAdded: 0,
      customersUpdated: 0,
      productsUpdated: 0,
      invoicesUpdated: 0
    };

    // Restore customers safely
    console.log('👥 Processing customers...');
    for (const customer of backupData.customers) {
      summary.customersProcessed++;
      
      // Check if customer exists
      const { data: existing } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('id', customer.id)
        .single();

      if (existing) {
        // Update existing customer
        const { error } = await supabaseAdmin
          .from('customers')
          .update({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            company: customer.company,
            address: customer.address,
            type: customer.type,
            updated_at: new Date().toISOString()
          })
          .eq('id', customer.id);

        if (!error) summary.customersUpdated++;
      } else {
        // Add new customer
        const { error } = await supabaseAdmin
          .from('customers')
          .insert([{
            ...customer,
            created_at: customer.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (!error) summary.customersAdded++;
      }
    }

    // Restore products safely
    console.log('📦 Processing products...');
    for (const product of backupData.products) {
      summary.productsProcessed++;
      
      // Check if product exists
      const { data: existing } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('id', product.id)
        .single();

      if (existing) {
        // Update existing product
        const { variants, ...productData } = product;
        const { error } = await supabaseAdmin
          .from('products')
          .update({
            ...productData,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id);

        if (!error) summary.productsUpdated++;
      } else {
        // Add new product
        const { variants, ...productData } = product;
        const { error: productError } = await supabaseAdmin
          .from('products')
          .insert([{
            ...productData,
            created_at: product.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (!productError) {
          summary.productsAdded++;
          
          // Add variants if they exist
          if (variants && variants.length > 0) {
            await supabaseAdmin
              .from('variants')
              .insert(variants.map((variant: any) => ({
                ...variant,
                created_at: variant.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
              })));
          }
        }
      }
    }

    // Restore invoices safely
    console.log('🧾 Processing invoices...');
    for (const invoice of backupData.invoices) {
      summary.invoicesProcessed++;
      
      // Check if invoice exists
      const { data: existing } = await supabaseAdmin
        .from('invoices')
        .select('id')
        .eq('id', invoice.id)
        .single();

      if (existing) {
        // Update existing invoice
        const { error } = await supabaseAdmin
          .from('invoices')
          .update({
            ...invoice,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoice.id);

        if (!error) summary.invoicesUpdated++;
      } else {
        // Add new invoice
        const { error } = await supabaseAdmin
          .from('invoices')
          .insert([{
            ...invoice,
            created_at: invoice.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (!error) summary.invoicesAdded++;
      }
    }

    console.log('✅ Restore completed successfully');
    console.log('📊 Summary:', summary);

    return {
      success: true,
      summary
    };

  } catch (error) {
    console.error('❌ Restore failed:', error);
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

// Helper function to validate backup file
export function validateBackupFile(backupData: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!backupData.timestamp) errors.push('Missing timestamp');
  if (!backupData.version) errors.push('Missing version');
  if (!Array.isArray(backupData.customers)) errors.push('Invalid customers data');
  if (!Array.isArray(backupData.products)) errors.push('Invalid products data');
  if (!Array.isArray(backupData.invoices)) errors.push('Invalid invoices data');

  return {
    valid: errors.length === 0,
    errors
  };
}
