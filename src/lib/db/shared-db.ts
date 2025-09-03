// Supabase database implementation for WINSIDE Business Dashboard
import { supabase } from '@/lib/supabase';
import { Product, Customer, Invoice } from '@/lib/types';

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
      variants: product.variants || []
    };

    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      throw new Error('Failed to add product');
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
    console.error('Error in addProduct:', error);
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
    const customerData = {
      name: customer.name,
      email: customer.email || null,
      phone: customer.phone,
      company: customer.company || null,
      address: customer.address,
      type: customer.type,
      total_orders: customer.totalOrders || 0,
      total_spent: customer.totalSpent || 0
    };

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

    return (data || []).map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      customerId: invoice.customer_id,
      customerName: invoice.customer_name,
      date: invoice.date,
      items: invoice.items || [],
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      tax: invoice.tax,
      total: invoice.total,
      status: invoice.status,
      paymentStatus: invoice.payment_status,
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
    // Check Supabase configuration
    console.log('DB: Supabase URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('DB: Supabase Anon Key configured:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
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
      customer_id: invoice.customerId, // This should match the customer UUID
      customer_name: invoice.customerName || null,
      date: invoice.date || null,
      items: invoice.items || [],
      subtotal: invoice.subtotal || 0,
      discount: invoice.discount || 0,
      tax: invoice.tax || 0,
      total: invoice.total,
      status: invoice.status || 'draft',
      payment_status: invoice.paymentStatus || 'unpaid',
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

    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
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
    const updateData: any = {};
    
    if (updates.invoiceNumber !== undefined) updateData.invoice_number = updates.invoiceNumber;
    if (updates.customerId !== undefined) updateData.customer_id = updates.customerId;
    if (updates.customerName !== undefined) updateData.customer_name = updates.customerName;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.items !== undefined) updateData.items = updates.items;
    if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal;
    if (updates.discount !== undefined) updateData.discount = updates.discount;
    if (updates.tax !== undefined) updateData.tax = updates.tax;
    if (updates.total !== undefined) updateData.total = updates.total;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.paymentStatus !== undefined) updateData.payment_status = updates.paymentStatus;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate ? updates.dueDate.toISOString().split('T')[0] : null;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.paidAt !== undefined) updateData.paid_at = updates.paidAt ? updates.paidAt.toISOString() : null;

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

    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
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
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invoice:', error);
      throw new Error('Failed to delete invoice');
    }

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

    return {
      id: data.id,
      invoiceNumber: data.invoice_number,
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
