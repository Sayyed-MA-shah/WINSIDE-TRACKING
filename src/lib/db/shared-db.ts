// Simple shared database using JSON files
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize with sample data if files don't exist
const initializeProducts = () => {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    const sampleProducts = [
      {
        id: 'prod-1',
        title: 'Wireless Headphones',
        article: 'WH-001',
        description: 'High-quality wireless headphones',
        category: 'Electronics',
        brand: 'greenhil',
        taxable: true,
        attributes: [],
        wholesale: 45.00,
        retail: 99.99,
        club: 89.99,
        costBefore: 50.00,
        costAfter: 45.00,
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        variants: [{
          id: 'var-1',
          productId: 'prod-1',
          sku: 'WH-001-BLK',
          size: 'One Size',
          color: 'Black',
          quantity: 50,
          qty: 50,
          price: 99.99,
          cost: 45.00,
          attributes: {}
        }]
      }
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(sampleProducts, null, 2));
  }
};

const initializeCustomers = () => {
  if (!fs.existsSync(CUSTOMERS_FILE)) {
    const sampleCustomers: any[] = [];
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(sampleCustomers, null, 2));
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
