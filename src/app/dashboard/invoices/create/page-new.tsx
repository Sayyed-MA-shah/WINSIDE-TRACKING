'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getNextInvoiceNumber, previewNextInvoiceNumber } from '@/lib/utils/invoice-numbering';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ArrowLeft, User, Package, Calculator, DollarSign, Printer, Trash2, X, Save, Plus } from 'lucide-react';
import { Customer, Product, Variant } from '@/lib/types';
import { useProducts } from '@/lib/stores/productStore';
import { SuppressHydrationWarning } from '@/components/SuppressHydrationWarning';

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

export default function CreateInvoicePage() {
  const router = useRouter();
  const { products } = useProducts();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<{ productId: string; variantId?: string; quantity: number; unitPrice: number; }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [taxRate, setTaxRate] = useState(0);

  // Filter customers based on search term
  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone.includes(customerSearchTerm) ||
    (customer.company && customer.company.toLowerCase().includes(customerSearchTerm.toLowerCase()))
  );

  // Filter products only when searching
  const filteredProducts = productSearchTerm.trim() ? products.filter(product =>
    product.title.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearchTerm.toLowerCase())
  ) : [];

  // Get price based on customer type
  const getPriceForCustomer = (product: Product, variant?: Variant) => {
    if (!selectedCustomer) return product.retail;
    
    const basePrice = variant ? (
      selectedCustomer.type === 'wholesale' ? variant.wholesale || product.wholesale :
      selectedCustomer.type === 'club' ? variant.club || product.club :
      variant.retail || product.retail
    ) : (
      selectedCustomer.type === 'wholesale' ? product.wholesale :
      selectedCustomer.type === 'club' ? product.club :
      product.retail
    );
    
    return basePrice;
  };

  // Add product to invoice
  const addProductToInvoice = (product: Product, variant?: Variant) => {
    const unitPrice = getPriceForCustomer(product, variant);
    const newItem = {
      productId: product.id,
      variantId: variant?.id,
      quantity: 1,
      unitPrice: unitPrice
    };
    
    setInvoiceItems([...invoiceItems, newItem]);
  };

  // Remove item from invoice
  const removeItemFromInvoice = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  // Update item quantity
  const updateItemQuantity = (index: number, quantity: number) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index].quantity = Math.max(1, quantity);
    setInvoiceItems(updatedItems);
  };

  // Calculate totals
  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discount / 100) 
    : discount;
  const taxAmount = ((subtotal - discountAmount) * taxRate / 100);
  const grandTotal = subtotal - discountAmount + taxAmount;

  // Save invoice
  const saveInvoice = () => {
    if (!selectedCustomer || invoiceItems.length === 0) {
      alert('Please select a customer and add at least one product.');
      return;
    }

    // In a real app, this would save to database
    console.log('Saving invoice:', {
      customer: selectedCustomer,
      items: invoiceItems,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: grandTotal
    });

    alert('Invoice saved successfully!');
    router.push('/dashboard/invoices');
  };

  // Generate PDF (simplified for now)
  const generatePDF = () => {
    if (!selectedCustomer || invoiceItems.length === 0) {
      alert('Please complete the invoice before generating PDF.');
      return;
    }
    alert('PDF generation feature coming soon!');
  };

  return (
    <DashboardLayout>
      <SuppressHydrationWarning>
        <div className="h-full flex flex-col space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/invoices')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Invoice</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Next invoice: {previewNextInvoiceNumber()}</p>
              </div>
            </div>
          </div>

          {/* Three Section Layout */}
          <div className="flex-1 flex gap-6">
            {/* Section 1: Customer Selection (20%) */}
            <div className="w-1/5">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search customers..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Selected Customer Display */}
                  {selectedCustomer && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="space-y-1">
                        <div className="font-medium dark:text-white">{selectedCustomer.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{selectedCustomer.phone}</div>
                        {selectedCustomer.company && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">{selectedCustomer.company}</div>
                        )}
                        <Badge variant="outline" className="mt-1">
                          {selectedCustomer.type}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCustomer(null)}
                        className="mt-2"
                      >
                        Change
                      </Button>
                    </div>
                  )}

                  {/* Customer Search Results - Only show when searching */}
                  {customerSearchTerm && filteredCustomers.length > 0 && !selectedCustomer && (
                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="p-3 border rounded-lg cursor-pointer transition-colors border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerSearchTerm('');
                          }}
                        >
                          <div className="font-medium dark:text-white">{customer.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{customer.phone}</div>
                          {customer.company && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">{customer.company}</div>
                          )}
                          <Badge variant="outline" className="mt-1">
                            {customer.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {customerSearchTerm && filteredCustomers.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No customers found
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Section 2: Product Addition (60%) */}
            <div className="w-3/5">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Products & Invoice Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 h-full flex flex-col">
                  {/* Product Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={productSearchTerm}
                      onChange={(e) => {
                        setProductSearchTerm(e.target.value);
                        setShowProductSearch(e.target.value.trim().length > 0);
                      }}
                      className="pl-10"
                    />
                  </div>

                  {/* Product Search Results with Dark Theme */}
                  {showProductSearch && filteredProducts.length > 0 && (
                    <div className="max-h-60 overflow-y-auto border rounded-lg bg-white dark:bg-gray-800 shadow-lg">
                      {filteredProducts.map((product) => (
                        <div key={product.id} className="border-b last:border-b-0 dark:border-gray-700">
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium dark:text-white">{product.title}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{product.article}</div>
                                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">{product.category}</Badge>
                              </div>
                              {product.variants.length === 0 && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    addProductToInvoice(product);
                                    setProductSearchTerm('');
                                    setShowProductSearch(false);
                                  }}
                                  disabled={!selectedCustomer}
                                  className="dark:bg-blue-600 dark:hover:bg-blue-700"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add
                                </Button>
                              )}
                            </div>
                            
                            {/* Variants with Dark Theme */}
                            {product.variants.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {product.variants.map((variant) => (
                                  <div key={variant.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                    <div>
                                      <div className="text-sm font-medium dark:text-white">{variant.sku}</div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400">
                                        {Object.entries(variant.attributes).map(([key, value]) => 
                                          `${key}: ${value}`
                                        ).join(', ')}
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        addProductToInvoice(product, variant);
                                        setProductSearchTerm('');
                                        setShowProductSearch(false);
                                      }}
                                      disabled={!selectedCustomer}
                                      className="dark:bg-blue-600 dark:hover:bg-blue-700"
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Add
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showProductSearch && filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 border rounded-lg dark:border-gray-700">
                      No products found
                    </div>
                  )}

                  {/* Invoice Items Table */}
                  <div className="flex-1 overflow-y-auto">
                    {invoiceItems.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="dark:border-gray-700">
                            <TableHead className="dark:text-gray-300">Product</TableHead>
                            <TableHead className="dark:text-gray-300">Quantity</TableHead>
                            <TableHead className="dark:text-gray-300">Unit Price</TableHead>
                            <TableHead className="dark:text-gray-300">Total</TableHead>
                            <TableHead className="w-[50px] dark:text-gray-300"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoiceItems.map((item, index) => {
                            const product = products.find(p => p.id === item.productId);
                            const variant = product?.variants.find(v => v.id === item.variantId);
                            return (
                              <TableRow key={index} className="dark:border-gray-700">
                                <TableCell>
                                  <div>
                                    <div className="font-medium dark:text-white">{product?.title}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{product?.article}</div>
                                    {variant && (
                                      <div className="text-xs text-gray-500 dark:text-gray-500">
                                        {Object.entries(variant.attributes).map(([key, value]) => 
                                          `${key}: ${value}`
                                        ).join(', ')}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                    className="w-20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  />
                                </TableCell>
                                <TableCell className="dark:text-gray-300">£{item.unitPrice.toFixed(2)}</TableCell>
                                <TableCell className="font-medium dark:text-white">
                                  £{(item.quantity * item.unitPrice).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItemFromInvoice(index)}
                                    className="dark:hover:bg-gray-700 dark:text-gray-400"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No items added yet</p>
                        <p className="text-sm">Search for products above to add them</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section 3: Invoice Settings (20%) */}
            <div className="w-1/5">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Invoice Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Settings */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount" className="dark:text-gray-300">Discount</Label>
                      <div className="flex gap-2">
                        <Input
                          id="discount"
                          type="number"
                          min="0"
                          value={discount}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                          <SelectTrigger className="w-20 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                            <SelectItem value="percentage" className="dark:text-white dark:hover:bg-gray-700">%</SelectItem>
                            <SelectItem value="fixed" className="dark:text-white dark:hover:bg-gray-700">£</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tax-rate" className="dark:text-gray-300">Tax Rate (%)</Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={taxRate}
                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 border-t pt-4 dark:border-gray-700">
                    <div className="flex justify-between dark:text-gray-300">
                      <span>Subtotal:</span>
                      <span>£{subtotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-red-600 dark:text-red-400">
                        <span>Discount:</span>
                        <span>-£{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {taxAmount > 0 && (
                      <div className="flex justify-between dark:text-gray-300">
                        <span>Tax ({taxRate}%):</span>
                        <span>£{taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-3 dark:border-gray-700 dark:text-white">
                      <span>Total:</span>
                      <span>£{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      className="w-full dark:bg-blue-600 dark:hover:bg-blue-700" 
                      onClick={saveInvoice}
                      disabled={!selectedCustomer || invoiceItems.length === 0}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Invoice
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" 
                      onClick={generatePDF}
                      disabled={!selectedCustomer || invoiceItems.length === 0}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SuppressHydrationWarning>
    </DashboardLayout>
  );
}
