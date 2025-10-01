'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  FileText,
  Warehouse,
  LogOut
} from 'lucide-react';
import { useProducts } from '@/lib/stores/productStore';
import { HaricanLayout } from '@/components/harican/HaricanLayout';
import { useHaricanAuth } from '@/lib/context/harican-auth';

export default function HaricanDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useHaricanAuth();
  const { products } = useProducts();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/harican-auth');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
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

  // Filter data for Harican brand only
  const haricanProducts = products.filter(product => product.brand === 'harican');

  // Calculate Harican-specific metrics
  const totalProducts = haricanProducts.length;
  const totalStock = haricanProducts.reduce((total, product) => {
    return total + (product.variants?.reduce((sum, variant) => sum + variant.qty, 0) || 0);
  }, 0);
  
  const lowStockProducts = haricanProducts.filter(product => {
    const totalQty = product.variants?.reduce((sum, variant) => sum + variant.qty, 0) || 0;
    return totalQty < 10;
  });

  const stockValue = haricanProducts.reduce((total, product) => {
    const productStock = product.variants?.reduce((sum, variant) => sum + variant.qty, 0) || 0;
    return total + (productStock * (product.costAfter || 0));
  }, 0);

  const productsWithImages = haricanProducts.filter(product => product.mediaMain && product.mediaMain.trim());

  return (
    <HaricanLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Complete inventory and sales management for Harican brand
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Harican products in inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock}</div>
              <p className="text-xs text-muted-foreground">
                Units in stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{stockValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Wholesale value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
              <p className="text-xs text-muted-foreground">
                Items need restocking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products with Images</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productsWithImages.length}</div>
              <p className="text-xs text-muted-foreground">
                Ready for catalogs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...new Set(haricanProducts.map(p => p.category))].length}
              </div>
              <p className="text-xs text-muted-foreground">
                Product categories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Harican Products</h3>
                  <p className="text-sm text-muted-foreground">Manage inventory</p>
                </div>
              </div>
              <Button 
                className="w-full mt-4" 
                onClick={() => window.location.href = '/dashboard/harican/products'}
              >
                View Products
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Warehouse className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold">Stock Management</h3>
                  <p className="text-sm text-muted-foreground">Track stock levels</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => window.location.href = '/dashboard/harican/stock'}
              >
                Manage Stock
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <FileText className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold">Price Lists</h3>
                  <p className="text-sm text-muted-foreground">Generate catalogs</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => window.location.href = '/dashboard/harican/price-list'}
              >
                Create Price List
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <h3 className="font-semibold">Reports</h3>
                  <p className="text-sm text-muted-foreground">Analytics & insights</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => window.location.href = '/dashboard/harican/reports'}
              >
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-orange-700">
                  {lowStockProducts.length} Harican products are running low on stock:
                </p>
                <div className="flex flex-wrap gap-2">
                  {lowStockProducts.slice(0, 5).map(product => (
                    <Badge key={product.id} variant="outline" className="text-orange-700 border-orange-300">
                      {product.article} ({product.variants?.reduce((sum, v) => sum + v.qty, 0) || 0} left)
                    </Badge>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <Badge variant="outline" className="text-orange-700 border-orange-300">
                      +{lowStockProducts.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </HaricanLayout>
  );
}