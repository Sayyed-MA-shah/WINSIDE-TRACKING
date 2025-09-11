'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Search, AlertTriangle, Package, TrendingDown, TrendingUp } from 'lucide-react';
import { useProducts } from '@/lib/stores/productStore';
import { Brand } from '@/lib/types';

interface StockItem {
  id: string;
  article: string;
  name: string;
  category: string;
  brand: Brand;
  sku: string;
  color: string;
  size: string;
  qty: number;
  minQty: number;
  maxQty: number;
  location: string;
  wholesale: number;
  retail: number;
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

  const stockData = useMemo(() => {
    const brandProducts = selectedBrand === 'all' ? products : getProductsByBrand(selectedBrand);
    const stockItems: StockItem[] = [];
    
    brandProducts.forEach(product => {
      product.variants.forEach(variant => {
        stockItems.push({
          id: variant.id,
          article: product.article,
          name: product.title,
          category: product.category,
          brand: product.brand,
          sku: variant.sku,
          color: variant.attributes.Color || 'N/A',
          size: variant.attributes.Size || 'N/A',
          qty: variant.qty,
          minQty: 10,
          maxQty: 100,
          location: 'Warehouse A',
          wholesale: variant.wholesale || product.wholesale,
          retail: variant.retail || product.retail
        });
      });
    });
    
    return stockItems;
  }, [products, selectedBrand, getProductsByBrand]);

  const categories = Array.from(new Set(stockData.map(item => item.category)));
  const brands = ['all', 'greenhil', 'harican', 'byko'] as const;

  const filteredStock = stockData.filter(item => {
    const matchesSearch = 
      item.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.size.toLowerCase().includes(searchTerm.toLowerCase());

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
  const totalValue = stockData.reduce((sum, item) => sum + (item.qty * item.wholesale), 0);

  const getStockStatus = (item: StockItem) => {
    if (item.qty === 0) {
      return { status: 'Out of Stock', variant: 'destructive' as const };
    } else if (item.qty <= item.minQty) {
      return { status: 'Low Stock', variant: 'secondary' as const };
    }
    return { status: 'In Stock', variant: 'default' as const };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Stock Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage your inventory levels across all products.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Total Stock Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{totalItems}</div>
              <p className="text-xs text-muted-foreground">All variants tracked</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Low Stock Items</CardTitle>
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
              <p className="text-xs text-muted-foreground">Critical attention needed</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Total Stock Value</CardTitle>
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
              placeholder="Search by article, name, SKU, color, or size..."
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
              {(brands.slice(1) as Brand[]).map(brand => (
                <SelectItem key={brand} value={brand}>
                  {brandDisplayNames[brand]}
                </SelectItem>
              ))}
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
                    <TableHead className="dark:text-gray-300">Product Name</TableHead>
                    <TableHead className="dark:text-gray-300">Brand</TableHead>
                    <TableHead className="dark:text-gray-300">SKU</TableHead>
                    <TableHead className="dark:text-gray-300">Variant</TableHead>
                    <TableHead className="dark:text-gray-300">Stock</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                    <TableHead className="dark:text-gray-300">Location</TableHead>
                    <TableHead className="dark:text-gray-300">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.length === 0 ? (
                    <TableRow className="dark:border-gray-700">
                      <TableCell colSpan={9} className="text-center py-8 dark:text-gray-400">
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p>No stock items found matching your criteria.</p>
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
                          <TableCell className="dark:text-gray-300">{item.location}</TableCell>
                          <TableCell className="dark:text-gray-300">
                            £{(item.qty * item.wholesale).toFixed(2)}
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
      </div>
    </DashboardLayout>
  );
}
