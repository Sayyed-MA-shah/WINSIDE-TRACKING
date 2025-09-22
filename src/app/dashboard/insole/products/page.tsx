'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Heart,
  DollarSign,
  Archive
} from 'lucide-react';
import { useInsoleAuth } from '@/lib/context/insole-auth';
import { insoleDb } from '@/lib/db/insole-db';

export default function InsoleProducts() {
  const router = useRouter();
  const { user } = useInsoleAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/dashboard');
      return;
    }
    fetchProducts();
  }, [user, router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await insoleDb.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching insole products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await insoleDb.deleteProduct(productId);
      await fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const getProductStats = (product: any) => {
    const variations = product.variations || [];
    const totalQty = variations.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || product.stock_quantity || 0;
    const variantCount = variations.length || 1;
    
    return { 
      totalQty, 
      variantCount, 
      retail: product.retail || 0, 
      wholesale: product.wholesale || 0 
    };
  };

  const filteredProducts = products.filter(product =>
    product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.article?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/insole')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Products</h1>
              </div>
            </div>
            <Button onClick={() => router.push('/dashboard/insole/products/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="outline">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms.'
                  : 'Get started by adding your first product to the inventory.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/dashboard/insole/products/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const stats = getProductStats(product);
              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  {product.mediaMain && (
                    <div className="aspect-video rounded-t-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={product.mediaMain}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{product.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {product.article} • {product.category}
                        </p>
                      </div>
                    </div>

                    {/* Attributes */}
                    {product.attributes && Array.isArray(product.attributes) && product.attributes.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {product.attributes.map((attr: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded"
                            >
                              {attr}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attribute Values */}
                    {product.attributeValues && typeof product.attributeValues === 'object' && Object.keys(product.attributeValues).length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(product.attributeValues).map(([key, values]) => (
                            Array.isArray(values) && values.map((value, index) => (
                              <span
                                key={`${key}-${index}`}
                                className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded"
                              >
                                {key}: {value}
                              </span>
                            ))
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {stats.variantCount}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Variants</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {stats.totalQty}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Qty</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          £{stats.retail.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Retail Price</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          £{stats.wholesale.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Wholesale</div>
                      </div>
                    </div>

                    {/* Sample Variants */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Sample SKUs:</div>
                      <div className="space-y-1">
                        {product.variations && product.variations.length > 0 ? (
                          <>
                            {product.variations.slice(0, 2).map((variant: any, index: number) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <span className="font-mono text-gray-700 dark:text-gray-300">
                                  {variant.sku || `${product.article}-${index + 1}`}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  Qty: {variant.stock || 0}
                                </span>
                              </div>
                            ))}
                            {product.variations.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                +{product.variations.length - 2} more variants
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-gray-700 dark:text-gray-300">
                              {product.article}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              Qty: {product.stock_quantity || 0}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/insole/products/${product.id}/edit`)}
                        className="flex items-center px-3 py-1 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center px-3 py-1 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}