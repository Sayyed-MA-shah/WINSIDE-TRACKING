import React from 'react';
import { Product, Brand, BrandStats } from '@/lib/types';

// LocalStorage-backed store for immediate persistence
class ProductStore {
  private products: Product[] = [];
  private listeners: Array<() => void> = [];
  private isInitialized: boolean = false;
  private readonly STORAGE_KEY = 'winside_products';

  constructor() {
    // Load from localStorage immediately
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          this.products = JSON.parse(stored);
          console.log('Loaded products from localStorage:', this.products.length);
        } else {
          // Add sample products if none exist
          this.products = this.getSampleProducts();
          this.saveToLocalStorage();
          console.log('Added sample products to localStorage');
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        this.products = this.getSampleProducts();
        this.saveToLocalStorage();
      }
    }
    this.isInitialized = true;
  }

  private saveToLocalStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.products));
        console.log('Saved products to localStorage:', this.products.length);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.loadFromLocalStorage();
    this.notifyListeners();
  }

  private getSampleProducts(): Product[] {
    return [
      {
        id: 'prod-1',
        article: 'BGA-1012',
        title: 'Boxing Gloves Amok',
        category: 'Boxing Gloves',
        brand: 'byko',
        taxable: true,
        attributes: ['Size', 'Color'],
        mediaMain: undefined,
        costBefore: 12.00,
        costAfter: 16.00,
        wholesale: 35.00,
        retail: 49.99,
        club: 42.49,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        variants: [
          {
            id: 'variant-1',
            productId: 'prod-1',
            sku: 'BGA-1012-BLACK-10OZ',
            attributes: { Size: '10oz', Color: 'Black' },
            qty: 9,
            wholesale: undefined,
            retail: undefined,
            costAfter: undefined
          },
          {
            id: 'variant-2',
            productId: 'prod-1',
            sku: 'BGA-1012-BLACK-12OZ',
            attributes: { Size: '12oz', Color: 'Black' },
            qty: 10,
            wholesale: undefined,
            retail: undefined,
            costAfter: undefined
          }
        ]
      },
      {
        id: 'prod-2',
        article: 'BGC-1011',
        title: 'Boxing Gloves ClassX',
        category: 'Boxing Gloves',
        brand: 'harican',
        taxable: true,
        attributes: ['Size', 'Color'],
        mediaMain: undefined,
        costBefore: 14.00,
        costAfter: 18.00,
        wholesale: 41.00,
        retail: 69.99,
        club: 59.49,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        variants: [
          {
            id: 'variant-3',
            productId: 'prod-2',
            sku: 'BGC-1011-BLACK-10OZ',
            attributes: { Size: '10oz', Color: 'Black' },
            qty: 4,
            wholesale: undefined,
            retail: undefined,
            costAfter: undefined
          },
          {
            id: 'variant-4',
            productId: 'prod-2',
            sku: 'BGC-1011-BLACK-12OZ',
            attributes: { Size: '12oz', Color: 'Black' },
            qty: 4,
            wholesale: undefined,
            retail: undefined,
            costAfter: undefined
          }
        ]
      }
    ];
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
      console.log('Adding product to localStorage:', product.title);
      
      // Add to local products array
      this.products.push(product);
      
      // Save to localStorage immediately
      this.saveToLocalStorage();
      
      // Notify listeners
      this.notifyListeners();
      
      console.log('Product added successfully to localStorage');
      
      // Try to sync with database in background (don't throw on failure)
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        });
        
        if (response.ok) {
          console.log('Product also synced to database');
        } else {
          console.log('Database sync failed, but product saved locally');
        }
      } catch (dbError) {
        console.log('Database sync failed, but product saved locally:', dbError);
      }
      
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updatedProduct: Product): Promise<void> {
    try {
      console.log('Updating product in localStorage:', id);
      
      // Update in local products array
      const index = this.products.findIndex(p => p.id === id);
      if (index !== -1) {
        this.products[index] = updatedProduct;
        
        // Save to localStorage immediately
        this.saveToLocalStorage();
        
        // Notify listeners
        this.notifyListeners();
        
        console.log('Product updated successfully in localStorage');
      }
      
      // Try to sync with database in background (don't throw on failure)
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedProduct),
        });
        
        if (response.ok) {
          console.log('Product also synced to database');
        } else {
          console.log('Database sync failed, but product updated locally');
        }
      } catch (dbError) {
        console.log('Database sync failed, but product updated locally:', dbError);
      }
      
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      console.log('Deleting product from localStorage:', id);
      
      // Delete from local products array
      this.products = this.products.filter(p => p.id !== id);
      
      // Save to localStorage immediately
      this.saveToLocalStorage();
      
      // Notify listeners
      this.notifyListeners();
      
      console.log('Product deleted successfully from localStorage');
      
      // Try to sync with database in background (don't throw on failure)
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          console.log('Product also deleted from database');
        } else {
          console.log('Database sync failed, but product deleted locally');
        }
      } catch (dbError) {
        console.log('Database sync failed, but product deleted locally:', dbError);
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
