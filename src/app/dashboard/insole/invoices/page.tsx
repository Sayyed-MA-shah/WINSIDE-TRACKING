'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Eye,
  ArrowLeft,
  Heart,
  Download,
  Calendar,
  User,
  DollarSign
} from 'lucide-react';
import { useInsoleAuth } from '@/lib/context/insole-auth';
import { insoleDb } from '@/lib/db/insole-db';

export default function InsoleInvoices() {
  const router = useRouter();
  const { user } = useInsoleAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/dashboard');
      return;
    }
    fetchInvoices();
  }, [user, router]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const invoicesData = await insoleDb.getInvoices();
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching insole invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/insole')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Invoices</h1>
              </div>
            </div>
            <Button onClick={() => router.push('/dashboard/insole/invoices/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by invoice number, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredInvoices.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Invoices
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  £{filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Value
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        {loading ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No invoices found' : 'No invoices yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms.'
                  : 'Get started by creating your first invoice.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/dashboard/insole/invoices/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Invoice
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Invoice #{invoice.invoice_number}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{invoice.customer_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium">£{invoice.total?.toFixed(2) || '0.00'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {invoice.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-1">
                          Note: {invoice.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(invoice.status)}
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/insole/invoices/${invoice.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/insole/invoices/${invoice.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // PDF download functionality would go here
                            alert('PDF download functionality will be implemented soon');
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Invoice breakdown */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="ml-2 font-medium">£{invoice.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                        <span className="ml-2 font-medium">£{invoice.tax?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total:</span>
                        <span className="ml-2 font-bold text-lg">£{invoice.total?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}