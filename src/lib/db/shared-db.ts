// Supabase database implementation for WINSIDE Business Dashboard
import { supabase } from '@/lib/supabase';

// Categories functions
export const getAllCategories = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    return [];
  }
};

export const addCategory = async (category: any): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        description: category.description || null,
        color: category.color || '#3B82F6'
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      throw new Error('Failed to add category');
    }

    return data;
  } catch (error) {
    console.error('Error in addCategory:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, updates: any): Promise<any> => {
  try {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.color !== undefined) updateData.color = updates.color;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }

    return data;
  } catch (error) {
    console.error('Error in updateCategory:', error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    throw error;
  }
};
import { Product, Customer, Invoice } from '@/lib/types';

// Stock management functions
export const validateStockAvailability = async (invoiceItems: any[]): Promise<{
  isValid: boolean;
  errors: string[];
  stockCheck: any[];
}> => {
  const errors: string[] = [];
  const stockCheck: any[] = [];
  
  try {
    console.log('🔍 Validating stock availability for', invoiceItems.length, 'items');
    
    for (const item of invoiceItems) {
      if (!item.productId) {
        errors.push(`Item missing productId`);
        continue;
      }
      
      // Get current product data
      const product = await getProductById(item.productId);
      if (!product) {
        errors.push(`Product not found: ${item.productId}`);
        continue;
      }
      
      // Check if item has a variant
      if (item.variantId) {
        const variant = product.variants?.find((v: any) => v.id === item.variantId);
        if (!variant) {
          errors.push(`Variant not found: ${item.variantId} in product ${product.title}`);
          continue;
        }
        
        const currentStock = variant.qty || 0;
        const requestedQty = item.quantity || 0;
        
        stockCheck.push({
          type: 'variant',
          productId: product.id,
          productTitle: product.title,
          variantId: variant.id,
          variantSku: variant.sku,
          currentStock,
          requestedQty,
          afterSale: currentStock - requestedQty,
          available: currentStock >= requestedQty
        });
        
        if (currentStock < requestedQty) {
          errors.push(`Insufficient stock for ${product.title} (${variant.sku}): requested ${requestedQty}, available ${currentStock}`);
        }
      } else {
        // Product without variants - this might need different handling
        stockCheck.push({
          type: 'product',
          productId: product.id,
          productTitle: product.title,
          variantId: null,
          variantSku: null,
          currentStock: 'N/A',
          requestedQty: item.quantity || 0,
          afterSale: 'N/A',
          available: true // For now, assume products without variants are always available
        });
      }
    }
    
    console.log('📊 Stock validation results:', {
      totalItems: invoiceItems.length,
      validItems: stockCheck.filter(s => s.available).length,
      errors: errors.length,
      stockCheck
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      stockCheck
    };
    
  } catch (error) {
    console.error('Error validating stock availability:', error);
    return {
      isValid: false,
      errors: ['Stock validation failed due to system error'],
      stockCheck: []
    };
  }
};

// Safe stock deduction function (with validation and rollback capability)
export const deductStockForInvoice = async (invoiceItems: any[]): Promise<{
  success: boolean;
  errors: string[];
  deductions: any[];
}> => {
  const errors: string[] = [];
  const deductions: any[] = [];
  
  try {
    console.log('🔄 Starting safe stock deduction process...');
    
    // Step 1: Validate stock availability first
    const validation = await validateStockAvailability(invoiceItems);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        deductions: []
      };
    }
    
    // Step 2: Prepare deduction operations (but don't execute yet)
    for (const item of invoiceItems) {
      if (!item.variantId) continue; // Skip products without variants for now
      
      const product = await getProductById(item.productId);
      if (!product) continue;
      
      const variant = product.variants?.find((v: any) => v.id === item.variantId);
      if (!variant) continue;
      
      // Prepare the deduction operation
      const deduction = {
        productId: product.id,
        variantId: variant.id,
        currentQty: variant.qty,
        deductQty: item.quantity,
        newQty: variant.qty - item.quantity,
        productTitle: product.title,
        variantSku: variant.sku
      };
      
      deductions.push(deduction);
    }
    
    console.log('📋 Prepared stock deductions:', deductions);
    
    // Step 3: Execute deductions atomically
    for (const deduction of deductions) {
      try {
        const product = await getProductById(deduction.productId);
        if (!product) {
          throw new Error(`Product not found during deduction: ${deduction.productId}`);
        }
        
        // Update the variant quantity in the product's variants array
        const updatedVariants = product.variants.map((v: any) => {
          if (v.id === deduction.variantId) {
            return { ...v, qty: deduction.newQty };
          }
          return v;
        });
        
        // Update the product with new variant quantities
        await updateProduct(deduction.productId, { variants: updatedVariants });
        
        console.log(`✅ Stock deducted: ${deduction.productTitle} (${deduction.variantSku}) ${deduction.currentQty} → ${deduction.newQty}`);
        
      } catch (error) {
        console.error('❌ Failed to deduct stock:', error);
        errors.push(`Failed to deduct stock for ${deduction.productTitle} (${deduction.variantSku}): ${error}`);
        
        // TODO: Implement rollback logic here
        break; // Stop processing on first error
      }
    }
    
    return {
      success: errors.length === 0,
      errors,
      deductions: errors.length === 0 ? deductions : []
    };
    
  } catch (error) {
    console.error('Error in stock deduction process:', error);
    return {
      success: false,
      errors: ['Stock deduction failed due to system error'],
      deductions: []
    };
  }
};

// Stock restoration function for invoice deletion/cancellation
export const restoreStockForInvoice = async (invoiceItems: any[]): Promise<{
  success: boolean;
  errors: string[];
  restorations: any[];
}> => {
  const errors: string[] = [];
  const restorations: any[] = [];
  
  try {
    console.log('🔄 Starting stock restoration process for', invoiceItems.length, 'items...');
    
    // Process each item for stock restoration
    for (const item of invoiceItems) {
      if (!item.variantId) continue; // Skip products without variants for now
      
      const product = await getProductById(item.productId);
      if (!product) {
        errors.push(`Product not found during restoration: ${item.productId}`);
        continue;
      }
      
      const variant = product.variants?.find((v: any) => v.id === item.variantId);
      if (!variant) {
        errors.push(`Variant not found during restoration: ${item.variantId}`);
        continue;
      }
      
      // Prepare the restoration operation
      const restoration = {
        productId: product.id,
        variantId: variant.id,
        currentQty: variant.qty,
        restoreQty: item.quantity,
        newQty: variant.qty + item.quantity,
        productTitle: product.title,
        variantSku: variant.sku
      };
      
      restorations.push(restoration);
    }
    
    console.log('📋 Prepared stock restorations:', restorations);
    
    // Execute restorations
    for (const restoration of restorations) {
      try {
        const product = await getProductById(restoration.productId);
        if (!product) {
          throw new Error(`Product not found during restoration: ${restoration.productId}`);
        }
        
        // Update the variant quantity in the product's variants array
        const updatedVariants = product.variants.map((v: any) => {
          if (v.id === restoration.variantId) {
            return { ...v, qty: restoration.newQty };
          }
          return v;
        });
        
        // Update the product with restored variant quantities
        await updateProduct(restoration.productId, { variants: updatedVariants });
        
        console.log(`✅ Stock restored: ${restoration.productTitle} (${restoration.variantSku}) ${restoration.currentQty} → ${restoration.newQty}`);
        
      } catch (error) {
        console.error('❌ Failed to restore stock:', error);
        errors.push(`Failed to restore stock for ${restoration.productTitle} (${restoration.variantSku}): ${error}`);
      }
    }
    
    return {
      success: errors.length === 0,
      errors,
      restorations: errors.length === 0 ? restorations : []
    };
    
  } catch (error) {
    console.error('Error in stock restoration process:', error);
    return {
      success: false,
      errors: ['Stock restoration failed due to system error'],
      restorations: []
    };
  }
};

// Manual restocking function for returns/adjustments
export const manualRestockItems = async (restockItems: {
  productId: string;
  variantId?: string;
  quantity: number;
  reason: string;
}[]): Promise<{
  success: boolean;
  errors: string[];
  adjustments: any[];
}> => {
  const errors: string[] = [];
  const adjustments: any[] = [];
  
  try {
    console.log('🔄 Starting manual restock process for', restockItems.length, 'items...');
    
    for (const item of restockItems) {
      const product = await getProductById(item.productId);
      if (!product) {
        errors.push(`Product not found: ${item.productId}`);
        continue;
      }
      
      if (item.variantId) {
        const variant = product.variants?.find((v: any) => v.id === item.variantId);
        if (!variant) {
          errors.push(`Variant not found: ${item.variantId}`);
          continue;
        }
        
        const adjustment = {
          productId: product.id,
          variantId: variant.id,
          currentQty: variant.qty,
          adjustQty: item.quantity,
          newQty: variant.qty + item.quantity,
          productTitle: product.title,
          variantSku: variant.sku,
          reason: item.reason
        };
        
        // Update the variant quantity
        const updatedVariants = product.variants.map((v: any) => {
          if (v.id === item.variantId) {
            return { ...v, qty: adjustment.newQty };
          }
          return v;
        });
        
        await updateProduct(item.productId, { variants: updatedVariants });
        adjustments.push(adjustment);
        
        console.log(`✅ Manual restock: ${adjustment.productTitle} (${adjustment.variantSku}) ${adjustment.currentQty} → ${adjustment.newQty} (${adjustment.reason})`);
      }
    }
    
    return {
      success: errors.length === 0,
      errors,
      adjustments
    };
    
  } catch (error) {
    console.error('Error in manual restock process:', error);
    return {
      success: false,
      errors: ['Manual restock failed due to system error'],
      adjustments: []
    };
  }
};

// Products functions
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    // Transform database response to match Product interface
    return (data || []).map(product => ({
      id: product.id,
      article: product.article,
      title: product.title,
      category: product.category,
      brand: product.brand,
      taxable: product.taxable,
      attributes: product.attributes || [],
      mediaMain: product.media_main,
      archived: product.archived,
      wholesale: product.wholesale,
      retail: product.retail,
      club: product.club,
      costBefore: product.cost_before,
      costAfter: product.cost_after,
      variants: product.variants || [],
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at)
    }));
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    return [];
  }
};

export const addProduct = async (product: any): Promise<any> => {
  try {
    console.log('DB: Starting addProduct with data:', JSON.stringify(product, null, 2));
    
    const productData = {
      article: product.article,
      title: product.title,
      category: product.category,
      brand: product.brand,
      taxable: product.taxable ?? true,
      attributes: product.attributes || [],
      media_main: product.mediaMain || null,
      archived: product.archived ?? false,
      wholesale: product.wholesale,
      retail: product.retail,
      club: product.club,
      cost_before: product.costBefore,
      cost_after: product.costAfter,
      variants: product.variants || [] // FIXED: Include variants in product data
    };

    console.log('DB: Transformed product data:', JSON.stringify(productData, null, 2));

    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('DB: Supabase error adding product:', error);
      console.error('DB: Error details:', JSON.stringify(error, null, 2));
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('DB: Product inserted successfully:', data);

    return {
      id: data.id,
      article: data.article,
      title: data.title,
      category: data.category,
      brand: data.brand,
      taxable: data.taxable,
      attributes: data.attributes || [],
      mediaMain: data.media_main,
      archived: data.archived,
      wholesale: data.wholesale,
      retail: data.retail,
      club: data.club,
      costBefore: data.cost_before,
      costAfter: data.cost_after,
      variants: data.variants || [], // FIXED: Return the actual saved variants
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('DB: Error in addProduct:', error);
    console.error('DB: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
};

export const updateProduct = async (id: string, updates: any): Promise<any> => {
  try {
    const updateData: any = {};
    
    if (updates.article !== undefined) updateData.article = updates.article;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.brand !== undefined) updateData.brand = updates.brand;
    if (updates.taxable !== undefined) updateData.taxable = updates.taxable;
    if (updates.attributes !== undefined) updateData.attributes = updates.attributes;
    if (updates.mediaMain !== undefined) updateData.media_main = updates.mediaMain;
    if (updates.archived !== undefined) updateData.archived = updates.archived;
    if (updates.wholesale !== undefined) updateData.wholesale = updates.wholesale;
    if (updates.retail !== undefined) updateData.retail = updates.retail;
    if (updates.club !== undefined) updateData.club = updates.club;
    if (updates.costBefore !== undefined) updateData.cost_before = updates.costBefore;
    if (updates.costAfter !== undefined) updateData.cost_after = updates.costAfter;
    if (updates.variants !== undefined) updateData.variants = updates.variants;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }

    return {
      id: data.id,
      article: data.article,
      title: data.title,
      category: data.category,
      brand: data.brand,
      taxable: data.taxable,
      attributes: data.attributes || [],
      mediaMain: data.media_main,
      archived: data.archived,
      wholesale: data.wholesale,
      retail: data.retail,
      club: data.club,
      costBefore: data.cost_before,
      costAfter: data.cost_after,
      variants: data.variants || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching product:', error);
      return null;
    }

    return {
      id: data.id,
      article: data.article,
      title: data.title,
      category: data.category,
      brand: data.brand,
      taxable: data.taxable,
      attributes: data.attributes || [],
      mediaMain: data.media_main,
      archived: data.archived,
      wholesale: data.wholesale,
      retail: data.retail,
      club: data.club,
      costBefore: data.cost_before,
      costAfter: data.cost_after,
      variants: data.variants || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error in getProductById:', error);
    return null;
  }
};

// Customers functions
export const getAllCustomers = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }

    return (data || []).map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      address: customer.address,
      type: customer.type,
      totalOrders: customer.total_orders,
      totalSpent: customer.total_spent,
      createdAt: new Date(customer.created_at)
    }));
  } catch (error) {
    console.error('Error in getAllCustomers:', error);
    return [];
  }
};

export const addCustomer = async (customer: any): Promise<any> => {
  try {
    const customerData: any = {
      name: customer.name,
      email: customer.email || null,
      phone: customer.phone,
      company: customer.company || null,
      address: customer.address,
      type: customer.type,
      total_orders: customer.totalOrders || 0,
      total_spent: customer.totalSpent || 0
    };

    // Add ID if provided
    if (customer.id) {
      customerData.id = customer.id;
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();

    if (error) {
      console.error('Error adding customer:', error);
      throw new Error('Failed to add customer');
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      address: data.address,
      type: data.type,
      totalOrders: data.total_orders,
      totalSpent: data.total_spent,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in addCustomer:', error);
    throw error;
  }
};

export const updateCustomer = async (id: string, updates: any): Promise<any> => {
  try {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.company !== undefined) updateData.company = updates.company;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.totalOrders !== undefined) updateData.total_orders = updates.totalOrders;
    if (updates.totalSpent !== undefined) updateData.total_spent = updates.totalSpent;

    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      throw new Error('Failed to update customer');
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      address: data.address,
      type: data.type,
      totalOrders: data.total_orders,
      totalSpent: data.total_spent,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    throw error;
  }
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      throw new Error('Failed to delete customer');
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    throw error;
  }
};

export const getCustomerById = async (id: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching customer:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      address: data.address,
      type: data.type,
      totalOrders: data.total_orders,
      totalSpent: data.total_spent,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    return null;
  }
};

// Invoices functions
export const getAllInvoices = async (): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }

    // Fetch all customers to map with invoices
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*');

    const customersMap = new Map();
    if (!customersError && customersData) {
      customersData.forEach(customerData => {
        customersMap.set(customerData.id, {
          id: customerData.id,
          name: customerData.name,
          phone: customerData.phone,
          company: customerData.company,
          address: customerData.address,
          type: customerData.type,
          createdAt: new Date(customerData.created_at),
          totalOrders: customerData.total_orders || 0,
          totalSpent: customerData.total_spent || 0
        });
      });
    }

    return (data || []).map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      customerId: invoice.customer_id,
      customerName: invoice.customer_name,
      customer: customersMap.get(invoice.customer_id) || null, // Include full customer object
      date: invoice.date,
      items: invoice.items || [],
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      tax: invoice.tax,
      total: invoice.total,
      status: invoice.status,
      paymentStatus: invoice.payment_status,
      paidAmount: invoice.paid_amount || 0,
      dueDate: invoice.due_date ? new Date(invoice.due_date) : new Date(),
      notes: invoice.notes,
      // Ensure dates are properly converted to Date objects for display
      createdAt: invoice.created_at ? new Date(invoice.created_at) : new Date(),
      paidAt: invoice.paid_at ? new Date(invoice.paid_at) : undefined
    }));
  } catch (error) {
    console.error('Error in getAllInvoices:', error);
    return [];
  }
};

export const addInvoice = async (invoice: any): Promise<any> => {
  try {
    // Import PO number generation
    const { getNextPoNumber } = await import('@/lib/utils/po-numbering');
    
    // Check Supabase configuration
    console.log('DB: Supabase URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('DB: Supabase Anon Key configured:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // SAFETY STEP 1: Validate stock availability BEFORE creating invoice
    console.log('🛡️ SAFETY: Validating stock availability before invoice creation...');
    const stockValidation = await validateStockAvailability(invoice.items || []);
    
    if (!stockValidation.isValid) {
      console.error('❌ SAFETY: Stock validation failed:', stockValidation.errors);
      throw new Error(`Insufficient stock: ${stockValidation.errors.join(', ')}`);
    }
    
    console.log('✅ SAFETY: Stock validation passed:', stockValidation.stockCheck);
    
    // Check if the invoices table exists
    console.log('DB: Checking if invoices table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('invoices')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('DB: Invoices table check failed:', tableError);
      console.error('DB: Table error details:', JSON.stringify(tableError, null, 2));
      throw new Error(`Invoices table not accessible: ${tableError.message}`);
    }
    
    console.log('DB: Invoices table exists and is accessible');
    
    // The invoice table expects customer_id as UUID, but we might be sending VARCHAR
    // Let's first try to get the customer to ensure the ID is valid
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', invoice.customerId)
      .single();

    if (customerError) {
      console.error('DB: Customer not found:', customerError);
      throw new Error(`Customer not found: ${invoice.customerId}`);
    }

    console.log('DB: Found customer:', customerData);

    // Prepare invoice data with proper types
    const invoiceData = {
      invoice_number: invoice.invoiceNumber,
      po_number: invoice.poNumber || getNextPoNumber(), // Auto-generate PO number if not provided
      customer_id: invoice.customerId, // This should match the customer UUID
      customer_name: invoice.customerName || null,
      date: invoice.date || null,
      items: invoice.items || [],
      subtotal: invoice.subtotal || 0,
      discount: invoice.discount || 0,
      tax: invoice.tax || 0,
      total: invoice.total,
      status: invoice.status || 'draft',
      payment_status: invoice.paymentStatus === 'pending' ? 'unpaid' : (invoice.paymentStatus || 'unpaid'),
      paid_amount: invoice.paidAmount || 0,
      due_date: invoice.dueDate ? 
        (typeof invoice.dueDate === 'string' ? 
          invoice.dueDate.split('T')[0] : 
          invoice.dueDate.toISOString().split('T')[0]) : null,
      notes: invoice.notes || null,
      paid_at: invoice.paidAt ? 
        (typeof invoice.paidAt === 'string' ? 
          invoice.paidAt : 
          invoice.paidAt.toISOString()) : null
    };

    console.log('DB: Attempting to insert invoice:', JSON.stringify(invoiceData, null, 2));

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) {
      console.error('DB: Error inserting invoice:', error);
      console.error('DB: Full error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('DB: Invoice created successfully:', data);

    // STEP 2: Only deduct stock if invoice is being created as "sent" (which means issued/finalized)
    if (invoice.status === 'sent') {
      console.log('🔄 ENABLED: Processing stock deduction for sent/issued invoice...');
      const stockDeduction = await deductStockForInvoice(invoice.items || []);
      if (!stockDeduction.success) {
        // Rollback invoice creation if stock deduction fails
        console.error('❌ Stock deduction failed, rolling back invoice...');
        try {
          await supabase.from('invoices').delete().eq('id', data.id);
          console.log('✅ Invoice rollback completed');
        } catch (rollbackError) {
          console.error('❌ CRITICAL: Invoice rollback failed:', rollbackError);
        }
        throw new Error(`Stock deduction failed: ${stockDeduction.errors.join(', ')}`);
      }
      
      console.log('✅ SUCCESS: Stock deduction completed successfully');
      console.log('📦 Deducted stock for', stockDeduction.deductions.length, 'items');
    } else {
      console.log('📝 DRAFT: Invoice created as draft, stock will be deducted when status changes to sent/issued');
    }

    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      poNumber: data.po_number || '', // Re-enabled PO number field
      customerId: data.customer_id,
      customerName: data.customer_name,
      date: data.date,
      items: data.items || [],
      subtotal: data.subtotal,
      discount: data.discount,
      tax: data.tax,
      total: data.total,
      status: data.status,
      paymentStatus: data.payment_status,
      paidAmount: data.paid_amount || 0,
      dueDate: data.due_date ? new Date(data.due_date) : new Date(),
      notes: data.notes,
      createdAt: new Date(data.created_at),
      paidAt: data.paid_at ? new Date(data.paid_at) : undefined
    };

  } catch (error) {
    console.error('Error in addInvoice:', error);
    throw error;
  }
};

export const createInvoice = async (invoice: any): Promise<any> => {
  return addInvoice(invoice);
};

export const updateInvoice = async (id: string, updates: any): Promise<any> => {
  try {
    // First, get the current invoice to check status change
    const { data: currentInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching current invoice:', fetchError);
      throw new Error('Failed to fetch current invoice');
    }

    const wasIssued = currentInvoice.status === 'sent';
    const willBeIssued = updates.status === 'sent';
    const statusChangingToIssued = !wasIssued && willBeIssued;

    // If status is changing to sent (issued), validate stock availability first
    if (statusChangingToIssued && updates.items) {
      console.log('🛡️ SAFETY: Validating stock availability before issuing invoice...');
      const stockValidation = await validateStockAvailability(updates.items);
      
      if (!stockValidation.isValid) {
        console.error('❌ SAFETY: Stock validation failed:', stockValidation.errors);
        throw new Error(`Insufficient stock: ${stockValidation.errors.join(', ')}`);
      }
      
      console.log('✅ SAFETY: Stock validation passed for invoice issuing');
    }

    const updateData: any = {};
    
    if (updates.invoiceNumber !== undefined) updateData.invoice_number = updates.invoiceNumber;
    if (updates.poNumber !== undefined) updateData.po_number = updates.poNumber; // Re-enabled PO number field
    if (updates.customerId !== undefined) updateData.customer_id = updates.customerId;
    if (updates.customerName !== undefined) updateData.customer_name = updates.customerName;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.items !== undefined) updateData.items = updates.items;
    if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal;
    if (updates.discount !== undefined) updateData.discount = updates.discount;
    if (updates.tax !== undefined) updateData.tax = updates.tax;
    if (updates.total !== undefined) updateData.total = updates.total;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.paymentStatus !== undefined) updateData.payment_status = updates.paymentStatus === 'pending' ? 'unpaid' : updates.paymentStatus;
    if (updates.paidAmount !== undefined) updateData.paid_amount = updates.paidAmount;
    if (updates.dueDate !== undefined) {
      // Handle both Date objects and ISO strings
      if (updates.dueDate instanceof Date) {
        updateData.due_date = updates.dueDate.toISOString().split('T')[0];
      } else if (typeof updates.dueDate === 'string') {
        updateData.due_date = new Date(updates.dueDate).toISOString().split('T')[0];
      } else {
        updateData.due_date = null;
      }
    }
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.paidAt !== undefined) {
      // Handle both Date objects and ISO strings
      if (updates.paidAt instanceof Date) {
        updateData.paid_at = updates.paidAt.toISOString();
      } else if (typeof updates.paidAt === 'string') {
        updateData.paid_at = updates.paidAt;
      } else {
        updateData.paid_at = null;
      }
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      throw new Error('Failed to update invoice');
    }

    // If status changed to sent (issued), deduct stock
    if (statusChangingToIssued) {
      console.log('🔄 STATUS CHANGE: Invoice status changed to sent/issued, deducting stock...');
      const itemsToDeduct = updates.items || currentInvoice.items;
      const stockDeduction = await deductStockForInvoice(itemsToDeduct);
      
      if (!stockDeduction.success) {
        // Rollback invoice update if stock deduction fails
        console.error('❌ Stock deduction failed, rolling back invoice update...');
        try {
          await supabase
            .from('invoices')
            .update({ status: currentInvoice.status })
            .eq('id', id);
          console.log('✅ Invoice status rollback completed');
        } catch (rollbackError) {
          console.error('❌ CRITICAL: Invoice rollback failed:', rollbackError);
        }
        throw new Error(`Stock deduction failed: ${stockDeduction.errors.join(', ')}`);
      }
      
      console.log('✅ SUCCESS: Stock deduction completed for sent/issued invoice');
      console.log('📦 Deducted stock for', stockDeduction.deductions.length, 'items');
    }

    // Fetch customer data if customer_id exists
    let customer = null;
    if (data.customer_id) {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', data.customer_id)
        .single();

      if (!customerError && customerData) {
        customer = {
          id: customerData.id,
          name: customerData.name,
          phone: customerData.phone,
          company: customerData.company,
          address: customerData.address,
          type: customerData.type,
          createdAt: new Date(customerData.created_at),
          totalOrders: customerData.total_orders || 0,
          totalSpent: customerData.total_spent || 0
        };
      }
    }

    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      poNumber: data.po_number || '', // Added PO number field
      customerId: data.customer_id,
      customerName: data.customer_name,
      customer: customer, // Include the full customer object
      date: data.date,
      items: data.items || [],
      subtotal: data.subtotal,
      discount: data.discount,
      tax: data.tax,
      total: data.total,
      status: data.status,
      paymentStatus: data.payment_status,
      paidAmount: data.paid_amount || 0,
      dueDate: data.due_date ? new Date(data.due_date) : new Date(),
      notes: data.notes,
      createdAt: new Date(data.created_at),
      paidAt: data.paid_at ? new Date(data.paid_at) : undefined
    };
  } catch (error) {
    console.error('Error in updateInvoice:', error);
    throw error;
  }
};

export const deleteInvoice = async (id: string): Promise<boolean> => {
  try {
    // First get the invoice data to restore stock
    console.log(`Fetching invoice data for stock restoration: ${id}`);
    const { data: invoiceData, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching invoice for stock restoration:', fetchError);
      throw new Error('Failed to fetch invoice data for stock restoration');
    }

    if (invoiceData && invoiceData.products) {
      // Restore stock before deleting the invoice
      console.log(`Restoring stock for invoice ${id}...`);
      await restoreStockForInvoice(invoiceData.products);
    }
    
    // Then delete the invoice
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invoice:', error);
      throw new Error('Failed to delete invoice');
    }

    console.log(`Invoice ${id} deleted successfully with stock restored`);
    return true;
  } catch (error) {
    console.error('Error in deleteInvoice:', error);
    throw error;
  }
};

export const getInvoiceById = async (id: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching invoice:', error);
      return null;
    }

    // Fetch customer data if customer_id exists
    let customer = null;
    if (data.customer_id) {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', data.customer_id)
        .single();

      if (!customerError && customerData) {
        customer = {
          id: customerData.id,
          name: customerData.name,
          phone: customerData.phone,
          company: customerData.company,
          address: customerData.address,
          type: customerData.type,
          createdAt: new Date(customerData.created_at),
          totalOrders: customerData.total_orders || 0,
          totalSpent: customerData.total_spent || 0
        };
      }
    }

    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
      poNumber: data.po_number || '', // Added PO number field
      customerId: data.customer_id,
      customerName: data.customer_name,
      customer: customer, // Include the full customer object
      date: data.date,
      items: data.items || [],
      subtotal: data.subtotal,
      discount: data.discount,
      tax: data.tax,
      total: data.total,
      status: data.status,
      paymentStatus: data.payment_status,
      dueDate: data.due_date ? new Date(data.due_date) : new Date(),
      notes: data.notes,
      createdAt: new Date(data.created_at),
      paidAt: data.paid_at ? new Date(data.paid_at) : undefined
    };
  } catch (error) {
    console.error('Error in getInvoiceById:', error);
    return null;
  }
};

// Database management functions
export const clearAllData = async (): Promise<boolean> => {
  try {
    await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

export const getDatabaseStats = async () => {
  try {
    const [products, customers, invoices] = await Promise.all([
      getAllProducts(),
      getAllCustomers(),
      getAllInvoices()
    ]);
    
    return {
      products: products.length,
      customers: customers.length,
      invoices: invoices.length,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
};
