// Emergency diagnostic tool for production environment
// Add this to your production app temporarily to debug stock issues

export function createStockDiagnostic() {
  const runDiagnostic = async () => {
    console.log('🔍 WINSIDE Stock Diagnostic Tool');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Database URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');
    
    // This will run when an invoice is created/edited
    window.WINSIDE_DEBUG = {
      logInvoiceStockDeduction: (invoiceItems, stockResult) => {
        console.group('📊 STOCK DEDUCTION DEBUG');
        console.log('Invoice Items:', invoiceItems);
        console.log('Stock Deduction Result:', stockResult);
        
        if (!stockResult.success) {
          console.error('❌ STOCK DEDUCTION FAILED!');
          console.error('Errors:', stockResult.errors);
        } else {
          console.log('✅ Stock deduction successful');
          console.log('Deductions:', stockResult.deductions);
        }
        console.groupEnd();
      },
      
      validateVariantIds: async (invoiceItems) => {
        const supabase = (await import('../lib/supabase')).supabase;
        
        for (const item of invoiceItems) {
          if (item.variantId) {
            const { data: product } = await supabase
              .from('products')
              .select('*')
              .eq('id', item.productId)
              .single();
            
            if (product) {
              const variantExists = product.variants?.some(v => v.id === item.variantId);
              if (!variantExists) {
                console.error('❌ VARIANT MISMATCH DETECTED:', {
                  productTitle: product.title,
                  invoiceVariantId: item.variantId,
                  availableVariantIds: product.variants?.map(v => v.id) || []
                });
              } else {
                console.log('✅ Variant ID valid:', item.variantId);
              }
            }
          }
        }
      }
    };
    
    console.log('✅ Diagnostic tool loaded. Check WINSIDE_DEBUG for debugging functions.');
  };
  
  return runDiagnostic;
}

// Usage: Add this to your main layout or app component:
// import { createStockDiagnostic } from './path/to/this/file';
// useEffect(() => {
//   createStockDiagnostic()();
// }, []);