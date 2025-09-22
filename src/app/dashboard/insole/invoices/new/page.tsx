'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  Save,
  Heart,
  Plus,
  Minus,
  User,
  Package,
  Trash2
} from 'lucide-react';
import { useInsoleAuth } from '@/lib/context/insole-auth';
import { insoleDb } from '@/lib/db/insole-db';

interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export default function NewInsoleInvoice() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useInsoleAuth();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Pre-selected customer from URL params
  const preSelectedCustomer = searchParams.get('customer');

  useEffect(() => {
    if (!user) {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [user, router]);

  useEffect(() => {
    if (preSelectedCustomer && customers.length > 0) {
      setSelectedCustomer(preSelectedCustomer);
    }
  }, [preSelectedCustomer, customers]);

  const fetchData = async () => {
    try {
      const [customersData, productsData] = await Promise.all([
        insoleDb.getCustomers(),
        insoleDb.getProducts()
      ]);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      quantity: 1,
      price: 0,
      total: 0
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const removeInvoiceItem = (itemId: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== itemId));
  };

  const updateInvoiceItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // If product is selected, update name and price
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.productName = product.name;
            updatedItem.price = product.price || 0;
            updatedItem.total = updatedItem.quantity * updatedItem.price;
          }
        }
        
        // Recalculate total when quantity or price changes
        if (field === 'quantity' || field === 'price') {
          updatedItem.total = updatedItem.quantity * updatedItem.price;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.2; // 20% VAT
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedCustomer) {
      newErrors.customer = 'Please select a customer';
    }

    if (invoiceItems.length === 0) {
      newErrors.items = 'Please add at least one item';
    }

    // Validate each item
    invoiceItems.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`item_${index}_product`] = 'Please select a product';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      const customer = customers.find(c => c.id === selectedCustomer);
      const subtotal = calculateSubtotal();
      const tax = calculateTax(subtotal);
      const total = calculateTotal();

      const invoiceData = {
        invoice_number: `INV-${Date.now()}`,
        customer_id: selectedCustomer,
        customer_name: customer?.name || '',
        date: new Date().toISOString(),
        subtotal,
        discount: 0,
        tax,
        total,
        status: 'pending' as const,
        payment_status: 'unpaid' as const,
        notes: notes.trim() || undefined,
        items: invoiceItems.map(item => ({
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }))
      };

      await insoleDb.addInvoice(invoiceData);
      router.push('/dashboard/insole/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/insole/invoices')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create New Invoice</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="customer">Select Customer *</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className={errors.customer ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.email && `(${customer.email})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customer && (
                  <p className="text-sm text-red-600">{errors.customer}</p>
                )}
                {customers.length === 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No customers found. <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => router.push('/dashboard/insole/customers/new')}>Add a customer first</Button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Invoice Items
                </CardTitle>
                <Button type="button" onClick={addInvoiceItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {invoiceItems.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No items added yet</p>
                  <Button type="button" onClick={addInvoiceItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoiceItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                      <div className="md:col-span-2">
                        <Label>Product *</Label>
                        <Select 
                          value={item.productId} 
                          onValueChange={(value) => updateInvoiceItem(item.id, 'productId', value)}
                        >
                          <SelectTrigger className={errors[`item_${index}_product`] ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - £{product.price?.toFixed(2) || '0.00'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`item_${index}_product`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`item_${index}_product`]}</p>
                        )}
                      </div>

                      <div>
                        <Label>Quantity *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className={errors[`item_${index}_quantity`] ? 'border-red-500' : ''}
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`item_${index}_quantity`]}</p>
                        )}
                      </div>

                      <div>
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price}
                          onChange={(e) => updateInvoiceItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <Label>Total</Label>
                        <div className="flex items-center h-10 px-3 bg-gray-50 dark:bg-gray-800 border rounded-md">
                          £{item.total.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInvoiceItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.items && (
                <p className="text-sm text-red-600 mt-2">{errors.items}</p>
              )}
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          {invoiceItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (20%):</span>
                    <span>£{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or notes for this invoice..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/insole/invoices')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || invoiceItems.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}