'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  ArrowLeft,
  Heart,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useInsoleAuth } from '@/lib/context/insole-auth';
import { insoleDb } from '@/lib/db/insole-db';

export default function InsoleCustomers() {
  const router = useRouter();
  const { user } = useInsoleAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/dashboard');
      return;
    }
    fetchCustomers();
  }, [user, router]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const customersData = await insoleDb.getCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching insole customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      // Note: Delete functionality not implemented yet in insole-db
      alert('Delete functionality will be implemented soon.');
      // await insoleDb.deleteCustomer(customerId);
      // await fetchCustomers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer. They may have associated invoices.');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
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
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Customers</h1>
              </div>
            </div>
            <Button onClick={() => router.push('/dashboard/insole/customers/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="outline">
                {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        {loading ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No customers found' : 'No customers yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms.'
                  : 'Get started by adding your first customer.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/dashboard/insole/customers/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Customer
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Customer since {new Date(customer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/insole/customers/${customer.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Email */}
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400 truncate">{customer.email}</span>
                      </div>
                    )}

                    {/* Phone */}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{customer.phone}</span>
                      </div>
                    )}

                    {/* Address */}
                    {customer.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400 line-clamp-2">{customer.address}</span>
                      </div>
                    )}

                    {/* Notes */}
                    {customer.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-3">
                          <span className="font-medium">Notes:</span> {customer.notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/dashboard/insole/invoices/new?customer=${customer.id}`)}
                      >
                        Create Invoice
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/insole/customers/${customer.id}`)}
                      >
                        View Details
                      </Button>
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