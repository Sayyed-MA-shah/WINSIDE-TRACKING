# Implementation Guide: Moving to Production Database

## 🚀 Step-by-Step Implementation

### Phase 1: Setup Supabase (Recommended)

#### 1. Create Supabase Project
```bash
# 1. Go to https://supabase.com
# 2. Create new project
# 3. Choose region closest to your users
# 4. Save your project URL and anon key
```

#### 2. Install Dependencies
```bash
npm install @supabase/supabase-js
npm install -D @types/node
```

#### 3. Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Phase 2: Database Client Setup

#### 1. Create Supabase Client
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### 2. Database Types
```typescript
// src/lib/database.types.ts
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          article: string
          title: string
          category: string
          taxable: boolean
          attributes: string[]
          media_main: string | null
          archived: boolean
          wholesale: number
          retail: number
          club: number
          cost_before: number
          cost_after: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          article: string
          title: string
          category: string
          taxable?: boolean
          attributes?: string[]
          media_main?: string | null
          archived?: boolean
          wholesale: number
          retail: number
          club: number
          cost_before: number
          cost_after: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          article?: string
          title?: string
          category?: string
          taxable?: boolean
          attributes?: string[]
          media_main?: string | null
          archived?: boolean
          wholesale?: number
          retail?: number
          club?: number
          cost_before?: number
          cost_after?: number
          created_at?: string
          updated_at?: string
        }
      }
      // ... other tables
    }
  }
}
```

### Phase 3: Replace Store with Database Service

#### 1. Create Database Service
```typescript
// src/lib/services/productService.ts
import { supabase } from '@/lib/supabase'
import { Product, Variant } from '@/lib/types'

export class ProductService {
  async getProducts(): Promise<Product[]> {
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('archived', false)

    if (error) throw error
    
    return products.map(product => ({
      ...product,
      variants: product.product_variants || []
    }))
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        article: product.article,
        title: product.title,
        category: product.category,
        taxable: product.taxable,
        attributes: product.attributes,
        media_main: product.mediaMain,
        wholesale: product.wholesale,
        retail: product.retail,
        club: product.club,
        cost_before: product.costBefore,
        cost_after: product.costAfter
      })
      .select()
      .single()

    if (error) throw error

    // Create variants
    if (product.variants && product.variants.length > 0) {
      const variantsData = product.variants.map(variant => ({
        product_id: data.id,
        sku: variant.sku,
        attributes: variant.attributes,
        qty: variant.qty,
        wholesale: variant.wholesale,
        retail: variant.retail,
        club: variant.club,
        cost_before: variant.costBefore,
        cost_after: variant.costAfter
      }))

      await supabase
        .from('product_variants')
        .insert(variantsData)
    }

    return this.getProductById(data.id)
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { error } = await supabase
      .from('products')
      .update({
        title: updates.title,
        category: updates.category,
        wholesale: updates.wholesale,
        retail: updates.retail,
        club: updates.club,
        // ... other fields
      })
      .eq('id', id)

    if (error) throw error
    
    return this.getProductById(id)
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  private async getProductById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    
    return {
      ...data,
      variants: data.product_variants || []
    }
  }
}

export const productService = new ProductService()
```

### Phase 4: Update React Components

#### 1. Replace Store Hook
```typescript
// src/lib/hooks/useProducts.ts
import { useState, useEffect } from 'react'
import { productService } from '@/lib/services/productService'
import { Product } from '@/lib/types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getProducts()
      setProducts(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProduct = await productService.createProduct(product)
      setProducts(prev => [...prev, newProduct])
      return newProduct
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
      throw err
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updatedProduct = await productService.updateProduct(id, updates)
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
      return updatedProduct
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
      throw err
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      throw err
    }
  }

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refresh: loadProducts
  }
}
```

### Phase 5: Migration Strategy

#### Option A: Fresh Start (Recommended for new projects)
1. Set up Supabase with schema
2. Replace current store with database service
3. Test all functionality
4. Deploy to production

#### Option B: Data Migration (If you have existing data)
1. Export current data from localStorage/memory
2. Create migration script to populate Supabase
3. Switch to database service
4. Verify data integrity

### Phase 6: Deployment Options

#### 1. Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

#### 2. Netlify
```bash
# Build and deploy
npm run build
# Upload dist folder to Netlify
```

#### 3. Railway
```bash
# Connect GitHub repo
# Auto-deploy on push
```

## 🔧 Additional Considerations

### 1. Authentication
- Add Supabase Auth for user management
- Implement role-based access control
- Secure API endpoints

### 2. File Upload
- Use Supabase Storage for product images
- Implement image optimization

### 3. Real-time Updates
- Use Supabase real-time subscriptions
- Update UI when data changes

### 4. Backup Strategy
- Supabase provides automatic backups
- Consider additional backup solutions for critical data

### 5. Performance Optimization
- Implement pagination for large datasets
- Add caching layer (Redis)
- Optimize database queries

## 💰 Cost Estimates

### Supabase Pricing
- **Free Tier**: Up to 500MB database, 5GB bandwidth
- **Pro Tier**: $25/month - 8GB database, 250GB bandwidth
- **Team Tier**: $599/month - Larger limits + support

### Hosting (Vercel)
- **Free Tier**: Perfect for small projects
- **Pro Tier**: $20/month per user for commercial use

## 🚀 Next Steps

1. **Choose your database** (I recommend Supabase)
2. **Set up the project** and create schema
3. **Install dependencies** and configure environment
4. **Replace the store system** with database service
5. **Test thoroughly** before going live
6. **Deploy to production** platform

Would you like me to start implementing any of these steps?
