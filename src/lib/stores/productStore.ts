import React from 'react';
import { Product, Brand, BrandStats } from '@/lib/types';
import { getFullCsvMigratedProducts } from '@/lib/data/complete-csv-migration';

// Use complete migrated data from CSV file (all 63 products with 353 variants)
const initialProducts: Product[] = getFullCsvMigratedProducts();

// Simple in-memory store
class ProductStore {
  private products: Product[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    // Initialize with mock data
    this.products = [...initialProducts];
  }

  getProductsByBrand(brand: Brand): Product[] {
    return this.products.filter(p => p.brand === brand);
  }

  getBrandStats(brand: Brand): BrandStats {
    const brandProducts = this.getProductsByBrand(brand);
    const totalProducts = brandProducts.length;
    const stockValue = brandProducts.reduce((total, product) => {
      const productValue = product.variants.reduce((variantTotal, variant) => {
        return variantTotal + (variant.qty * product.costAfter);
      }, 0);
      return total + productValue;
    }, 0);
    
    // Calculate potential revenue from current stock for each pricing tier
    const potentialWholesaleRevenue = brandProducts.reduce((total, product) => {
      const productRevenue = product.variants.reduce((variantTotal, variant) => {
        const wholesaleProfit = (variant.wholesale || product.wholesale) - product.costAfter;
        return variantTotal + (variant.qty * Math.max(0, wholesaleProfit));
      }, 0);
      return total + productRevenue;
    }, 0);
    
    const potentialRetailRevenue = brandProducts.reduce((total, product) => {
      const productRevenue = product.variants.reduce((variantTotal, variant) => {
        const retailProfit = (variant.retail || product.retail) - product.costAfter;
        return variantTotal + (variant.qty * Math.max(0, retailProfit));
      }, 0);
      return total + productRevenue;
    }, 0);
    
    const potentialClubRevenue = brandProducts.reduce((total, product) => {
      const productRevenue = product.variants.reduce((variantTotal, variant) => {
        const clubProfit = (variant.club || product.club) - product.costAfter;
        return variantTotal + (variant.qty * Math.max(0, clubProfit));
      }, 0);
      return total + productRevenue;
    }, 0);
    
    // Find low stock products (assuming minStock is 10 for demo purposes)
    const lowStockProducts = brandProducts
      .map(product => ({
        name: product.title,
        stock: product.variants.reduce((total, variant) => total + variant.qty, 0),
        minStock: 10 // This should come from product configuration
      }))
      .filter(item => item.stock < item.minStock);
    
    const lowStockCount = lowStockProducts.length;
    
    return {
      brand,
      totalProducts,
      lowStockCount,
      stockValue,
      totalInvoices: 0, // Will be calculated from invoice data
      totalRevenue: 0, // Will be calculated from invoice data
      pendingInvoices: 0, // Will be calculated from invoice data
      potentialWholesaleRevenue,
      potentialRetailRevenue,
      potentialClubRevenue,
      lowStockProducts
    };
  }

  getProducts(): Product[] {
    return [...this.products];
  }

  addProduct(product: Product): void {
    this.products.push(product);
    this.notifyListeners();
  }

  updateProduct(id: string, updatedProduct: Product): void {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...updatedProduct, updatedAt: new Date() };
      this.notifyListeners();
    }
  }

  deleteProduct(id: string): void {
    this.products = this.products.filter(p => p.id !== id);
    this.notifyListeners();
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Create singleton instance
export const productStore = new ProductStore();

// Hook for React components
export function useProducts() {
  const [products, setProducts] = React.useState<Product[]>(productStore.getProducts());

  React.useEffect(() => {
    const unsubscribe = productStore.subscribe(() => {
      setProducts(productStore.getProducts());
    });
    return unsubscribe;
  }, []);

  return {
    products,
    addProduct: (product: Product) => productStore.addProduct(product),
    updateProduct: (id: string, product: Product) => productStore.updateProduct(id, product),
    deleteProduct: (id: string) => productStore.deleteProduct(id),
    getProductById: (id: string) => productStore.getProductById(id),
    getProductsByBrand: (brand: Brand) => productStore.getProductsByBrand(brand),
    getBrandStats: (brand: Brand) => productStore.getBrandStats(brand)
  };
}
