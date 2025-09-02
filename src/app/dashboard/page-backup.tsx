'use client';

import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Users, 
  FileText, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Store
} from 'lucide-react';
import { useProducts, productStore } from '@/lib/stores/productStore';
import { Brand } from '@/lib/types';
import { useState, useEffect } from 'react';

const recentInvoices = [
  { id: 'INV-001', customer: 'John Doe', amount: 1250.00, status: 'paid' as const },
  { id: 'INV-002', customer: 'Jane Smith', amount: 890.50, status: 'pending' as const },
  { id: 'INV-003', customer: 'Bob Johnson', amount: 2100.75, status: 'overdue' as const },
  { id: 'INV-004', customer: 'Alice Brown', amount: 750.00, status: 'paid' as const },
];

const brandDisplayNames: Record<Brand, string> = {
  greenhil: 'Green Hill',
  harican: 'Harican',
  byko: 'Byko'
};

export default function DashboardPage() {
  const { products } = useProducts();
  const [selectedBrand, setSelectedBrand] = useState<Brand>('greenhil');
  const [brandStats, setBrandStats] = useState<any>(null);

  useEffect(() => {
    try {
      // Call getBrandStats directly from the store instead of from the hook
      const stats = productStore.getBrandStats(selectedBrand);
      setBrandStats(stats);
    } catch (error) {
      console.error('Error getting brand stats:', error);
      setBrandStats({
        totalProducts: 0,
        stockValue: 0,
        lowStockCount: 0,
        lowStockProducts: []
      });
    }
  }, [selectedBrand, products]); // Depend on selectedBrand and products instead of getBrandStats

  if (!brandStats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your business.</p>
          </div>
          
          {/* Brand Selector */}
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <div className="flex rounded-lg border dark:border-gray-700 overflow-hidden">
              {(['greenhil', 'harican', 'byko'] as Brand[]).map((brand) => (
                <Button
                  key={brand}
                  variant={selectedBrand === brand ? "default" : "ghost"}
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedBrand(brand);
                  }}
                  className={`rounded-none border-0 ${
                    selectedBrand === brand 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {brandDisplayNames[brand]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{brandStats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {brandDisplayNames[selectedBrand]} stock
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Stock Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">£{brandStats.stockValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Current inventory value
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{brandStats.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {brandDisplayNames[selectedBrand]} orders
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">£{brandStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {brandDisplayNames[selectedBrand]} sales
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{brandStats.lowStockCount}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Pending Invoices</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{brandStats.pendingInvoices}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Potential Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Wholesale Revenue Potential</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">£{brandStats.potentialWholesaleRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Profit if sold at wholesale
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Retail Revenue Potential</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">£{brandStats.potentialRetailRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Profit if sold at retail
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Club Revenue Potential</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">£{brandStats.potentialClubRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Profit if sold at club price
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Invoices */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium dark:text-white">{invoice.id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium dark:text-white">£{invoice.amount.toFixed(2)}</p>
                      <Badge 
                        variant={
                          invoice.status === 'paid' ? 'default' : 
                          invoice.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Low Stock Alert - {brandDisplayNames[selectedBrand]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {brandStats.lowStockProducts && brandStats.lowStockProducts.length > 0 ? (
                  brandStats.lowStockProducts.map((product: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium dark:text-white">{product.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Min: {product.minStock}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-yellow-600">{product.stock} left</p>
                        <Badge variant="destructive">Low Stock</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">No low stock items for {brandDisplayNames[selectedBrand]}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
