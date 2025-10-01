'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HaricanLayout } from '@/components/harican/HaricanLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Package, 
  Edit, 
  Trash2, 
  Plus,
  AlertTriangle,
  ImageIcon,
  LogOut
} from 'lucide-react';
import { useProducts } from '@/lib/stores/productStore';
import ProductVariantModal from '@/components/dashboard/ProductVariantModal';
import { Product } from '@/lib/types';
import { useHaricanAuth } from '@/lib/context/harican-auth';

export default function HaricanProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useHaricanAuth();
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/harican-auth');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Filter for Harican products only
  const haricanProducts = products.filter(product => product.brand === 'harican');

  // Get unique categories for Harican products
  const categories = [...new Set(haricanProducts.map(product => product.category))].filter(Boolean);

  // Filter products based on search and category
  const filteredProducts = haricanProducts.filter(product => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.article.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory && !product.archived;
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setActionLoading('save');
    try {
      // Force brand to be 'harican' for this dashboard
      const haricanProductData = {
        ...productData,
        brand: 'harican' as const
      };

      if (editingProduct) {
        // Update existing product
        const updatedProduct: Product = {
          ...haricanProductData,
          id: editingProduct.id,
          createdAt: editingProduct.createdAt,
          updatedAt: new Date(),
          variants: haricanProductData.variants.map((v, index) => ({
            ...v,
            id: v.id || `${editingProduct.id}-variant-${index}`,
            productId: editingProduct.id
          }))
        };
        await updateProduct(editingProduct.id, updatedProduct);
      } else {
        // Add new product
        const newProductId = `harican-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newProduct: Product = {
          ...haricanProductData,
          id: newProductId,
          createdAt: new Date(),
          updatedAt: new Date(),
          variants: haricanProductData.variants.map((v, index) => ({
            ...v,
            id: `${newProductId}-variant-${index}`,
            productId: newProductId
          }))
        };
        await addProduct(newProduct);
      }
      setShowModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      setActionLoading('delete');
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Error deleting product:', error);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const getStockLevel = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return 0;
    return product.variants.reduce((total, variant) => total + (variant.qty || 0), 0);
  };

  const getStockStatus = (stockLevel: number) => {
    if (stockLevel === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stockLevel < 10) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  if (isLoading) {
    return (
      <HaricanLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading Harican products...</div>
        </div>
      </HaricanLayout>
    );
  }

  return (
    <HaricanLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Harican Products</h1>
            <p className="text-muted-foreground">
              Manage your Harican product inventory
            </p>
          </div>
          <Button onClick={handleAddProduct} disabled={actionLoading === 'save'}>
            <Plus className="h-4 w-4 mr-2" />
            Add Harican Product
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Harican Product Inventory ({filteredProducts.length} products)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Harican products found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'Get started by adding your first Harican product.'}
                </p>
                <Button onClick={handleAddProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Harican Product
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Article</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Wholesale</TableHead>
                    <TableHead>Retail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockLevel = getStockLevel(product);
                    const stockStatus = getStockStatus(stockLevel);
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.mediaMain ? (
                            <img 
                              src={product.mediaMain} 
                              alt={product.title}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{product.article}</TableCell>
                        <TableCell>{product.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>{stockLevel}</TableCell>
                        <TableCell>£{product.wholesale?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>£{product.retail?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>
                            {stockLevel < 10 && stockLevel > 0 && (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            )}
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              disabled={actionLoading !== null}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={actionLoading !== null}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <ProductVariantModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />
    </HaricanLayout>
  );
}