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
import { Brand } from '@/lib/types';
import { useState, useEffect } from 'react';

interface DashboardStats {
  totalProducts: number;
  stockValue: number;
  totalInvoices: number;
  totalRevenue: number;
  lowStockCount: number;
  pendingInvoices: number;
  wholesaleRevenue: number;
  retailRevenue: number;
  clubRevenue: number;
  lowStockProducts: any[];
  recentInvoices: any[];
}

const brandDisplayNames: Record<Brand, string> = {
  greenhil: 'Green Hill',
  harican: 'Harican',
  byko: 'Byko'
};

export default function DashboardPage() {
  const [selectedBrand, setSelectedBrand] = useState<Brand>('greenhil');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [selectedBrand]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple endpoints
      const [invoicesRes, customersRes, productsRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/customers'),
        fetch('/api/products')
      ]);

      const invoices = invoicesRes.ok ? await invoicesRes.json() : [];
      const customers = customersRes.ok ? await customersRes.json() : [];
      const products = productsRes.ok ? await productsRes.json() : [];

      // Filter invoices by customer type to calculate real revenue
      const wholesaleInvoices = invoices.filter((inv: any) => {
        const customer = customers.find((c: any) => c.id === inv.customerId);
        return customer?.type === 'wholesale';
      });

      const retailInvoices = invoices.filter((inv: any) => {
        const customer = customers.find((c: any) => c.id === inv.customerId);
        return customer?.type === 'retail';
      });

      const clubInvoices = invoices.filter((inv: any) => {
        const customer = customers.find((c: any) => c.id === inv.customerId);
        return customer?.type === 'club';
      });

      // Calculate revenue by customer type
      const wholesaleRevenue = wholesaleInvoices.reduce((sum: number, inv: any) => sum + inv.total, 0);
      const retailRevenue = retailInvoices.reduce((sum: number, inv: any) => sum + inv.total, 0);
      const clubRevenue = clubInvoices.reduce((sum: number, inv: any) => sum + inv.total, 0);

      // Filter products by selected brand
      const brandProducts = products.filter((p: any) => p.brand === selectedBrand);

      // Calculate stats
      const totalProducts = brandProducts.length;
      const stockValue = brandProducts.reduce((total: number, product: any) => {
        return total + (product.stock * product.costPrice);
      }, 0);

      const totalInvoices = invoices.length;
      const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + inv.total, 0);
      const pendingInvoices = invoices.filter((inv: any) => inv.status === 'pending').length;

      // Low stock products (less than 10 items)
      const lowStockProducts = brandProducts.filter((p: any) => p.stock < 10);
      const lowStockCount = lowStockProducts.length;

      // Recent invoices (last 5)
      const recentInvoices = invoices
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((inv: any) => ({
          id: inv.invoiceNumber,
          customer: customers.find((c: any) => c.id === inv.customerId)?.name || 'Unknown',
          amount: inv.total,
          status: inv.status
        }));

      setDashboardStats({
        totalProducts,
        stockValue,
        totalInvoices,
        totalRevenue,
        lowStockCount,
        pendingInvoices,
        wholesaleRevenue,
        retailRevenue,
        clubRevenue,
        lowStockProducts: lowStockProducts.map((p: any) => ({
          name: p.name,
          stock: p.stock,
          minStock: 10
        })),
        recentInvoices
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default stats if API fails
      setDashboardStats({
        totalProducts: 0,
        stockValue: 0,
        totalInvoices: 0,
        totalRevenue: 0,
        lowStockCount: 0,
        pendingInvoices: 0,
        wholesaleRevenue: 0,
        retailRevenue: 0,
        clubRevenue: 0,
        lowStockProducts: [],
        recentInvoices: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (!dashboardStats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Unable to load dashboard data</p>
            <Button onClick={fetchDashboardStats} className="mt-4">
              Retry
            </Button>
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
                  onClick={() => setSelectedBrand(brand)}
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
              <div className="text-2xl font-bold dark:text-white">{dashboardStats.totalProducts}</div>
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
              <div className="text-2xl font-bold dark:text-white">£{dashboardStats.stockValue.toLocaleString()}</div>
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
              <div className="text-2xl font-bold dark:text-white">{dashboardStats.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                All orders
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">£{dashboardStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All sales
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{dashboardStats.lowStockCount}</div>
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
              <div className="text-2xl font-bold dark:text-white">{dashboardStats.pendingInvoices}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Customer Type Cards - REAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Wholesale Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">£{dashboardStats.wholesaleRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From wholesale customers
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Retail Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">£{dashboardStats.retailRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From retail customers
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-200">Club Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">£{dashboardStats.clubRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From club customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Invoices - REAL DATA */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardStats.recentInvoices.length > 0 ? (
                  dashboardStats.recentInvoices.map((invoice) => (
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">No recent invoices</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert - REAL DATA */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Low Stock Alert - {brandDisplayNames[selectedBrand]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardStats.lowStockProducts && dashboardStats.lowStockProducts.length > 0 ? (
                  dashboardStats.lowStockProducts.map((product: any, index: number) => (
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
