'use client';

import { useState, useEffect } from 'react';
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
import { Brand, Invoice, Customer, Product } from '@/lib/types';

const brandDisplayNames: Record<Brand, string> = {
  greenhil: 'Green Hill',
  harican: 'Harican',
  byko: 'Byko'
};

interface DashboardStats {
  totalRevenue: number;
  totalInvoices: number;
  totalCustomers: number;
  pendingInvoices: number;
  retailRevenue: number;
  wholesaleRevenue: number;
  clubRevenue: number;
  recentInvoices: Invoice[];
  lowStockProducts: Product[];
  // Brand-specific potential revenue
  potentialRetailRevenue: number;
  potentialWholesaleRevenue: number;
  potentialClubRevenue: number;
  brandProducts: number;
  brandStockValue: number;
}

export default function DashboardPage() {
  const [selectedBrand, setSelectedBrand] = useState<Brand>('greenhil');
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalInvoices: 0,
    totalCustomers: 0,
    pendingInvoices: 0,
    retailRevenue: 0,
    wholesaleRevenue: 0,
    clubRevenue: 0,
    recentInvoices: [],
    lowStockProducts: [],
    potentialRetailRevenue: 0,
    potentialWholesaleRevenue: 0,
    potentialClubRevenue: 0,
    brandProducts: 0,
    brandStockValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedBrand]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [invoicesRes, customersRes, productsRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/customers'),
        fetch('/api/products')
      ]);

      const invoices: Invoice[] = invoicesRes.ok ? await invoicesRes.json() : [];
      const customers: Customer[] = customersRes.ok ? await customersRes.json() : [];
      const products: Product[] = productsRes.ok ? await productsRes.json() : [];

      // Debug logging
      console.log('Dashboard Data Fetched:', {
        invoicesCount: invoices.length,
        customersCount: customers.length,
        productsCount: products.length,
        selectedBrand,
        brandsInProducts: [...new Set(products.map(p => p.brand))]
      });

      // Calculate real stats from actual data
      const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalInvoices = invoices.length;
      const totalCustomers = customers.length;
      const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;

      // Calculate revenue by customer type
      const retailRevenue = invoices
        .filter(inv => inv.customer?.type === 'retail')
        .reduce((sum, inv) => sum + inv.total, 0);
      
      const wholesaleRevenue = invoices
        .filter(inv => inv.customer?.type === 'wholesale')
        .reduce((sum, inv) => sum + inv.total, 0);
      
      const clubRevenue = invoices
        .filter(inv => inv.customer?.type === 'club')
        .reduce((sum, inv) => sum + inv.total, 0);

      // Get recent invoices (last 5)
      const recentInvoices = invoices
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      // Get low stock products - for now we'll calculate from variants
      const lowStockProducts = products.filter(product => {
        const totalStock = product.variants?.reduce((sum, variant) => sum + variant.qty, 0) || 0;
        return totalStock < 10;
      });

      // Calculate brand-specific data
      const brandProducts = products.filter(product => product.brand === selectedBrand);
      const brandProductsCount = brandProducts.length;
      
      console.log('Brand Data:', {
        selectedBrand,
        totalProducts: products.length,
        brandProducts: brandProductsCount,
        brandProductTitles: brandProducts.map(p => p.title)
      });
      
      // Calculate potential revenue for selected brand
      let potentialRetailRevenue = 0;
      let potentialWholesaleRevenue = 0;
      let potentialClubRevenue = 0;
      let brandStockValue = 0;

      brandProducts.forEach(product => {
        const totalStock = product.variants?.reduce((sum, variant) => sum + variant.qty, 0) || 0;
        potentialRetailRevenue += (product.retail - product.costAfter) * totalStock;
        potentialWholesaleRevenue += (product.wholesale - product.costAfter) * totalStock;
        potentialClubRevenue += (product.club - product.costAfter) * totalStock;
        brandStockValue += product.costAfter * totalStock;
      });

      setStats({
        totalRevenue,
        totalInvoices,
        totalCustomers,
        pendingInvoices,
        retailRevenue,
        wholesaleRevenue,
        clubRevenue,
        recentInvoices,
        lowStockProducts,
        potentialRetailRevenue,
        potentialWholesaleRevenue,
        potentialClubRevenue,
        brandProducts: brandProductsCount,
        brandStockValue
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'partial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default: 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">WINSIDE Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete business insights and performance metrics at your fingertips
            </p>
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

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-300">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">£{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From {stats.totalInvoices} invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-300">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Active customer base</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-300">Pending Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{stats.pendingInvoices}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-300">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{stats.lowStockProducts.length}</div>
              <p className="text-xs text-muted-foreground">Items below 10 units</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Customer Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-300">Retail Revenue</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">£{stats.retailRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From retail customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-300">Wholesale Revenue</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">£{stats.wholesaleRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From wholesale customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-gray-300">Club Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">£{stats.clubRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From club customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Brand-Specific Potential Revenue */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {brandDisplayNames[selectedBrand]} - Revenue Potential
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">Retail Revenue Potential</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">£{stats.potentialRetailRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Potential profit from current stock</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">Wholesale Revenue Potential</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">£{stats.potentialWholesaleRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Potential profit from current stock</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">Club Revenue Potential</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">£{stats.potentialClubRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Potential profit from current stock</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity and Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentInvoices.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No invoices yet</p>
                ) : (
                  stats.recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium dark:text-white">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{invoice.customer?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium dark:text-white">£{invoice.total.toFixed(2)}</p>
                        <Badge className={getStatusBadge(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.lowStockProducts.length === 0 ? (
                  <p className="text-green-600 dark:text-green-400 text-center py-4">All products are well stocked!</p>
                ) : (
                  stats.lowStockProducts.slice(0, 5).map((product) => {
                    const totalStock = product.variants?.reduce((sum, variant) => sum + variant.qty, 0) || 0;
                    return (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div>
                        <p className="font-medium dark:text-white">{product.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {brandDisplayNames[product.brand]}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600 dark:text-red-400">{totalStock} left</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">£{product.wholesale.toFixed(2)}</p>
                      </div>
                    </div>
                  )})
                )}
                {stats.lowStockProducts.length > 5 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    +{stats.lowStockProducts.length - 5} more items need restocking
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="dark:text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="w-full" onClick={() => window.location.href = '/dashboard/invoices/create'}>
                <FileText className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/dashboard/customers'}>
                <Users className="h-4 w-4 mr-2" />
                Manage Customers
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/dashboard/products'}>
                <Package className="h-4 w-4 mr-2" />
                Manage Products
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/dashboard/stock'}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Check Stock
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
