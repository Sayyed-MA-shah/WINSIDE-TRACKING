// Simple shared database using JSON files
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize with sample data if files don't exist
const initializeProducts = () => {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    const emptyProducts: any[] = [];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(emptyProducts, null, 2));
  } else {
    // Clear existing data to start fresh
    const emptyProducts: any[] = [];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(emptyProducts, null, 2));
  }
};

const initializeCustomers = () => {
  if (!fs.existsSync(CUSTOMERS_FILE)) {
    const sampleCustomers: any[] = [];
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(sampleCustomers, null, 2));
  }
};

const initializeInvoices = () => {
  if (!fs.existsSync(INVOICES_FILE)) {
    const emptyInvoices: any[] = [];
    fs.writeFileSync(INVOICES_FILE, JSON.stringify(emptyInvoices, null, 2));
  }
};

// Products functions
export const getAllProducts = () => {
  initializeProducts();
  const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
  return JSON.parse(data);
};

export const saveProducts = (products: any[]) => {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
};

export const addProduct = (product: any) => {
  const products = getAllProducts();
  products.push(product);
  saveProducts(products);
  return product;
};

export const updateProduct = (id: string, updatedProduct: any) => {
  const products = getAllProducts();
  const index = products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    products[index] = updatedProduct;
    saveProducts(products);
    return updatedProduct;
  }
  throw new Error('Product not found');
};

export const deleteProduct = (id: string) => {
  const products = getAllProducts();
  const filteredProducts = products.filter((p: any) => p.id !== id);
  saveProducts(filteredProducts);
};

// Customers functions
export const getAllCustomers = () => {
  initializeCustomers();
  const data = fs.readFileSync(CUSTOMERS_FILE, 'utf-8');
  return JSON.parse(data);
};

export const saveCustomers = (customers: any[]) => {
  fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2));
};

export const addCustomer = (customer: any) => {
  const customers = getAllCustomers();
  customers.push(customer);
  saveCustomers(customers);
  return customer;
};

export const updateCustomer = (id: string, updatedCustomer: any) => {
  const customers = getAllCustomers();
  const index = customers.findIndex((c: any) => c.id === id);
  if (index !== -1) {
    customers[index] = updatedCustomer;
    saveCustomers(customers);
    return updatedCustomer;
  }
  throw new Error('Customer not found');
};

export const deleteCustomer = (id: string) => {
  const customers = getAllCustomers();
  const filteredCustomers = customers.filter((c: any) => c.id !== id);
  saveCustomers(filteredCustomers);
};

// Invoices functions
export const getAllInvoices = () => {
  initializeInvoices();
  const data = fs.readFileSync(INVOICES_FILE, 'utf-8');
  return JSON.parse(data);
};

export const saveInvoices = (invoices: any[]) => {
  fs.writeFileSync(INVOICES_FILE, JSON.stringify(invoices, null, 2));
};

export const addInvoice = (invoice: any) => {
  const invoices = getAllInvoices();
  invoices.push(invoice);
  saveInvoices(invoices);
  return invoice;
};

export const createInvoice = (invoice: any) => {
  return addInvoice(invoice);
};

export const updateInvoice = (id: string, updatedInvoice: any) => {
  const invoices = getAllInvoices();
  const index = invoices.findIndex((i: any) => i.id === id);
  if (index !== -1) {
    invoices[index] = updatedInvoice;
    saveInvoices(invoices);
    return updatedInvoice;
  }
  throw new Error('Invoice not found');
};

export const deleteInvoice = (id: string) => {
  const invoices = getAllInvoices();
  const filteredInvoices = invoices.filter((i: any) => i.id !== id);
  saveInvoices(filteredInvoices);
};
