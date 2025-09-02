"use client";

import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, DollarSign, Archive, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/layout';
import ProductVariantModal from '@/components/dashboard/ProductVariantModal';
import { Product, LegacyProduct } from '@/lib/types';
import { useProducts } from '@/lib/stores/productStore';
import { generateId } from '@/lib/utils/ssr-safe';

export default function ProductsPage() {
  const { products, isLoading, error, addProduct, updateProduct, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesArchived = showArchived || !product.archived;
    
    return matchesSearch && matchesCategory && matchesArchived;
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
      if (editingProduct) {
        // Update existing product
        const updatedProduct: Product = {
          ...productData,
          id: editingProduct.id,
          createdAt: editingProduct.createdAt,
          updatedAt: new Date(),
          variants: productData.variants.map((v, index) => ({
            ...v,
            id: v.id || `${editingProduct.id}-variant-${index}`,
            productId: editingProduct.id
          }))
        };
        await updateProduct(editingProduct.id, updatedProduct);
      } else {
        // Add new product
        const newProductId = generateId('product');
        const newProduct: Product = {
          ...productData,
          id: newProductId,
          createdAt: new Date(),
          updatedAt: new Date(),
          variants: productData.variants.map((v, index) => ({
            ...v,
            id: generateId('variant'),
            productId: newProductId
          }))
        };
        await addProduct(newProduct);
      }
      setShowModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      // Error handling is managed by the store
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      setActionLoading(`delete-${productId}`);
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Error deleting product:', error);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleArchiveProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setActionLoading(`archive-${productId}`);
      try {
        const updatedProduct = { ...product, archived: !product.archived, updatedAt: new Date() };
        await updateProduct(productId, updatedProduct);
      } catch (error) {
        console.error('Error archiving product:', error);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const getProductStats = (product: Product) => {
    const totalQty = product.variants.reduce((sum, v) => sum + v.qty, 0);
    const totalValue = product.variants.reduce((sum, v) => {
      // Use variant's costAfter if provided, otherwise use product's global costAfter
      const costAfter = v.costAfter ?? product.costAfter;
      return sum + (v.qty * costAfter);
    }, 0);
    
    return { totalQty, totalValue, retail: product.retail, wholesale: product.wholesale };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Articles</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your product catalog with variants</p>
          </div>
          <button
            onClick={handleAddProduct}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading products...</span>
          </div>
        ) : (
        <>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products, articles, or SKUs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-gray-300 text-blue-600"
            />
            <span>Show Archived</span>
          </label>
        </div>

        {/* Products Grid/List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const stats = getProductStats(product);
            return (
              <div
                key={product.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border ${
                  product.archived 
                    ? 'border-gray-300 dark:border-gray-600 opacity-75' 
                    : 'border-gray-200 dark:border-gray-700'
                } shadow-sm hover:shadow-md transition-shadow`}
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
                        {product.archived && (
                          <Archive className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.article} • {product.category}
                      </p>
                    </div>
                  </div>

                  {/* Attributes */}
                  {product.attributes.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {product.attributes.map(attr => (
                          <span
                            key={attr}
                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded"
                          >
                            {attr}
                          </span>
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
                        {product.variants.length}
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
                      {product.variants.slice(0, 2).map(variant => (
                        <div key={variant.id} className="flex items-center justify-between text-xs">
                          <span className="font-mono text-gray-700 dark:text-gray-300">
                            {variant.sku}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            Qty: {variant.qty}
                          </span>
                        </div>
                      ))}
                      {product.variants.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{product.variants.length - 2} more variants
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex items-center px-3 py-1 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchiveProduct(product.id)}
                      disabled={actionLoading === `archive-${product.id}`}
                      className={`flex items-center px-3 py-1 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed ${
                        product.archived
                          ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                          : 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                      }`}
                    >
                      {actionLoading === `archive-${product.id}` ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                      ) : (
                        <Archive className="w-3 h-3 mr-1" />
                      )}
                      {product.archived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={actionLoading === `delete-${product.id}`}
                      className="flex items-center px-3 py-1 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === `delete-${product.id}` ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                      ) : (
                        <Trash2 className="w-3 h-3 mr-1" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Get started by adding your first product.'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={handleAddProduct}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </button>
            )}
          </div>
        )}
        </>
        )}
      </div>

      <ProductVariantModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />
    </DashboardLayout>
  );
}
