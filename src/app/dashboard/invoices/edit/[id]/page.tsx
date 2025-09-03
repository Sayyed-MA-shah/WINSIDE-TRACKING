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

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('draft');
  const [dueDate, setDueDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Fetch invoice, customers, and products data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data in parallel
        const [invoiceRes, customersRes, productsRes] = await Promise.all([
          fetch(`/api/invoices/${invoiceId}`),
          fetch('/api/customers'),
          fetch('/api/products')
        ]);
        
        if (!invoiceRes.ok) {
          console.error('Failed to fetch invoice');
          return;
        }
        
        const [invoiceData, customersData, productsData] = await Promise.all([
          invoiceRes.json(),
          customersRes.json(),
          productsRes.json()
        ]);
        
        setInvoice(invoiceData);
        setCustomers(customersData);
        setProducts(productsData);
        setSelectedCustomer(invoiceData.customer || null);
        setSelectedStatus(invoiceData.status);
        setDueDate(new Date(invoiceData.dueDate).toISOString().split('T')[0]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [invoiceId]);

  const handleSaveInvoice = async () => {
    if (!invoice) return;
    
    try {
      setSaving(true);
      
      const updateData = {
        customerId: selectedCustomer?.id,
        status: selectedStatus,
        dueDate: new Date(dueDate).toISOString(),
        items: invoice.items,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        total: invoice.total
      };
      
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update invoice');
      }
      
      const updatedInvoice = await response.json();
      console.log('Invoice updated successfully:', updatedInvoice);
      
      // Navigate back to invoices list
      router.push('/dashboard/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice. Please try again.');
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Loading invoice...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
          <Button 
            onClick={handleSaveInvoice} 
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
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
                    const customer = customers.find(c => c.id === value);
                    setSelectedCustomer(customer || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
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
                  const product = products.find(p => p.id === item.productId);
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
                <span>Discount:</span>
                <span>-£{(invoice.discount || 0).toFixed(2)}</span>
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
