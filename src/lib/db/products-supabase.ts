import { supabaseAdmin } from '../supabase'
import { Product, Variant } from '../types'

export async function getAllProducts(): Promise<Product[]> {
  try {
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('createdAt', { ascending: false })
    
    if (productsError) throw productsError

    // Get variants for each product
    const { data: variants, error: variantsError } = await supabaseAdmin
      .from('variants')
      .select('*')
    
    if (variantsError) throw variantsError

    // Combine products with their variants
    const productsWithVariants = (products || []).map(product => ({
      ...product,
      variants: (variants || []).filter(variant => variant.productId === product.id)
    }))
    
    return productsWithVariants
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    if (productError) throw productError

    // Get variants for this product
    const { data: variants, error: variantsError } = await supabaseAdmin
      .from('variants')
      .select('*')
      .eq('productId', id)
    
    if (variantsError) throw variantsError

    return {
      ...product,
      variants: variants || []
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  try {
    const newProduct = {
      id: `prod-${Date.now()}`,
      name: product.name,
      brand: product.brand,
      category: product.category,
      wholesalePrice: product.wholesalePrice,
      retailPrice: product.retailPrice,
      article: product.article,
      shelfNo: product.shelfNo,
      createdAt: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([newProduct])
      .select()
      .single()
    
    if (error) throw error

    // Create variants if provided
    if (product.variants && product.variants.length > 0) {
      const variantsToCreate = product.variants.map(variant => ({
        id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: data.id,
        sku: variant.sku,
        attributes: variant.attributes,
        qty: variant.qty || 0
      }))

      const { data: createdVariants, error: variantsError } = await supabaseAdmin
        .from('variants')
        .insert(variantsToCreate)
        .select()
      
      if (variantsError) throw variantsError

      return {
        ...data,
        variants: createdVariants || []
      }
    }

    return {
      ...data,
      variants: []
    }
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error

    // Get updated variants
    const { data: variants } = await supabaseAdmin
      .from('variants')
      .select('*')
      .eq('productId', id)

    return {
      ...data,
      variants: variants || []
    }
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    // Delete variants first (due to foreign key constraint)
    await supabaseAdmin
      .from('variants')
      .delete()
      .eq('productId', id)

    // Delete product
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}
