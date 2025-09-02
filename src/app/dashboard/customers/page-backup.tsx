'use client';

import { useState } from 'react';
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

// Mock data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    address: '123 Main St, New York, NY 10001',
    type: 'wholesale',
    createdAt: new Date('2024-01-15'),
    totalOrders: 12,
    totalSpent: 2450.75
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+1 (555) 987-6543',
    company: undefined, // No company (individual customer)
    address: '456 Oak Ave, Los Angeles, CA 90210',
    type: 'retail',
    createdAt: new Date('2024-01-10'),
    totalOrders: 8,
    totalSpent: 1890.50
  },
  {
    id: '3',
    name: 'Bob Johnson',
    phone: '+1 (555) 456-7890',
    company: 'Golden Gloves Boxing Club',
    address: '789 Pine Rd, Chicago, IL 60601',
    type: 'club',
    createdAt: new Date('2024-01-05'),
    totalOrders: 15,
    totalSpent: 3120.25
  },
  {
    id: '4',
    name: 'Alice Brown',
    phone: '+1 (555) 321-0987',
    company: 'FitPro Gym Chain',
    address: '321 Elm St, Miami, FL 33101',
    type: 'wholesale',
    createdAt: new Date('2024-01-20'),
    totalOrders: 5,
    totalSpent: 750.00
  },
];

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(() => mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerType, setSelectedCustomerType] = useState<'retail' | 'wholesale' | 'club'>('retail');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const avgOrderValue = totalRevenue / customers.reduce((sum, customer) => sum + customer.totalOrders, 0);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setSelectedCustomerType('retail');
    setIsDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setSelectedCustomerType(customer.type);
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers(customers.filter(c => c.id !== customerId));
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
                <h3>Personal Information</h3>
                <div class="info-row">
                  <span class="label">Name:</span>
                  <span class="value">${customer.name}</span>
                </div>
                <div class="info-row">
                  <span class="label">Phone:</span>
                  <span class="value">${customer.phone}</span>
                </div>
                <div class="info-row">
                  <span class="label">Customer Type:</span>
                  <span class="value">
                    <span class="badge badge-${customer.type}">
                      ${customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
                    </span>
                  </span>
                </div>
                <div class="info-row">
                  <span class="label">Member Since:</span>
                  <span class="value">${customer.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
              <div class="info-section">
                <h3>Business Information</h3>
                <div class="info-row">
                  <span class="label">Company:</span>
                  <span class="value">${customer.company || 'Individual Customer'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Address:</span>
                  <span class="value">${customer.address}</span>
                </div>
                <div class="info-row">
                  <span class="label">Total Orders:</span>
                  <span class="value">${customer.totalOrders}</span>
                </div>
                <div class="info-row">
                  <span class="label">Total Spent:</span>
                  <span class="value">£${customer.totalSpent.toFixed(2)}</span>
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

  const handleSaveCustomer = (formData: FormData) => {
    const customerData = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string || undefined,
      address: formData.get('address') as string,
      type: selectedCustomerType,
    };

    if (editingCustomer) {
      // Update existing customer
      setCustomers(customers.map(c => 
        c.id === editingCustomer.id 
          ? { ...c, ...customerData }
          : c
      ));
    } else {
      // Add new customer
      const newCustomer: Customer = {
        id: generateId('customer'),
        ...customerData,
        createdAt: new Date(),
        totalOrders: 0,
        totalSpent: 0,
      };
      setCustomers([...customers, newCustomer]);
    }
    
    setIsDialogOpen(false);
    setEditingCustomer(null);
    setSelectedCustomerType('retail');
  };

  return (
    <DashboardLayout>
      <SuppressHydrationWarning>
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Customer Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your customer database and track customer relationships
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddCustomer} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add New Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-xl font-semibold">
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {editingCustomer 
                    ? 'Update customer information below' 
                    : 'Fill in the details to add a new customer to your database'
                  }
                </p>
              </DialogHeader>
              
              <form action={handleSaveCustomer} className="space-y-6 mt-6">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">Personal Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingCustomer?.name || ''}
                        placeholder="Enter customer's full name"
                        className="h-10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={editingCustomer?.phone || ''}
                        placeholder="+1 (555) 123-4567"
                        className="h-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Business Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">Business Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-sm font-medium">Company Name</Label>
                      <Input
                        id="company"
                        name="company"
                        defaultValue={editingCustomer?.company || ''}
                        placeholder="Leave empty for individual customers"
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">Optional - for business customers only</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-medium">Customer Type *</Label>
                      <Select value={selectedCustomerType} onValueChange={(value: 'retail' | 'wholesale' | 'club') => setSelectedCustomerType(value)}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select customer type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Retail Customer
                            </div>
                          </SelectItem>
                          <SelectItem value="wholesale">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Wholesale Customer
                            </div>
                          </SelectItem>
                          <SelectItem value="club">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              Club Member
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Address Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">Address Information</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">Complete Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={editingCustomer?.address || ''}
                      placeholder="123 Main Street, City, State, ZIP Code"
                      className="h-10"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Include street, city, state, and ZIP code</p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingCustomer(null);
                      setSelectedCustomerType('retail');
                    }} 
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="px-6">
                    {editingCustomer ? 'Update Customer' : 'Add Customer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Active customer accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From all customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{avgOrderValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Per order average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers by name, company, phone, address, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <button
                        onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left"
                      >
                        {customer.name}
                      </button>
                    </TableCell>
                    <TableCell>
                      {customer.company ? (
                        <div className="text-sm">{customer.company}</div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">Individual</div>
                      )}
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs truncate">
                        {customer.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          customer.type === 'wholesale' ? 'default' : 
                          customer.type === 'club' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{customer.totalOrders}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      £{customer.totalSpent.toFixed(2)}
                    </TableCell>
                    <TableCell>{customer.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
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
                          onClick={() => handleEditCustomer(customer)}
                          title="Edit Customer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          title="Delete Customer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </div>
      </SuppressHydrationWarning>
    </DashboardLayout>
  );
}
