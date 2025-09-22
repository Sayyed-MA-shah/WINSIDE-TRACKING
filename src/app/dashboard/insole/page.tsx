'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Package, 
  Users, 
  FileText, 
  DollarSign, 
  AlertTriangle,
  Heart,
  LogOut,
  Plus,
  Settings
} from 'lucide-react';
import { useInsoleAuth } from '@/lib/context/insole-auth';
import { getInsoleDashboardStats } from '@/lib/db/insole-db';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeProvider } from '@/lib/context/theme-context';

interface InsoleStats {
  totalRevenue: number;
  totalInvoices: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  recentInvoices: any[];
}

export default function InsoleDashboard() {
  const router = useRouter();
  const { user, login, logout } = useInsoleAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', error: '' });
  const [stats, setStats] = useState<InsoleStats>({
    totalRevenue: 0,
    totalInvoices: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    recentInvoices: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setShowLoginDialog(true);
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginForm(prev => ({ ...prev, error: '' }));
    
    try {
      const success = await login(loginForm.username, loginForm.password);
      if (success) {
        setShowLoginDialog(false);
        setLoginForm({ username: '', password: '', error: '' });
      } else {
        setLoginForm(prev => ({ 
          ...prev, 
          error: 'Invalid username or password' 
        }));
      }
    } catch (error) {
      setLoginForm(prev => ({ 
        ...prev, 
        error: 'Login failed. Please try again.' 
      }));
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const stats = await getInsoleDashboardStats();

      setStats({
        totalRevenue: stats.totalRevenue,
        totalInvoices: stats.totalInvoices,
        totalCustomers: stats.totalCustomers,
        totalProducts: stats.totalProducts,
        lowStockProducts: stats.lowStockCount,
        recentInvoices: stats.recentInvoices || []
      });
    } catch (error) {
      console.error('Error fetching insole dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowLoginDialog(true);
  };

  // Show login dialog if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Dialog open={showLoginDialog} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                INSOLE CLINIC Access
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginForm.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {loginForm.error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Demo Credentials:</strong><br />
                  Username: <code>insole-admin</code><br />
                  Password: <code>insole123</code>
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Main Dashboard
                </Button>
                <Button type="submit">
                  Login to INSOLE CLINIC
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Loading INSOLE CLINIC...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">INSOLE CLINIC</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Inventory Management System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.display_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.username}</p>
              </div>
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/insole/settings')}>
                <Settings className="h-4 w-4" />
                <span className="ml-2 hidden md:inline">Settings</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="ml-2 hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button 
              onClick={() => router.push('/dashboard/insole/products/new')}
              className="h-12 justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/insole/customers/new')}
              variant="outline"
              className="h-12 justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/insole/invoices/new')}
              variant="outline"
              className="h-12 justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From {stats.totalInvoices} invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => router.push('/dashboard/insole/products')}
                >
                  View all products
                </Button>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => router.push('/dashboard/insole/customers')}
                >
                  View all customers
                </Button>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lowStockProducts}</div>
              <p className="text-xs text-muted-foreground">Items below 10 units</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Products</span>
                <Button
                  size="sm"
                  onClick={() => router.push('/dashboard/insole/products')}
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Manage your insole products, pricing, and inventory levels.
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/insole/products')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Product Catalog
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/insole/products/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customers Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Customers</span>
                <Button
                  size="sm"
                  onClick={() => router.push('/dashboard/insole/customers')}
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Manage customer information and track their purchase history.
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/insole/customers')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Customer Database
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/insole/customers/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Customer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Invoices</span>
                <Button
                  size="sm"
                  onClick={() => router.push('/dashboard/insole/invoices')}
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create invoices, track payments, and manage billing.
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/insole/invoices')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Invoice History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/insole/invoices/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        {stats.recentInvoices.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Invoice #{invoice.invoice_number}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {invoice.customer_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">£{invoice.total.toFixed(2)}</p>
                      <Badge 
                        variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </ThemeProvider>
  );
}