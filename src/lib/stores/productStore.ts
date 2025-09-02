import React from 'react';
import { Product, Brand, BrandStats } from '@/lib/types';

// Supabase-backed store for persistent data
class ProductStore {
  private products: Product[] = [];
  private listeners: Array<() => void> = [];
  private isInitialized: boolean = false;
  private isLoading: boolean = false;

  constructor() {
    // Don't load anything in constructor - wait for explicit initialization
  }

  private async loadFromDatabase(): Promise<void> {
    try {
      console.log('Loading products from database...');
      const response = await fetch('/api/products');
      if (response.ok) {
        this.products = await response.json();
        console.log('Loaded products from database:', this.products.length);
      } else {
        console.error('Failed to load products from database');
        this.products = [];
      }
    } catch (error) {
      console.error('Error loading products from database:', error);
      this.products = [];
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isLoading = true;
    await this.loadFromDatabase();
    this.isInitialized = true;
    this.isLoading = false;
    this.notifyListeners();
  }

  private getSampleProducts(): Product[] {
    // Return empty array - no sample products for fresh start
    return [];
  }

  getIsLoading(): boolean {
    return this.isLoading;
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

  async addProduct(product: Product): Promise<void> {
    try {
      console.log('Adding product to database:', product.title);
      
      // Save to database first
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      
      if (response.ok) {
        const savedProduct = await response.json();
        console.log('Product saved to database successfully');
        
        // Add to local products array
        this.products.push(savedProduct);
        
        // Notify listeners
        this.notifyListeners();
        
        console.log('Product added successfully');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save product');
      }
      
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updatedProduct: Product): Promise<void> {
    try {
      console.log('Updating product in database:', id);
      
      // Update in database first
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });
      
      if (response.ok) {
        const savedProduct = await response.json();
        console.log('Product updated in database successfully');
        
        // Update in local products array
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = savedProduct;
          
          // Notify listeners
          this.notifyListeners();
          
          console.log('Product updated successfully');
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
      }
      
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      console.log('Deleting product from database:', id);
      
      // Delete from database first
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        console.log('Product deleted from database successfully');
        
        // Delete from local products array
        this.products = this.products.filter(p => p.id !== id);
        
        // Notify listeners
        this.notifyListeners();
        
        console.log('Product deleted successfully');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
      }
      
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
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
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const initializeStore = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await productStore.initialize();
        setProducts(productStore.getProducts());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    initializeStore();

    const unsubscribe = productStore.subscribe(() => {
      setProducts(productStore.getProducts());
    });
    
    return unsubscribe;
  }, []);

  const addProduct = async (product: Product) => {
    setError(null);
    try {
      await productStore.addProduct(product);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      throw err;
    }
  };

  const updateProduct = async (id: string, product: Product) => {
    setError(null);
    try {
      await productStore.updateProduct(id, product);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    setError(null);
    try {
      await productStore.deleteProduct(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  return {
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById: (id: string) => productStore.getProductById(id),
    getProductsByBrand: (brand: Brand) => productStore.getProductsByBrand(brand),
    getBrandStats: (brand: Brand) => productStore.getBrandStats(brand)
  };
}
