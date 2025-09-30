'use client';

import { useState, useMemo, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Search, AlertTriangle, Package, TrendingDown, TrendingUp, Plus, Minus, Settings } from 'lucide-react';
import { useProducts } from '@/lib/stores/productStore';
import { Brand } from '@/lib/types';
import { manualRestockItems } from '@/lib/db/shared-db';

interface StockItem {
  id: string;
  productId: string;
  article: string;
  name: string;
  category: string;
  brand: Brand;
  sku: string;
  color: string;
  size: string;
  qty: number;
  minQty: number;
  location: string;
  wholesale: number;
  retail: number;
  club: number;
  costAfter: number;
}

const brandDisplayNames: Record<Brand, string> = {
  greenhil: 'Green Hill',
  harican: 'Harican',
  byko: 'Byko'
};

export default function StockPage() {
  const { products, getProductsByBrand } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<Brand | 'all'>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  
  // Stock adjustment modal states
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const stockData = useMemo(() => {
    const brandProducts = selectedBrand === 'all' ? products : getProductsByBrand(selectedBrand);
    const stockItems: StockItem[] = [];
    
    brandProducts.forEach(product => {
      if (product.variants.length > 0) {
        // Product has variants - create stock item for each variant
        product.variants.forEach(variant => {
          stockItems.push({
            id: variant.id,
            productId: product.id,
            article: product.article,
            name: product.title,
            category: product.category,
            brand: product.brand,
            sku: variant.sku,
            color: variant.attributes.Color || 'N/A',
            size: variant.attributes.Size || 'N/A',
            qty: variant.qty,
            minQty: 10,
            location: 'Warehouse A',
            wholesale: variant.wholesale || product.wholesale,
            retail: variant.retail || product.retail,
            club: variant.club || product.club,
            costAfter: product.costAfter
          });
        });
      } else {
        // Product has no variants - create a single stock item for the product
        stockItems.push({
          id: product.id,
          productId: product.id,
          article: product.article,
          name: product.title,
          category: product.category,
          brand: product.brand,
          sku: product.article,
          color: 'Standard',
          size: 'Standard',
          qty: 0, // Products without variants default to 0 stock
          minQty: 10,
          location: 'Warehouse A',
          wholesale: product.wholesale,
          retail: product.retail,
          club: product.club,
          costAfter: product.costAfter
        });
      }
    });
    
    return stockItems;
  }, [products, selectedBrand, getProductsByBrand]);

  // Fetch categories from API to maintain proper order
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setAvailableCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const filteredStock = stockData.filter(item => {
    const matchesSearch = 
      item.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || item.brand === selectedBrand;

    let matchesStockFilter = true;
    if (stockFilter === 'low-stock') {
      matchesStockFilter = item.qty <= item.minQty && item.qty > 0;
    } else if (stockFilter === 'out-of-stock') {
      matchesStockFilter = item.qty === 0;
    }

    return matchesSearch && matchesCategory && matchesBrand && matchesStockFilter;
  });

  const totalItems = stockData.length;
  const lowStockCount = stockData.filter(item => item.qty <= item.minQty && item.qty > 0).length;
  const outOfStockCount = stockData.filter(item => item.qty === 0).length;
  const totalValue = stockData.reduce((sum, item) => sum + (item.qty * item.costAfter), 0);

  const getStockStatus = (item: StockItem) => {
    if (item.qty === 0) {
      return { status: 'Out of Stock', variant: 'destructive' as const };
    } else if (item.qty <= item.minQty) {
      return { status: 'Low Stock', variant: 'secondary' as const };
    }
    return { status: 'In Stock', variant: 'default' as const };
  };

  const handleStockAdjustment = async () => {
    if (!selectedItem || adjustmentQuantity <= 0) return;

    try {
      const finalQuantity = adjustmentType === 'add' ? adjustmentQuantity : -adjustmentQuantity;
      
      const adjustmentItems = [{
        productId: selectedItem.productId,
        variantId: selectedItem.id !== selectedItem.productId ? selectedItem.id : undefined, // Only include variantId if it's different from productId
        quantity: finalQuantity,
        reason: adjustmentReason || `Manual ${adjustmentType === 'add' ? 'restock' : 'adjustment'}`
      }];

      const result = await manualRestockItems(adjustmentItems);
      
      if (result.success) {
        // Refresh the page or update local state
        window.location.reload();
      } else {
        alert(`Error: ${result.errors?.join(', ') || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Stock adjustment error:', error);
      alert('Failed to adjust stock. Please try again.');
    } finally {
      setAdjustmentModalOpen(false);
      setSelectedItem(null);
      setAdjustmentQuantity(0);
      setAdjustmentReason('');
    }
  };

  const openAdjustmentModal = (item: StockItem) => {
    setSelectedItem(item);
    setAdjustmentModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Stock Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage your inventory levels.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{totalItems}</div>
              <p className="text-xs text-muted-foreground">All variants</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
              <p className="text-xs text-muted-foreground">Need restocking</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Out of Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
              <p className="text-xs text-muted-foreground">Critical</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">£{totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Wholesale value</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          
          <Select value={selectedBrand} onValueChange={(value) => setSelectedBrand(value as Brand | 'all')}>
            <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-800 dark:border-gray-700">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              <SelectItem value="greenhil">Green Hill</SelectItem>
              <SelectItem value="harican">Harican</SelectItem>
              <SelectItem value="byko">Byko</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-800 dark:border-gray-700">
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

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-800 dark:border-gray-700">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock Only</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Stock Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Article</TableHead>
                    <TableHead className="dark:text-gray-300">Product</TableHead>
                    <TableHead className="dark:text-gray-300">Brand</TableHead>
                    <TableHead className="dark:text-gray-300">SKU</TableHead>
                    <TableHead className="dark:text-gray-300">Variant</TableHead>
                    <TableHead className="dark:text-gray-300">Stock</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                    <TableHead className="dark:text-gray-300 hidden lg:table-cell">Stock Value</TableHead>
                    <TableHead className="dark:text-gray-300 hidden xl:table-cell">Wholesale Rev.</TableHead>
                    <TableHead className="dark:text-gray-300 hidden xl:table-cell">Retail Rev.</TableHead>
                    <TableHead className="dark:text-gray-300 hidden xl:table-cell">Club Rev.</TableHead>
                    <TableHead className="dark:text-gray-300 sticky right-0 bg-white dark:bg-gray-800">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.length === 0 ? (
                    <TableRow className="dark:border-gray-700">
                      <TableCell colSpan={12} className="text-center py-8 dark:text-gray-400">
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p>No stock items found.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStock.map((item) => {
                      const stockStatus = getStockStatus(item);
                      return (
                        <TableRow key={item.id} className="dark:border-gray-700">
                          <TableCell className="font-medium dark:text-white">{item.article}</TableCell>
                          <TableCell className="dark:text-gray-300">{item.name}</TableCell>
                          <TableCell className="dark:text-gray-300">
                            <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                              {brandDisplayNames[item.brand]}
                            </Badge>
                          </TableCell>
                          <TableCell className="dark:text-gray-300 font-mono text-sm">{item.sku}</TableCell>
                          <TableCell className="dark:text-gray-300">
                            <div className="flex flex-col">
                              <span className="text-sm">{item.color}</span>
                              <span className="text-xs text-gray-500">{item.size}</span>
                            </div>
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            <div className="flex flex-col">
                              <span className="font-semibold">{item.qty}</span>
                              <span className="text-xs text-gray-500">Min: {item.minQty}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant}>
                              {stockStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="dark:text-gray-300 hidden lg:table-cell">
                            £{(item.qty * item.costAfter).toFixed(2)}
                          </TableCell>
                          <TableCell className="dark:text-gray-300 text-green-600 hidden xl:table-cell">
                            £{(item.qty * Math.max(0, item.wholesale - item.costAfter)).toFixed(2)}
                          </TableCell>
                          <TableCell className="dark:text-gray-300 text-blue-600 hidden xl:table-cell">
                            £{(item.qty * Math.max(0, item.retail - item.costAfter)).toFixed(2)}
                          </TableCell>
                          <TableCell className="dark:text-gray-300 text-purple-600 hidden xl:table-cell">
                            £{(item.qty * Math.max(0, item.club - item.costAfter)).toFixed(2)}
                          </TableCell>
                          <TableCell className="sticky right-0 bg-white dark:bg-gray-800">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAdjustmentModal(item)}
                              className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Adjust
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Stock Adjustment Modal */}
        <Dialog open={adjustmentModalOpen} onOpenChange={setAdjustmentModalOpen}>
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Adjust Stock Level</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                {selectedItem && (
                  <>
                    Adjusting stock for: <strong>{selectedItem.name}</strong> ({selectedItem.sku})
                    <br />
                    Current stock: <strong>{selectedItem.qty}</strong>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium dark:text-gray-300">Adjustment Type</label>
                  <Select value={adjustmentType} onValueChange={(value: 'add' | 'subtract') => setAdjustmentType(value)}>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">
                        <div className="flex items-center">
                          <Plus className="h-4 w-4 mr-2 text-green-500" />
                          Add Stock
                        </div>
                      </SelectItem>
                      <SelectItem value="subtract">
                        <div className="flex items-center">
                          <Minus className="h-4 w-4 mr-2 text-red-500" />
                          Remove Stock
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium dark:text-gray-300">Quantity</label>
                  <Input
                    type="number"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                    placeholder="Enter quantity..."
                    className="dark:bg-gray-700 dark:border-gray-600"
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium dark:text-gray-300">Reason (optional)</label>
                <Input
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g., Returned items, Damaged goods, etc."
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              {selectedItem && (
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <p className="text-sm dark:text-gray-300">
                    <strong>Final stock level:</strong> {' '}
                    {adjustmentType === 'add' 
                      ? selectedItem.qty + adjustmentQuantity
                      : Math.max(0, selectedItem.qty - adjustmentQuantity)
                    }
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setAdjustmentModalOpen(false)}
                className="dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStockAdjustment}
                disabled={adjustmentQuantity <= 0}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
