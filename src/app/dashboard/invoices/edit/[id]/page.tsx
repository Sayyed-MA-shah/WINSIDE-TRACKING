'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';
import { Invoice, Customer, Product } from '@/lib/types';
import { SuppressHydrationWarning } from '@/components/SuppressHydrationWarning';

// Mock data (should match the data from the main invoices page)
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
    company: undefined,
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
    company: 'Club Elite',
    address: '789 Pine St, Chicago, IL 60601',
    type: 'club',
    createdAt: new Date('2024-01-05'),
    totalOrders: 15,
    totalSpent: 3250.00
  },
];

const mockProducts: Product[] = [
  {
    id: '1',
    article: 'BGC-1011',
    title: 'Boxing Gloves Classic',
    category: 'Gloves',
    brand: 'greenhil',
    taxable: true,
    attributes: ['Size', 'Color'],
    mediaMain: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    archived: false,
    wholesale: 55,
    retail: 79.99,
    club: 67.99,
    costBefore: 42,
    costAfter: 48,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    variants: []
  },
  {
    id: '2',
    article: 'TRK-2022',
    title: 'Training Shorts Premium',
    category: 'Apparel',
    brand: 'harican',
    taxable: true,
    attributes: ['Size', 'Color'],
    mediaMain: 'https://images.unsplash.com/photo-1506629905962-843c9e23b40c?w=400',
    archived: false,
    wholesale: 25,
    retail: 39.99,
    club: 32.99,
    costBefore: 18,
    costAfter: 22,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    variants: []
  }
];

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    customerId: '1',
    customer: mockCustomers[0],
    items: [
      { id: '1', productId: '1', quantity: 2, unitPrice: 55.00, total: 110.00 },
      { id: '2', productId: '2', quantity: 1, unitPrice: 25.00, total: 25.00 },
    ],
    subtotal: 135.00,
    tax: 0,
    total: 135.00,
    status: 'paid',
    dueDate: new Date('2024-02-15'),
    createdAt: new Date('2024-01-15'),
    paidAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    invoiceNumber: 'INV-002',
    customerId: '2',
    customer: mockCustomers[1],
    items: [
      { id: '3', productId: '1', quantity: 1, unitPrice: 79.99, total: 79.99 },
    ],
    subtotal: 79.99,
    tax: 0,
    total: 79.99,
    status: 'pending',
    dueDate: new Date('2024-02-20'),
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    invoiceNumber: 'INV-003',
    customerId: '3',
    customer: mockCustomers[2],
    items: [
      { id: '4', productId: '1', quantity: 1, unitPrice: 67.99, total: 67.99 },
      { id: '5', productId: '2', quantity: 2, unitPrice: 32.99, total: 65.98 },
    ],
    subtotal: 133.97,
    tax: 0,
    total: 133.97,
    status: 'overdue',
    dueDate: new Date('2024-01-10'),
    createdAt: new Date('2024-01-05'),
  },
];

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('draft');
  const [dueDate, setDueDate] = useState<string>('');
  
  useEffect(() => {
    // Find the invoice to edit
    const foundInvoice = mockInvoices.find(inv => inv.id === invoiceId);
    if (foundInvoice) {
      setInvoice(foundInvoice);
      setSelectedCustomer(foundInvoice.customer || null);
      setSelectedStatus(foundInvoice.status);
      setDueDate(foundInvoice.dueDate.toISOString().split('T')[0]);
    }
  }, [invoiceId]);

  const handleSaveInvoice = () => {
    if (!invoice) return;
    
    // Here you would typically save to your backend
    console.log('Saving invoice:', {
      ...invoice,
      customer: selectedCustomer,
      status: selectedStatus,
      dueDate: new Date(dueDate)
    });
    
    // Navigate back to invoices list
    router.push('/dashboard/invoices');
  };

  const removeItem = (itemId: string) => {
    if (!invoice) return;
    const updatedItems = invoice.items.filter(item => item.id !== itemId);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    setInvoice({
      ...invoice,
      items: updatedItems,
      subtotal,
      total: subtotal + invoice.tax
    });
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (!invoice) return;
    const updatedItems = invoice.items.map(item => {
      if (item.id === itemId) {
        const total = quantity * item.unitPrice;
        return { ...item, quantity, total };
      }
      return item;
    });
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    setInvoice({
      ...invoice,
      items: updatedItems,
      subtotal,
      total: subtotal + invoice.tax
    });
  };

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Invoice Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">The invoice you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/dashboard/invoices')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SuppressHydrationWarning>
        <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/invoices')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Invoice {invoice.invoiceNumber}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Modify invoice details and items
              </p>
            </div>
          </div>
          <Button onClick={handleSaveInvoice} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Invoice Number</Label>
                <Input 
                  id="invoice-number"
                  value={invoice.invoiceNumber}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input 
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select 
                  value={selectedCustomer?.id || ''} 
                  onValueChange={(value) => {
                    const customer = mockCustomers.find(c => c.id === value);
                    setSelectedCustomer(customer || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomer && (
                <div className="bg-gray-50 p-3 rounded space-y-1">
                  <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                  {selectedCustomer.company && (
                    <p><strong>Company:</strong> {selectedCustomer.company}</p>
                  )}
                  <p><strong>Address:</strong> {selectedCustomer.address}</p>
                  <Badge variant="outline">{selectedCustomer.type}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => {
                  const product = mockProducts.find(p => p.id === item.productId);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{product?.title || 'Product Not Found'}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>£{item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>£{item.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Invoice Totals */}
            <div className="mt-6 space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>£{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>£{invoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>£{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </SuppressHydrationWarning>
    </DashboardLayout>
  );
}
