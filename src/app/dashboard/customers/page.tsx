'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { generateId } from '@/lib/utils/ssr-safe';
import { SuppressHydrationWarning } from '@/components/SuppressHydrationWarning';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Users, DollarSign, ShoppingCart, Edit, Trash2, User, Building2, Phone, MapPin, Printer } from 'lucide-react';
import { Customer } from '@/lib/types';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerType, setSelectedCustomerType] = useState<'retail' | 'wholesale' | 'club'>('retail');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    address: '',
    type: 'retail' as 'retail' | 'wholesale' | 'club'
  });

  // Load customers from database
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      console.log('Fetching customers from database...');
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded customers:', data.length);
        setCustomers(data);
      } else {
        console.error('Failed to fetch customers');
        setCustomers([]); // Set empty array if API fails
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]); // Set empty array if there's an error
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.type || 'retail').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0);
  const totalOrders = customers.reduce((sum, customer) => sum + (customer.totalOrders || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setSelectedCustomerType('retail');
    setFormData({
      name: '',
      phone: '',
      company: '',
      address: '',
      type: 'retail'
    });
    setIsDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setSelectedCustomerType(customer.type || 'retail');
    setFormData({
      name: customer.name,
      phone: customer.phone,
      company: customer.company || '',
      address: customer.address,
      type: customer.type || 'retail'
    });
    setIsDialogOpen(true);
  };

  const handleSaveCustomer = async () => {
    setSaveError(null);
    try {
      const customerData = {
        ...formData,
        company: formData.company.trim() || undefined,
        type: selectedCustomerType
      };

      console.log('Attempting to save customer:', customerData);

      if (editingCustomer) {
        // Update existing customer
        console.log('Updating customer with ID:', editingCustomer.id);
        const response = await fetch(`/api/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });

        console.log('Update response status:', response.status);

        if (response.ok) {
          const updatedCustomer = await response.json();
          console.log('Updated customer:', updatedCustomer);
          // Update local state after successful database save
          const newCustomers = customers.map(c => c.id === editingCustomer.id ? updatedCustomer : c);
          setCustomers(newCustomers);
        } else {
          console.error('Failed to update customer in database');
          setSaveError('Failed to update customer. Please try again.');
          return;
        }
      } else {
        // Create new customer
        console.log('Creating new customer');
        const newCustomerData = {
          ...customerData,
          id: `CUST-${generateId()}` // Generate customer ID
        };
        
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCustomerData),
        });

        console.log('Create response status:', response.status);

        if (response.ok) {
          const newCustomer = await response.json();
          console.log('Created customer:', newCustomer);
          // Update local state after successful database save
          const newCustomers = [...customers, newCustomer];
          setCustomers(newCustomers);
        } else {
          console.error('Failed to create customer in database');
          setSaveError('Failed to create customer. Please try again.');
          return;
        }
      }

      setIsDialogOpen(false);
      setEditingCustomer(null);
      setSaveError(null);
      setFormData({
        name: '',
        phone: '',
        company: '',
        address: '',
        type: 'retail'
      });
    } catch (error) {
      console.error('Error saving customer:', error);
      setSaveError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/customers/${customerId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          console.log('Customer deleted from database successfully');
          // Update local state after successful database deletion
          const newCustomers = customers.filter(c => c.id !== customerId);
          setCustomers(newCustomers);
        } else {
          console.error('Failed to delete customer from database');
          alert('Failed to delete customer. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Network error. Please check your connection and try again.');
      }
    }
  };

  const handlePrintCustomer = (customer: Customer) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Customer Details - ${customer.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
              .customer-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
              .info-section { padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
              .info-section h3 { margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
              .info-row { margin-bottom: 10px; }
              .label { font-weight: bold; color: #666; }
              .value { margin-left: 10px; }
              .badge { display: inline-block; padding: 4px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
              .badge-retail { background-color: #f0f0f0; color: #333; }
              .badge-wholesale { background-color: #e7f5e7; color: #2d5a2d; }
              .badge-club { background-color: #f0e7f5; color: #5a2d5a; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Customer Details</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="customer-info">
              <div class="info-section">
                <h3>Contact Information</h3>
                <div class="info-row">
                  <span class="label">Name:</span>
                  <span class="value">${customer.name}</span>
                </div>
                <div class="info-row">
                  <span class="label">Phone:</span>
                  <span class="value">${customer.phone}</span>
                </div>
                ${customer.company ? `
                <div class="info-row">
                  <span class="label">Company:</span>
                  <span class="value">${customer.company}</span>
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="label">Address:</span>
                  <span class="value">${customer.address}</span>
                </div>
              </div>
              <div class="info-section">
                <h3>Customer Details</h3>
                <div class="info-row">
                  <span class="label">Type:</span>
                  <span class="value">
                    <span class="badge badge-${customer.type || 'retail'}">${(customer.type || 'retail').charAt(0).toUpperCase() + (customer.type || 'retail').slice(1)}</span>
                  </span>
                </div>
                <div class="info-row">
                  <span class="label">Customer Since:</span>
                  <span class="value">${customer.createdAt.toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                  <span class="label">Total Orders:</span>
                  <span class="value">${customer.totalOrders || 0}</span>
                </div>
                <div class="info-row">
                  <span class="label">Total Spent:</span>
                  <span class="value">£${(customer.totalSpent || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getCustomerTypeBadge = (type: string) => {
    switch (type) {
      case 'retail':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      case 'wholesale':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'club':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
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
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading customers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SuppressHydrationWarning>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Customer Management</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your customer database with different pricing tiers
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddCustomer} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">
                    {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                  </DialogTitle>
                  <DialogDescription className="dark:text-gray-300">
                    {editingCustomer 
                      ? 'Update customer information and contact details.' 
                      : 'Enter customer information to create a new customer record.'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                {/* Error Display */}
                {saveError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p><strong>Save Error:</strong></p>
                    <p className="text-sm mt-1">{saveError}</p>
                    <button 
                      onClick={() => setSaveError(null)}
                      className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="dark:text-gray-300">Customer Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter customer name"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="dark:text-gray-300">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Enter phone number"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company" className="dark:text-gray-300">Company (Optional)</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      placeholder="Enter company name"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address" className="dark:text-gray-300">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Enter full address"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type" className="dark:text-gray-300">Customer Type</Label>
                    <Select value={selectedCustomerType} onValueChange={(value: 'retail' | 'wholesale' | 'club') => {
                      setSelectedCustomerType(value);
                      setFormData({...formData, type: value});
                    }}>
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select customer type" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                        <SelectItem value="retail" className="dark:text-white dark:hover:bg-gray-700">Retail</SelectItem>
                        <SelectItem value="wholesale" className="dark:text-white dark:hover:bg-gray-700">Wholesale</SelectItem>
                        <SelectItem value="club" className="dark:text-white dark:hover:bg-gray-700">Club</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveCustomer}>
                    {editingCustomer ? 'Update' : 'Create'} Customer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{totalCustomers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">£{totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{totalOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">Avg Order Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">£{avgOrderValue.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="dark:text-white">Customers</CardTitle>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-[300px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-gray-700">
                      <TableHead className="dark:text-gray-300">Customer</TableHead>
                      <TableHead className="dark:text-gray-300">Contact</TableHead>
                      <TableHead className="dark:text-gray-300">Type</TableHead>
                      <TableHead className="dark:text-gray-300">Orders</TableHead>
                      <TableHead className="dark:text-gray-300">Total Spent</TableHead>
                      <TableHead className="dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No customers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer.id} className="dark:border-gray-700">
                          <TableCell className="dark:text-gray-300">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {customer.company ? (
                                  <Building2 className="h-8 w-8 text-gray-400" />
                                ) : (
                                  <User className="h-8 w-8 text-gray-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium dark:text-white">{customer.name}</div>
                                {customer.company && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {customer.company}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{customer.phone}</span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{customer.address}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCustomerTypeBadge(customer.type || 'retail')}>
                              {(customer.type || 'retail').charAt(0).toUpperCase() + (customer.type || 'retail').slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="dark:text-gray-300">{customer.totalOrders || 0}</TableCell>
                          <TableCell className="dark:text-gray-300">£{(customer.totalSpent || 0).toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditCustomer(customer)}
                                title="Edit Customer"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handlePrintCustomer(customer)}
                                title="Print Customer Details"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteCustomer(customer.id)}
                                title="Delete Customer"
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SuppressHydrationWarning>
    </DashboardLayout>
  );
}
