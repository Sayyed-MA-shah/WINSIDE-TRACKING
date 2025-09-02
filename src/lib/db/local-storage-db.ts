// Simple local storage-based database for development
const STORAGE_KEYS = {
  CUSTOMERS: 'winside-customers',
  PRODUCTS: 'winside-products',
};

// Utility to safely access localStorage
const getStoredData = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStoredData = <T>(key: string, data: T[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Customer operations
export const localCustomerDB = {
  getAll: () => getStoredData(STORAGE_KEYS.CUSTOMERS),
  
  getById: (id: string) => {
    const customers = getStoredData(STORAGE_KEYS.CUSTOMERS);
    return customers.find((c: any) => c.id === id) || null;
  },
  
  create: (customer: any) => {
    const customers = getStoredData(STORAGE_KEYS.CUSTOMERS);
    const newCustomer = {
      ...customer,
      id: `customer-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    setStoredData(STORAGE_KEYS.CUSTOMERS, customers);
    return newCustomer;
  },
  
  update: (id: string, updates: any) => {
    const customers = getStoredData(STORAGE_KEYS.CUSTOMERS);
    const index = customers.findIndex((c: any) => c.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updates };
      setStoredData(STORAGE_KEYS.CUSTOMERS, customers);
      return customers[index];
    }
    return null;
  },
  
  delete: (id: string) => {
    const customers = getStoredData(STORAGE_KEYS.CUSTOMERS);
    const filtered = customers.filter((c: any) => c.id !== id);
    setStoredData(STORAGE_KEYS.CUSTOMERS, filtered);
    return true;
  },
};

// Product operations
export const localProductDB = {
  getAll: () => getStoredData(STORAGE_KEYS.PRODUCTS),
  
  getById: (id: string) => {
    const products = getStoredData(STORAGE_KEYS.PRODUCTS);
    return products.find((p: any) => p.id === id) || null;
  },
  
  create: (product: any) => {
    const products = getStoredData(STORAGE_KEYS.PRODUCTS);
    const newProduct = {
      ...product,
      id: product.id || `product-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    setStoredData(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },
  
  update: (id: string, updates: any) => {
    const products = getStoredData(STORAGE_KEYS.PRODUCTS);
    const index = products.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      products[index] = { 
        ...products[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      setStoredData(STORAGE_KEYS.PRODUCTS, products);
      return products[index];
    }
    return null;
  },
  
  delete: (id: string) => {
    const products = getStoredData(STORAGE_KEYS.PRODUCTS);
    const filtered = products.filter((p: any) => p.id !== id);
    setStoredData(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },
};
