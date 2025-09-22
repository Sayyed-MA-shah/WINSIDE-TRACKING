// Insole Inventory Database Interface
// Separate database operations for insole clinic

import { supabase } from '../supabase';

// ===============================
// TYPES (Updated for new schema)
// ===============================

export interface InsoleProduct {
  id: string;
  article: string;
  title: string;
  category: string;
  brand: string;
  taxable: boolean;
  attributes: Record<string, any>;
  variations: any[];
  media_main?: string;
  archived: boolean;
  wholesale: number;
  retail: number;
  cost_before: number;
  cost_after: number;
  stock_quantity: number;
  min_stock_level: number;
  created_at: string;
  updated_at: string;
}

export interface InsoleCustomer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  company?: string;
  address: string;
  type: 'retail' | 'wholesale' | 'club';
  total_orders: number;
  total_spent: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InsoleInvoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name?: string;
  date: string;
  items: any[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_status: 'paid' | 'unpaid' | 'partial';
  due_date?: string;
  notes?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InsoleUser {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  display_name: string;
  email?: string;
  role: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InsoleProductAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect';
  options: string[];
  required: boolean;
  active: boolean;
  created_at: string;
}

// ===============================
// ERROR HANDLING HELPER
// ===============================

const handleDatabaseError = (operation: string, error: any, fallbackData: any = []) => {
  console.error(`Error in ${operation}:`, error);
  
  // Check if it's a table not found error
  if (error?.code === 'PGRST205' || error?.message?.includes('Could not find the table')) {
    console.warn(`⚠️  Table not found for ${operation}. Please create the insole tables in Supabase.`);
    console.warn('📋 Run the SQL from insole-schema.sql in your Supabase SQL Editor');
    return fallbackData;
  }
  
  throw error;
};

// ===============================
// INSOLE PRODUCTS
// ===============================

export const getInsoleProducts = async (): Promise<InsoleProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('insole_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return handleDatabaseError('getInsoleProducts', error, []);
    }

    return data || [];
  } catch (error) {
    return handleDatabaseError('getInsoleProducts', error, []);
  }
};

export const addInsoleProduct = async (product: Partial<InsoleProduct>): Promise<InsoleProduct> => {
  try {
    const { data, error } = await supabase
      .from('insole_products')
      .insert({
        article: product.article,
        title: product.title,
        category: product.category,
        brand: product.brand || 'INSOLE CLINIC',
        taxable: product.taxable ?? true,
        attributes: product.attributes || {},
        variations: product.variations || [],
        media_main: product.media_main,
        archived: product.archived ?? false,
        wholesale: product.wholesale || 0,
        retail: product.retail || 0,
        cost_before: product.cost_before || 0,
        cost_after: product.cost_after || 0,
        stock_quantity: product.stock_quantity || 0,
        min_stock_level: product.min_stock_level || 5
      })
      .select()
      .single();

    if (error) {
      return handleDatabaseError('addInsoleProduct', error);
    }

    return data;
  } catch (error) {
    return handleDatabaseError('addInsoleProduct', error);
  }
};

export const updateInsoleProduct = async (id: string, updates: Partial<InsoleProduct>): Promise<InsoleProduct> => {
  try {
    const { data, error } = await supabase
      .from('insole_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleDatabaseError('updateInsoleProduct', error);
    }

    return data;
  } catch (error) {
    return handleDatabaseError('updateInsoleProduct', error);
  }
};

export const deleteInsoleProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('insole_products')
      .delete()
      .eq('id', id);

    if (error) {
      return handleDatabaseError('deleteInsoleProduct', error);
    }
  } catch (error) {
    return handleDatabaseError('deleteInsoleProduct', error);
  }
};

// ===============================
// INSOLE CUSTOMERS
// ===============================

export const getInsoleCustomers = async (): Promise<InsoleCustomer[]> => {
  try {
    const { data, error } = await supabase
      .from('insole_customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return handleDatabaseError('getInsoleCustomers', error, []);
    }

    return data || [];
  } catch (error) {
    return handleDatabaseError('getInsoleCustomers', error, []);
  }
};

export const addInsoleCustomer = async (customer: Partial<InsoleCustomer>): Promise<InsoleCustomer> => {
  try {
    const { data, error } = await supabase
      .from('insole_customers')
      .insert({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        company: customer.company,
        address: customer.address,
        type: customer.type || 'retail',
        total_orders: customer.total_orders || 0,
        total_spent: customer.total_spent || 0,
        notes: customer.notes
      })
      .select()
      .single();

    if (error) {
      return handleDatabaseError('addInsoleCustomer', error);
    }

    return data;
  } catch (error) {
    return handleDatabaseError('addInsoleCustomer', error);
  }
};

// ===============================
// INSOLE INVOICES
// ===============================

export const getInsoleInvoices = async (): Promise<InsoleInvoice[]> => {
  try {
    const { data, error } = await supabase
      .from('insole_invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return handleDatabaseError('getInsoleInvoices', error, []);
    }

    return data || [];
  } catch (error) {
    return handleDatabaseError('getInsoleInvoices', error, []);
  }
};

export const addInsoleInvoice = async (invoice: Partial<InsoleInvoice>): Promise<InsoleInvoice> => {
  try {
    const { data, error } = await supabase
      .from('insole_invoices')
      .insert({
        invoice_number: invoice.invoice_number,
        customer_id: invoice.customer_id,
        customer_name: invoice.customer_name,
        date: invoice.date,
        items: invoice.items || [],
        subtotal: invoice.subtotal || 0,
        discount: invoice.discount || 0,
        tax: invoice.tax || 0,
        total: invoice.total || 0,
        status: invoice.status || 'draft',
        payment_status: invoice.payment_status || 'unpaid',
        due_date: invoice.due_date,
        notes: invoice.notes
      })
      .select()
      .single();

    if (error) {
      return handleDatabaseError('addInsoleInvoice', error);
    }

    return data;
  } catch (error) {
    return handleDatabaseError('addInsoleInvoice', error);
  }
};

// ===============================
// INSOLE USERS
// ===============================

export const getInsoleUsers = async (): Promise<InsoleUser[]> => {
  try {
    const { data, error } = await supabase
      .from('insole_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return handleDatabaseError('getInsoleUsers', error, []);
    }

    return data || [];
  } catch (error) {
    return handleDatabaseError('getInsoleUsers', error, []);
  }
};

export const addInsoleUser = async (user: Partial<InsoleUser>): Promise<InsoleUser> => {
  try {
    const { data, error } = await supabase
      .from('insole_users')
      .insert({
        username: user.username,
        password_hash: user.password_hash,
        full_name: user.full_name,
        display_name: user.display_name || user.full_name || user.username,
        email: user.email,
        role: user.role || 'user',
        active: user.active ?? true
      })
      .select()
      .single();

    if (error) {
      return handleDatabaseError('addInsoleUser', error);
    }

    return data;
  } catch (error) {
    return handleDatabaseError('addInsoleUser', error);
  }
};

export const updateInsoleUser = async (id: string, updates: Partial<InsoleUser>): Promise<InsoleUser> => {
  try {
    const { data, error } = await supabase
      .from('insole_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleDatabaseError('updateInsoleUser', error);
    }

    return data;
  } catch (error) {
    return handleDatabaseError('updateInsoleUser', error);
  }
};

// ===============================
// INSOLE PRODUCT ATTRIBUTES
// ===============================

export const getInsoleProductAttributes = async (): Promise<InsoleProductAttribute[]> => {
  try {
    const { data, error } = await supabase
      .from('insole_product_attributes')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) {
      return handleDatabaseError('getInsoleProductAttributes', error, []);
    }

    return data || [];
  } catch (error) {
    return handleDatabaseError('getInsoleProductAttributes', error, []);
  }
};

export const addInsoleProductAttribute = async (attribute: Partial<InsoleProductAttribute>): Promise<InsoleProductAttribute> => {
  try {
    const { data, error } = await supabase
      .from('insole_product_attributes')
      .insert({
        name: attribute.name,
        type: attribute.type || 'text',
        options: attribute.options || [],
        required: attribute.required ?? false,
        active: attribute.active ?? true
      })
      .select()
      .single();

    if (error) {
      return handleDatabaseError('addInsoleProductAttribute', error);
    }

    return data;
  } catch (error) {
    return handleDatabaseError('addInsoleProductAttribute', error);
  }
};

// ===============================
// AUTHENTICATION
// ===============================

export const authenticateInsoleUser = async (username: string, password: string): Promise<InsoleUser | null> => {
  try {
    // In a real implementation, you would:
    // 1. Hash the provided password
    // 2. Compare with stored password hash
    // 3. Use proper authentication methods
    
    // For now, return null to indicate database authentication failed
    // The hardcoded user in the auth context will handle test credentials
    
    const { data, error } = await supabase
      .from('insole_users')
      .select('*')
      .eq('username', username)
      .eq('active', true)
      .single();

    if (error) {
      console.warn('Database authentication failed:', error.message);
      return null;
    }

    // In production, verify password hash here
    // For now, we'll return null to fallback to hardcoded auth
    console.log('Found user in database:', data.username);
    return null; // Let hardcoded auth handle for now
    
  } catch (error) {
    console.warn('Authentication error:', error);
    return null;
  }
};

// ===============================
// DASHBOARD STATS
// ===============================

export const getInsoleDashboardStats = async () => {
  try {
    const [products, customers, invoices] = await Promise.all([
      getInsoleProducts(),
      getInsoleCustomers(),
      getInsoleInvoices()
    ]);

    const totalProducts = products.length;
    const totalCustomers = customers.length;
    const totalInvoices = invoices.length;
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const lowStockProducts = products.filter(
      product => product.stock_quantity <= product.min_stock_level
    );

    return {
      totalProducts,
      totalCustomers,
      totalInvoices,
      totalRevenue,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentProducts: products.slice(0, 5),
      recentCustomers: customers.slice(0, 5),
      recentInvoices: invoices.slice(0, 5)
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      totalProducts: 0,
      totalCustomers: 0,
      totalInvoices: 0,
      totalRevenue: 0,
      lowStockCount: 0,
      lowStockProducts: [],
      recentProducts: [],
      recentCustomers: [],
      recentInvoices: []
    };
  }
};

// ===============================
// COMBINED EXPORT OBJECT
// ===============================

export const insoleDb = {
  // Products
  getProducts: getInsoleProducts,
  addProduct: addInsoleProduct,
  updateProduct: updateInsoleProduct,
  deleteProduct: deleteInsoleProduct,
  getProductAttributes: getInsoleProductAttributes,
  addProductAttribute: addInsoleProductAttribute,
  
  // Customers
  getCustomers: getInsoleCustomers,
  addCustomer: addInsoleCustomer,
  
  // Invoices
  getInvoices: getInsoleInvoices,
  addInvoice: addInsoleInvoice,
  
  // Users
  getUsers: getInsoleUsers,
  addUser: addInsoleUser,
  updateUser: updateInsoleUser,
  authenticateUser: authenticateInsoleUser,
  
  // Dashboard
  getDashboardStats: getInsoleDashboardStats
};