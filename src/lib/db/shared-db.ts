// Enhanced shared database using JSON files with better structure and data management
import fs from 'fs';
import path from 'path';
import { Product, Customer, Invoice } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Database interface for better type safety
interface DatabaseState {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  lastUpdated: string;
  version: string;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database files with proper structure
const initializeProducts = (): Product[] => {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    const emptyProducts: Product[] = [];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(emptyProducts, null, 2));
    return emptyProducts;
  }
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data) as Product[];
  } catch (error) {
    console.error('Error reading products file:', error);
    const emptyProducts: Product[] = [];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(emptyProducts, null, 2));
    return emptyProducts;
  }
};

const initializeCustomers = (): Customer[] => {
  if (!fs.existsSync(CUSTOMERS_FILE)) {
    const emptyCustomers: Customer[] = [];
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(emptyCustomers, null, 2));
    return emptyCustomers;
  }
  try {
    const data = fs.readFileSync(CUSTOMERS_FILE, 'utf-8');
    return JSON.parse(data) as Customer[];
  } catch (error) {
    console.error('Error reading customers file:', error);
    const emptyCustomers: Customer[] = [];
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(emptyCustomers, null, 2));
    return emptyCustomers;
  }
};

const initializeInvoices = (): Invoice[] => {
  if (!fs.existsSync(INVOICES_FILE)) {
    const emptyInvoices: Invoice[] = [];
    fs.writeFileSync(INVOICES_FILE, JSON.stringify(emptyInvoices, null, 2));
    return emptyInvoices;
  }
  try {
    const data = fs.readFileSync(INVOICES_FILE, 'utf-8');
    return JSON.parse(data) as Invoice[];
  } catch (error) {
    console.error('Error reading invoices file:', error);
    const emptyInvoices: Invoice[] = [];
    fs.writeFileSync(INVOICES_FILE, JSON.stringify(emptyInvoices, null, 2));
    return emptyInvoices;
  }
};

// Backup function for data safety
export const createBackup = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(DATA_DIR, 'backups', timestamp);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      fs.copyFileSync(PRODUCTS_FILE, path.join(backupDir, 'products.json'));
    }
    if (fs.existsSync(CUSTOMERS_FILE)) {
      fs.copyFileSync(CUSTOMERS_FILE, path.join(backupDir, 'customers.json'));
    }
    if (fs.existsSync(INVOICES_FILE)) {
      fs.copyFileSync(INVOICES_FILE, path.join(backupDir, 'invoices.json'));
    }
    return { success: true, backupPath: backupDir };
  } catch (error) {
    console.error('Backup failed:', error);
    return { success: false, error };
  }
};

// Products functions
export const getAllProducts = (): Product[] => {
  return initializeProducts();
};

export const saveProducts = (products: Product[]): void => {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Error saving products:', error);
    throw new Error('Failed to save products');
  }
};

export const addProduct = (product: Product): Product => {
  const products = getAllProducts();
  const newProduct = {
    ...product,
    id: product.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const updateProduct = (id: string, updatedProduct: Partial<Product>): Product => {
  const products = getAllProducts();
  const index = products.findIndex((p: Product) => p.id === id);
  if (index !== -1) {
    products[index] = {
      ...products[index],
      ...updatedProduct,
      id: products[index].id, // Preserve original ID
      updatedAt: new Date()
    };
    saveProducts(products);
    return products[index];
  }
  throw new Error('Product not found');
};

export const deleteProduct = (id: string): boolean => {
  const products = getAllProducts();
  const initialLength = products.length;
  const filteredProducts = products.filter((p: Product) => p.id !== id);
  if (filteredProducts.length === initialLength) {
    throw new Error('Product not found');
  }
  saveProducts(filteredProducts);
  return true;
};

export const getProductById = (id: string): Product | null => {
  const products = getAllProducts();
  return products.find((p: Product) => p.id === id) || null;
};

// Customers functions
export const getAllCustomers = (): Customer[] => {
  return initializeCustomers();
};

export const saveCustomers = (customers: Customer[]): void => {
  try {
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2));
  } catch (error) {
    console.error('Error saving customers:', error);
    throw new Error('Failed to save customers');
  }
};

export const addCustomer = (customer: Customer): Customer => {
  const customers = getAllCustomers();
  const newCustomer = {
    ...customer,
    id: customer.id || `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  customers.push(newCustomer);
  saveCustomers(customers);
  return newCustomer;
};

export const updateCustomer = (id: string, updatedCustomer: Partial<Customer>): Customer => {
  const customers = getAllCustomers();
  const index = customers.findIndex((c: Customer) => c.id === id);
  if (index !== -1) {
    customers[index] = {
      ...customers[index],
      ...updatedCustomer,
      id: customers[index].id // Preserve original ID
    };
    saveCustomers(customers);
    return customers[index];
  }
  throw new Error('Customer not found');
};

export const deleteCustomer = (id: string): boolean => {
  const customers = getAllCustomers();
  const initialLength = customers.length;
  const filteredCustomers = customers.filter((c: Customer) => c.id !== id);
  if (filteredCustomers.length === initialLength) {
    throw new Error('Customer not found');
  }
  saveCustomers(filteredCustomers);
  return true;
};

export const getCustomerById = (id: string): Customer | null => {
  const customers = getAllCustomers();
  return customers.find((c: Customer) => c.id === id) || null;
};

// Invoices functions
export const getAllInvoices = (): Invoice[] => {
  return initializeInvoices();
};

export const saveInvoices = (invoices: Invoice[]): void => {
  try {
    fs.writeFileSync(INVOICES_FILE, JSON.stringify(invoices, null, 2));
  } catch (error) {
    console.error('Error saving invoices:', error);
    throw new Error('Failed to save invoices');
  }
};

export const addInvoice = (invoice: Invoice): Invoice => {
  const invoices = getAllInvoices();
  const newInvoice = {
    ...invoice,
    id: invoice.id || `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  invoices.push(newInvoice);
  saveInvoices(invoices);
  return newInvoice;
};

export const createInvoice = (invoice: Invoice): Invoice => {
  return addInvoice(invoice);
};

export const updateInvoice = (id: string, updatedInvoice: Partial<Invoice>): Invoice => {
  const invoices = getAllInvoices();
  const index = invoices.findIndex((i: Invoice) => i.id === id);
  if (index !== -1) {
    invoices[index] = {
      ...invoices[index],
      ...updatedInvoice,
      id: invoices[index].id // Preserve original ID
    };
    saveInvoices(invoices);
    return invoices[index];
  }
  throw new Error('Invoice not found');
};

export const deleteInvoice = (id: string): boolean => {
  const invoices = getAllInvoices();
  const initialLength = invoices.length;
  const filteredInvoices = invoices.filter((i: Invoice) => i.id !== id);
  if (filteredInvoices.length === initialLength) {
    throw new Error('Invoice not found');
  }
  saveInvoices(filteredInvoices);
  return true;
};

export const getInvoiceById = (id: string): Invoice | null => {
  const invoices = getAllInvoices();
  return invoices.find((i: Invoice) => i.id === id) || null;
};

// Database management functions
export const clearAllData = (): boolean => {
  try {
    // Create backup before clearing
    createBackup();
    
    // Clear all data files
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify([], null, 2));
    fs.writeFileSync(INVOICES_FILE, JSON.stringify([], null, 2));
    
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

export const getDatabaseStats = () => {
  try {
    const products = getAllProducts();
    const customers = getAllCustomers();
    const invoices = getAllInvoices();
    
    return {
      products: products.length,
      customers: customers.length,
      invoices: invoices.length,
      lastUpdated: new Date().toISOString(),
      dataSize: {
        products: JSON.stringify(products).length,
        customers: JSON.stringify(customers).length,
        invoices: JSON.stringify(invoices).length
      }
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
};
