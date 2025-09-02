'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function MigrationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleMigration = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/migrate-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authorization: 'migrate-products-now' }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message || 'Migration completed successfully!' });
      } else {
        setResult({ success: false, message: data.error || 'Migration failed' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Failed to connect to migration API' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Database Migration</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Populate your Supabase database with sample products
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Product Migration
            </CardTitle>
            <CardDescription>
              This will populate your Supabase database with sample boxing equipment products.
              It will clear any existing products and add new sample data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result && (
              <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <h3 className="font-medium">What will be migrated:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Boxing Gloves Amok (BGA-1012) - 2 variants</li>
                <li>• Boxing Gloves ClassX (BGC-1011) - 2 variants</li>
                <li>• Complete pricing and inventory data</li>
                <li>• Product categories and brands</li>
              </ul>
            </div>

            <Button
              onClick={handleMigration}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Migrating Products...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Migrate Products to Database
                </>
              )}
            </Button>

            {result?.success && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Migration completed! You can now visit the{' '}
                  <a 
                    href="/dashboard/products" 
                    className="text-blue-600 hover:underline"
                  >
                    Products page
                  </a>{' '}
                  to see your migrated products.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
