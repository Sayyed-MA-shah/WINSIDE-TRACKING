'use client';

import { useState, useMemo } from 'react';
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
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useProducts } from '@/lib/stores/productStore';

interface StockItem {
  id: string;
  productId: string;
  article: string;
  name: string;
  category: string;
  brand: string;
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

export default function HaricanStockPage() {
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter for Harican products only and create stock items
  const stockData = useMemo(() => {
    const haricanProducts = products.filter(product => product.brand === 'harican');
    const stockItems: StockItem[] = [];
    
    haricanProducts.forEach(product => {
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
  }, [products]);

  const categories = useMemo(() => {
    return Array.from(new Set(stockData.map(item => item.category)));
  }, [stockData]);

  const filteredStock = stockData.filter(item => {
    const matchesSearch = 
      item.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    const matchesFilter = (() => {
      switch (selectedFilter) {
        case 'low-stock':
          return item.qty < item.minQty && item.qty > 0;
        case 'out-of-stock':
          return item.qty === 0;
        case 'in-stock':
          return item.qty >= item.minQty;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesCategory && matchesFilter;
  });

  const getStockStatus = (qty: number, minQty: number) => {
    if (qty === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (qty < minQty) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const totalItems = stockData.length;
  const totalStock = stockData.reduce((sum, item) => sum + item.qty, 0);
  const lowStockItems = stockData.filter(item => item.qty < item.minQty && item.qty > 0).length;
  const outOfStockItems = stockData.filter(item => item.qty === 0).length;
  const totalValue = stockData.reduce((sum, item) => sum + (item.qty * item.wholesale), 0);

  return (
    <HaricanLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Harican Stock Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage Harican inventory levels
            </p>
          </div>
        </div>

        {/* Stock Overview Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Stock keeping units
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock}</div>
              <p className="text-xs text-muted-foreground">
                Units in inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Items need restocking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Items unavailable
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Wholesale value
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Harican Stock Levels ({filteredStock.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search stock..."
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
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredStock.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stock items found</h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">Article</TableHead>
                      <TableHead className="min-w-[200px]">Product Name</TableHead>
                      <TableHead className="min-w-[120px]">SKU</TableHead>
                      <TableHead className="hidden sm:table-cell min-w-[100px]">Category</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[80px]">Color</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[80px]">Size</TableHead>
                      <TableHead className="text-center min-w-[100px]">Stock</TableHead>
                      <TableHead className="hidden lg:table-cell text-center min-w-[80px]">Min</TableHead>
                      <TableHead className="text-center min-w-[100px]">Status</TableHead>
                      <TableHead className="hidden sm:table-cell text-right min-w-[100px]">Wholesale</TableHead>
                      <TableHead className="text-right min-w-[120px]">Stock Value</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredStock.map((item) => {
                    const stockStatus = getStockStatus(item.qty, item.minQty);
                    const stockValue = item.qty * item.wholesale;
                    
                    return (
                      <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="font-medium">{item.article}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{item.color}</TableCell>
                        <TableCell className="hidden md:table-cell">{item.size}</TableCell>
                        <TableCell className="text-center font-medium">
                          {item.qty}
                          {item.qty < item.minQty && item.qty > 0 && (
                            <AlertTriangle className="inline h-4 w-4 ml-2 text-orange-500" />
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-center">{item.minQty}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={stockStatus.color}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-right">£{item.wholesale.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">£{stockValue.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        {(lowStockItems > 0 || outOfStockItems > 0) && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {outOfStockItems > 0 && (
                  <p className="text-red-700">
                    <strong>{outOfStockItems}</strong> items are out of stock
                  </p>
                )}
                {lowStockItems > 0 && (
                  <p className="text-orange-700">
                    <strong>{lowStockItems}</strong> items are running low on stock
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </HaricanLayout>
  );
}