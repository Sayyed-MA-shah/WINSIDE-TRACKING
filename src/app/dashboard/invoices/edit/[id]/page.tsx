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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Save, Trash2, Plus, Search, Printer } from 'lucide-react';
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
    const [selectedStatus, setSelectedStatus] = useState<'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled'>('draft');
  const [dueDate, setDueDate] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [poNumber, setPoNumber] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // New states for editing functionality
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');
  const [addQuantity, setAddQuantity] = useState<number>(1);
  const [editingPrices, setEditingPrices] = useState<{[key: string]: number}>({});
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [editingTax, setEditingTax] = useState(false);
  const [newDiscount, setNewDiscount] = useState(0);
  const [newTax, setNewTax] = useState(0);
  
  // Check if invoice is editable - allow editing if original invoice is draft, even if status is being changed to issued
  const isEditable = invoice?.status === 'draft';

  // Filter products based on search term
  const filteredProducts = productSearchTerm.trim() ? products.filter(product => {
    const searchTerm = productSearchTerm.toLowerCase();
    return (
      product.title.toLowerCase().includes(searchTerm) ||
      product.article.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.variants.some(variant => 
        variant.sku.toLowerCase().includes(searchTerm) ||
        Object.values(variant.attributes).some(attr => 
          attr.toString().toLowerCase().includes(searchTerm)
        )
      )
    );
  }) : products.slice(0, 20); // Show first 20 products when no search term
  
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
        
        // Ensure all invoice items have unique IDs
        const invoiceWithUniqueItems = {
          ...invoiceData,
          items: invoiceData.items.map((item: any, index: number) => ({
            ...item,
            id: item.id || `existing_item_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
          }))
        };
        
        setInvoice(invoiceWithUniqueItems);
        setCustomers(customersData);
        setProducts(productsData);
        setSelectedCustomer(invoiceData.customer || null);
        setSelectedStatus(invoiceData.status);
        setDueDate(new Date(invoiceData.dueDate).toISOString().split('T')[0]);
        setInvoiceNumber(invoiceData.invoiceNumber || '');
        setPoNumber(invoiceData.poNumber || '');
        
        // Debug loading
        console.log('Invoice loaded - PO Number:', invoiceData.poNumber);
        console.log('Full invoice data:', invoiceData);
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
        invoiceNumber: invoiceNumber,
        poNumber: poNumber, // Re-enabled PO number for editing
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
        const errorData = await response.json();
        if (errorData.details && errorData.details.includes('Insufficient stock')) {
          throw new Error(`Cannot issue invoice: ${errorData.details}`);
        }
        throw new Error('Failed to update invoice');
      }
      
      const updatedInvoice = await response.json();
      console.log('Invoice updated successfully:', updatedInvoice);
      
      // Update the local invoice state with the saved data
      setInvoice(updatedInvoice);
      
      // Show success message if invoice was sent (issued)
      if (selectedStatus === 'sent' && invoice?.status === 'draft') {
        alert('✅ Invoice issued successfully! Stock has been deducted.');
      }
      
      // Navigate back to invoices list
      router.push('/dashboard/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = async () => {
    if (!invoice || !selectedCustomer) {
      alert('Invoice data not available for PDF generation');
      return;
    }

    // Debug logging
    console.log('PDF Generation Debug:');
    console.log('invoice.poNumber:', invoice.poNumber);
    console.log('poNumber state:', poNumber);
    console.log('invoiceNumber state:', invoiceNumber);
    console.log('Full invoice object:', invoice);

    try {
      // Dynamic import of jsPDF
      const jsPDF = (await import('jspdf')).default;
      const { default: autoTable } = await import('jspdf-autotable');

      let logoData: string | null = null;
      try {
        const response = await fetch('/logo.png');
        const blob = await response.blob();
        logoData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.log('Logo loading failed:', error);
      }

      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Professional Colors
      const primaryColor = '#0F62FE';
      const darkGray = '#1A1D21';
      const lightGray = '#E9EDF2';
      const mediumGray = '#5C6270';

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      // COMPANY HEADER
      if (logoData) {
        doc.addImage(logoData, 'PNG', margin, 8, 20, 20);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(primaryColor);
      doc.text('BYKO SPORTS', logoData ? margin + 25 : margin, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(mediumGray);
      doc.text('Your Sports Equipment Partner', logoData ? margin + 25 : margin, 22);

      // INVOICE TITLE
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(darkGray);
      doc.text('INVOICE', pageWidth - 50, 16);

      // INVOICE METADATA
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(mediumGray);
      
      const metadataStartY = 22;
      const lineSpacing = 4;
      const metadataX = pageWidth - 70;
      
      // Labels
      doc.text('Invoice No:', metadataX, metadataStartY);
      doc.text('Issue Date:', metadataX, metadataStartY + lineSpacing);
      doc.text('Due Date:', metadataX, metadataStartY + (lineSpacing * 2));
      doc.text('PO Number:', metadataX, metadataStartY + (lineSpacing * 3));

      // Values
      doc.setFont('helvetica', 'normal');
      doc.text(invoiceNumber, metadataX + 25, metadataStartY);
      doc.text(invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }) : new Date().toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }), metadataX + 25, metadataStartY + lineSpacing);
      doc.text(new Date(dueDate).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }), metadataX + 25, metadataStartY + (lineSpacing * 2));
      
      // Use current state value for PO number (most up-to-date)
      const poNumberValue = poNumber || invoice.poNumber || 'N/A';
      console.log('Adding PO Number to PDF:', poNumberValue);
      
      doc.text(poNumberValue, metadataX + 25, metadataStartY + (lineSpacing * 3));

      // CLIENT INFORMATION
      const cardsY = 40;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(darkGray);
      doc.text('Bill To:', margin + 3, cardsY + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(darkGray);
      doc.text(selectedCustomer.name, margin + 3, cardsY + 11);
      if (selectedCustomer.company) {
        doc.text(selectedCustomer.company, margin + 3, cardsY + 15);
      }
      doc.text(selectedCustomer.phone, margin + 3, cardsY + 19);
      doc.text(selectedCustomer.address, margin + 3, cardsY + 23);

      // ITEMS TABLE
      const tableStartY = cardsY + 35;
      const tableColumns = [
        { header: 'Item Description', dataKey: 'description' },
        { header: 'Qty', dataKey: 'quantity' },
        { header: 'Unit Price', dataKey: 'unitPrice' },
        { header: 'Total', dataKey: 'total' }
      ];

      const tableData = invoice.items.map(item => ({
        description: `${item.productName || 'Product'} (${item.sku || 'N/A'})`,
        quantity: item.quantity.toString(),
        unitPrice: `£${item.unitPrice.toFixed(2)}`,
        total: `£${item.total.toFixed(2)}`
      }));

      autoTable(doc, {
        startY: tableStartY,
        columns: tableColumns,
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: '#ffffff',
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: darkGray
        },
        margin: { left: margin, right: margin }
      });

      // TOTALS
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      const totalsX = pageWidth - 60;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(darkGray);
      
      doc.text('Subtotal:', totalsX, finalY);
      doc.text(`£${invoice.subtotal.toFixed(2)}`, totalsX + 30, finalY);
      
      if (invoice.discount && invoice.discount > 0) {
        doc.text('Discount:', totalsX, finalY + 5);
        doc.text(`-£${invoice.discount.toFixed(2)}`, totalsX + 30, finalY + 5);
      }
      
      doc.text('Tax:', totalsX, finalY + 10);
      doc.text(`£${invoice.tax.toFixed(2)}`, totalsX + 30, finalY + 10);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Total:', totalsX, finalY + 18);
      doc.text(`£${invoice.total.toFixed(2)}`, totalsX + 30, finalY + 18);

      // FOOTER
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(mediumGray);
      doc.text('Thank you for your business!', margin, pageHeight - 20);
      doc.text('Terms: Payment due within 30 days', margin, pageHeight - 15);

      doc.save(`invoice-${invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
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
      total: subtotal + invoice.tax - (invoice.discount || 0)
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
      total: subtotal + invoice.tax - (invoice.discount || 0)
    });
  };

  const updateItemPrice = (itemId: string, unitPrice: number) => {
    if (!invoice) return;
    const updatedItems = invoice.items.map(item => {
      if (item.id === itemId) {
        const total = item.quantity * unitPrice;
        return { ...item, unitPrice, total };
      }
      return item;
    });
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    setInvoice({
      ...invoice,
      items: updatedItems,
      subtotal,
      total: subtotal + invoice.tax - (invoice.discount || 0)
    });
    
    // Clear the editing state for this item
    const newEditingPrices = { ...editingPrices };
    delete newEditingPrices[itemId];
    setEditingPrices(newEditingPrices);
  };

  const addProductToInvoice = (product: Product, variant?: any) => {
    if (!invoice) return;
    
    const newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate a unique ID for the invoice item
      productId: product.id,
      productName: product.title,
      sku: variant ? variant.sku : product.article, // Use variant SKU or product article
      quantity: addQuantity,
      unitPrice: variant ? product.retail : product.retail, // For now, use retail price
      total: addQuantity * product.retail
    };

    const updatedItems = [...invoice.items, newItem];
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    
    setInvoice({
      ...invoice,
      items: updatedItems,
      subtotal,
      total: subtotal + invoice.tax - (invoice.discount || 0)
    });

    // Reset form
    setSelectedProductToAdd('');
    setAddQuantity(1);
    setProductSearchTerm('');
    setIsAddingProduct(false);
  };

  const updateDiscount = (discount: number) => {
    if (!invoice) return;
    const newTotal = invoice.subtotal + invoice.tax - discount;
    setInvoice({
      ...invoice,
      discount,
      total: newTotal
    });
    setEditingDiscount(false);
  };

  const updateTax = (tax: number) => {
    if (!invoice) return;
    const newTotal = invoice.subtotal + tax - (invoice.discount || 0);
    setInvoice({
      ...invoice,
      tax,
      total: newTotal
    });
    setEditingTax(false);
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
        {!isEditable && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Read-Only Mode
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>This invoice is in "{selectedStatus}" status and cannot be edited. Change the status to "Draft" to enable editing.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
                Edit Invoice {invoiceNumber || 'Loading...'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Modify invoice details and items
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={generatePDF}
              variant="outline"
              disabled={!invoice || !selectedCustomer}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print PDF
            </Button>
            <Button 
              onClick={handleSaveInvoice}
              disabled={saving || !isEditable}
              className={`${!isEditable ? "opacity-50 cursor-not-allowed" : 
                         selectedStatus === 'sent' && isEditable ? "bg-red-600 hover:bg-red-700" : 
                         "bg-primary hover:bg-primary/90"}`}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 
               !isEditable ? 'Read Only' :
               selectedStatus === 'sent' && isEditable ? 'Issue Invoice & Deduct Stock' :
               'Save Changes'}
            </Button>
          </div>
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
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  disabled={!isEditable}
                  className={!isEditable ? "bg-gray-50" : ""}
                  placeholder="Enter invoice number"
                />
                {isEditable && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 You can edit the invoice number to fix any issues
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="po-number">PO Number</Label>
                <Input 
                  id="po-number"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  disabled={!isEditable}
                  className={!isEditable ? "bg-gray-50" : ""}
                  placeholder="Enter PO/reference number (optional)"
                />
                {isEditable && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 Optional purchase order or reference number
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)} disabled={!isEditable}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Issued</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {!isEditable && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    ⚠️ This invoice has been issued and is read-only. Stock has been deducted.
                  </p>
                )}
                {isEditable && selectedStatus === 'sent' && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    🚨 Click "Save Changes" to issue this invoice and deduct stock permanently.
                  </p>
                )}
                {isEditable && selectedStatus === 'draft' && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    💡 Change status to "Issued" to finalize the invoice and deduct stock.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input 
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={!isEditable}
                  className={!isEditable ? "bg-gray-50" : ""}
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
                  disabled={!isEditable}
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
            <div className="flex items-center justify-between">
              <CardTitle>Invoice Items</CardTitle>
              {isEditable && (
                <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Product to Invoice</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Search Products</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search by product name, article, SKU, or category..."
                            value={productSearchTerm}
                            onChange={(e) => setProductSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      {/* Product Results */}
                      <div className="max-h-60 overflow-y-auto border rounded-lg">
                        {filteredProducts.map((product) => (
                          <div key={product.id} className="border-b last:border-b-0">
                            <div className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{product.title}</div>
                                  <div className="text-sm text-gray-600">{product.article}</div>
                                  <Badge variant="outline">{product.category}</Badge>
                                </div>
                                {product.variants.length === 0 && (
                                  <Button
                                    size="sm"
                                    onClick={() => addProductToInvoice(product)}
                                    disabled={!isEditable}
                                    className={!isEditable ? "opacity-50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                  </Button>
                                )}
                              </div>
                              
                              {/* Variants */}
                              {product.variants.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {product.variants.map((variant) => {
                                    const stockQty = variant.qty || 0;
                                    const isOutOfStock = stockQty === 0;
                                    const isLowStock = stockQty > 0 && stockQty < 5;
                                    
                                    return (
                                      <div key={variant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <div className="text-sm font-medium">{variant.sku}</div>
                                            {isOutOfStock && (
                                              <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                                            )}
                                            {isLowStock && (
                                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">Low Stock</Badge>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            {Object.entries(variant.attributes).map(([key, value]) => 
                                              `${key}: ${value}`
                                            ).join(', ')}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            Stock: {stockQty} available
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          onClick={() => addProductToInvoice(product, variant)}
                                          disabled={isOutOfStock || !isEditable}
                                          className={isOutOfStock || !isEditable ? "opacity-50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}
                                        >
                                          <Plus className="h-4 w-4 mr-1" />
                                          {isOutOfStock ? 'Out of Stock' : !isEditable ? 'Read Only' : 'Add'}
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={addQuantity}
                          onChange={(e) => setAddQuantity(parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddingProduct(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
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
                {invoice.items.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  const isEditingPrice = editingPrices[item.id] !== undefined;
                  
                  return (
                    <TableRow key={`item-${item.id || index}-${item.productId || 'unknown'}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product?.title || item.productName || 'Product Not Found'}</div>
                          {item.sku && (
                            <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isEditable ? (
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        ) : (
                          <span>{item.quantity}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditable ? (
                          <div className="flex items-center gap-2">
                            {isEditingPrice ? (
                              <div className="flex items-center gap-1">
                                <span className="text-sm">£</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editingPrices[item.id]}
                                  onChange={(e) => setEditingPrices(prev => ({ 
                                    ...prev, 
                                    [item.id]: parseFloat(e.target.value) || 0 
                                  }))}
                                  className="w-20"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updateItemPrice(item.id, editingPrices[item.id]);
                                    }
                                    if (e.key === 'Escape') {
                                      const newEditingPrices = { ...editingPrices };
                                      delete newEditingPrices[item.id];
                                      setEditingPrices(newEditingPrices);
                                    }
                                  }}
                                  onBlur={() => updateItemPrice(item.id, editingPrices[item.id])}
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingPrices(prev => ({ ...prev, [item.id]: item.unitPrice }))}
                                className="text-left hover:bg-gray-50 p-1 rounded"
                              >
                                £{item.unitPrice.toFixed(2)}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span>£{item.unitPrice.toFixed(2)}</span>
                        )}
                      </TableCell>
                      <TableCell>£{item.total.toFixed(2)}</TableCell>
                      <TableCell>
                        {isEditable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
              <div className="flex justify-between items-center">
                <span>Discount:</span>
                {isEditable ? (
                  <div className="flex items-center gap-2">
                    {editingDiscount ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">-£</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newDiscount}
                          onChange={(e) => setNewDiscount(parseFloat(e.target.value) || 0)}
                          className="w-20"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateDiscount(newDiscount);
                            }
                            if (e.key === 'Escape') {
                              setEditingDiscount(false);
                            }
                          }}
                          onBlur={() => updateDiscount(newDiscount)}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setNewDiscount(invoice.discount || 0);
                          setEditingDiscount(true);
                        }}
                        className="text-left hover:bg-gray-50 p-1 rounded"
                      >
                        -£{(invoice.discount || 0).toFixed(2)}
                      </button>
                    )}
                  </div>
                ) : (
                  <span>-£{(invoice.discount || 0).toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span>Tax:</span>
                {isEditable ? (
                  <div className="flex items-center gap-2">
                    {editingTax ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">£</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newTax}
                          onChange={(e) => setNewTax(parseFloat(e.target.value) || 0)}
                          className="w-20"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateTax(newTax);
                            }
                            if (e.key === 'Escape') {
                              setEditingTax(false);
                            }
                          }}
                          onBlur={() => updateTax(newTax)}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setNewTax(invoice.tax);
                          setEditingTax(true);
                        }}
                        className="text-left hover:bg-gray-50 p-1 rounded"
                      >
                        £{invoice.tax.toFixed(2)}
                      </button>
                    )}
                  </div>
                ) : (
                  <span>£{invoice.tax.toFixed(2)}</span>
                )}
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
