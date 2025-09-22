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
  Heart
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

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
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
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {product.sku && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          SKU: {product.sku}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/insole/products/${product.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {product.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    {/* Pricing */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Price:</span>
                      <span className="text-lg font-bold text-green-600">£{product.price?.toFixed(2) || '0.00'}</span>
                    </div>
                    
                    {/* Cost */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cost:</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">£{product.cost?.toFixed(2) || '0.00'}</span>
                    </div>

                    {/* Stock */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Stock:</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          (product.stock || 0) < 10 
                            ? 'text-red-600' 
                            : (product.stock || 0) < 20 
                              ? 'text-yellow-600' 
                              : 'text-green-600'
                        }`}>
                          {product.stock || 0} units
                        </span>
                        {(product.stock || 0) < 10 && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>

                    {/* Profit Margin */}
                    {product.price && product.cost && (
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Profit:</span>
                        <span className="text-sm font-medium text-blue-600">
                          £{(product.price - product.cost).toFixed(2)} 
                          <span className="text-xs ml-1">
                            ({(((product.price - product.cost) / product.price) * 100).toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Stock Status Badge */}
                    <div className="pt-2">
                      <Badge 
                        variant={
                          (product.stock || 0) === 0 
                            ? 'destructive' 
                            : (product.stock || 0) < 10 
                              ? 'secondary' 
                              : 'default'
                        }
                        className="w-full justify-center"
                      >
                        {(product.stock || 0) === 0 
                          ? 'Out of Stock' 
                          : (product.stock || 0) < 10 
                            ? 'Low Stock' 
                            : 'In Stock'
                        }
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}