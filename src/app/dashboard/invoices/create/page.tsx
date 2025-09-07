'use client';

import { useState, useEffect } from 'react';
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

export default function CreateInvoicePage() {
  const router = useRouter();
  const { products } = useProducts();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<{ productId: string; variantId?: string; quantity: number; unitPrice: number; }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [taxRate, setTaxRate] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load customers from API
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone.includes(customerSearchTerm) ||
    (customer.company && customer.company.toLowerCase().includes(customerSearchTerm.toLowerCase()))
  );

  // Filter products only when searching - Enhanced search by title, article, category, and SKU
  const filteredProducts = productSearchTerm.trim() ? products.filter(product => {
    const searchTerm = productSearchTerm.toLowerCase();
    
    // Search in product title, article, and category
    const productMatch = 
      product.title.toLowerCase().includes(searchTerm) ||
      product.article.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm);
    
    // Search in variant SKUs and attributes
    const variantMatch = product.variants.some(variant => 
      variant.sku.toLowerCase().includes(searchTerm) ||
      Object.values(variant.attributes).some(attr => 
        attr.toString().toLowerCase().includes(searchTerm)
      )
    );
    
    return productMatch || variantMatch;
  }) : [];

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

  // Update item unit price
  const updateItemPrice = (index: number, price: number) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index].unitPrice = Math.max(0, price);
    setInvoiceItems(updatedItems);
  };

  // Calculate totals
  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * discount / 100) 
    : discount;
  const taxAmount = ((subtotal - discountAmount) * taxRate / 100);
  const grandTotal = subtotal - discountAmount + taxAmount;
  const balanceDue = grandTotal - paidAmount;

  // Save invoice
  const saveInvoice = async () => {
    if (!selectedCustomer || invoiceItems.length === 0) {
      alert('Please select a customer and add at least one product.');
      return;
    }

    setLoading(true);

    try {
      // Determine invoice status based on payment
      let status: 'paid' | 'pending' | 'sent' = 'pending';
      let paymentStatus: 'paid' | 'unpaid' | 'partial' = 'unpaid';
      
      if (paidAmount >= grandTotal) {
        status = 'paid';
        paymentStatus = 'paid';
      } else if (paidAmount > 0) {
        status = 'pending'; // Status should be 'pending', not 'partial'
        paymentStatus = 'partial';
      }

      const invoiceData = {
        invoiceNumber: getNextInvoiceNumber(),
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        date: new Date().toISOString().split('T')[0],
        items: invoiceItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        })),
        subtotal,
        discount: discountAmount, // Map discountAmount to discount
        tax: taxAmount, // Map taxAmount to tax
        total: grandTotal,
        status,
        paymentStatus: paymentStatus, // Use the separate paymentStatus variable
        paidAmount: paidAmount, // Add the paid amount
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        notes: `Invoice created. Paid: $${paidAmount.toFixed(2)}, Balance: $${balanceDue.toFixed(2)}`
      };

      console.log('Frontend: Sending invoice data:', JSON.stringify(invoiceData, null, 2));

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        alert('Invoice saved successfully!');
        router.push('/dashboard/invoices');
      } else {
        const errorData = await response.text();
        console.error('API Response Error:', errorData);
        throw new Error(`Failed to save invoice: ${errorData}`);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error saving invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF - Professional Design Fix
  const generatePDF = async () => {
    if (!selectedCustomer || invoiceItems.length === 0) {
      alert('Please complete the invoice before generating PDF.');
      return;
    }

    try {
      // Dynamic import of jsPDF
      const jsPDF = (await import('jspdf')).default;
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF('p', 'mm', 'a4'); // Explicit A4 sizing
      const invoiceNumber = getNextInvoiceNumber();
      
      // Professional Colors
      const primaryColor = '#0F62FE';
      const darkGray = '#1A1D21';
      const lightGray = '#E9EDF2';
      const mediumGray = '#5C6270';

      // Page dimensions for proper sizing
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 8; // Minimal margin for maximum table width

      // === HEADER SECTION ===
      
      // Top blue accent bar
      doc.setFillColor(primaryColor);
      doc.rect(0, 0, pageWidth, 4, 'F');

      // Logo
      try {
        // Try to add the logo image
        doc.addImage('/data/BrandSports-logo.jpg', 'JPEG', margin, 8, 20, 20);
      } catch (error) {
        // Fallback to logo placeholder if image fails
        doc.setDrawColor(lightGray);
        doc.setLineWidth(0.5);
        doc.rect(margin, 8, 20, 20);
        doc.setFontSize(8);
        doc.setTextColor(mediumGray);
        doc.text('LOGO', margin + 8, 20);
      }

      // Company information - better positioning
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(darkGray);
      doc.text('BYKO SPORTS', margin + 25, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(mediumGray);
      doc.text('Nortex Business Center, BL1 3AS', margin + 25, 21);
      doc.text('Bolton, United Kingdom', margin + 25, 25);

      // Invoice title and metadata (RIGHT SIDE) - better positioned
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(darkGray);
      doc.text('INVOICE', pageWidth - 50, 16);

      // Invoice metadata grid - properly sized
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
      doc.text(new Date().toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }), metadataX + 25, metadataStartY + lineSpacing);
      doc.text(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }), metadataX + 25, metadataStartY + (lineSpacing * 2));
      doc.text('PO-04567', metadataX + 25, metadataStartY + (lineSpacing * 3));

      // === CLIENT INFORMATION CARDS ===
      
      const cardsY = 40;
      const cardWidth = 80;
      const cardHeight = 30;
      
      // Bill To card
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(darkGray);
      doc.text('Bill To:', margin + 3, cardsY + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(selectedCustomer.name, margin + 3, cardsY + 12);
      if (selectedCustomer.company) {
        doc.text(selectedCustomer.company, margin + 3, cardsY + 16);
      }
      doc.text(selectedCustomer.address, margin + 3, selectedCustomer.company ? cardsY + 20 : cardsY + 16);
      doc.text(selectedCustomer.phone, margin + 3, selectedCustomer.company ? cardsY + 24 : cardsY + 20);

      // Ship To card
      doc.setFont('helvetica', 'bold');
      doc.text('Ship To:', margin + cardWidth + 13, cardsY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mediumGray);
      doc.text('Same as billing address', margin + cardWidth + 13, cardsY + 12);

      // === LINE ITEMS TABLE ===
      
      const tableStartY = cardsY + 40;
      
      // Prepare table data with proper formatting - single line items
      const tableData = invoiceItems.map((item, index) => {
        const product = products.find(p => p.id === item.productId);
        const variant = product?.variants.find(v => v.id === item.variantId);
        
        // Keep item name on single line
        let itemName = product?.title || 'Unknown Product';
        
        // Create compact description
        let description = '';
        if (product?.article) {
          description = product.article;
        }
        
        if (variant) {
          const attributes = Object.entries(variant.attributes)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          if (attributes) {
            description += (description ? ' | ' : '') + attributes;
          }
        }
        
        // Combine name and description on single line if short enough
        const fullDescription = description ? `${itemName} (${description})` : itemName;
        
        const lineTotal = item.quantity * item.unitPrice;
        
        return [
          (index + 1).toString(),
          fullDescription, // Single line item description
          variant?.sku || product?.article || '-',
          item.quantity.toString(),
          `£${item.unitPrice.toFixed(2)}`,
          '0%',
          '0%',
          `£${lineTotal.toFixed(2)}`
        ];
      });

      // Generate the table to match the exact format from the image
      autoTable(doc, {
        startY: tableStartY,
        head: [['#', 'Item / Description', 'SKU', 'Qty', 'Unit Price', 'Discount', 'Tax', 'Line Total']],
        body: tableData,
        theme: 'striped',
        styles: {
          fontSize: 9,
          cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
          textColor: '#333333',
          lineColor: '#D1D5DB',
          lineWidth: 0.5,
          overflow: 'linebreak',
          halign: 'left'
        },
        headStyles: {
          fillColor: '#E1E8F4', // Light blue header like in the image
          textColor: '#374151',
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'left',
          cellPadding: { top: 6, bottom: 6, left: 4, right: 4 }
        },
        alternateRowStyles: {
          fillColor: '#F9FAFB' // Very light gray for alternating rows
        },
        bodyStyles: {
          fillColor: '#FFFFFF' // White for primary rows
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' }, // # column
          1: { cellWidth: 70, halign: 'left' }, // Description
          2: { cellWidth: 30, halign: 'center' }, // SKU
          3: { cellWidth: 12, halign: 'center' }, // Qty
          4: { cellWidth: 20, halign: 'right' }, // Unit Price
          5: { cellWidth: 15, halign: 'center' }, // Discount
          6: { cellWidth: 12, halign: 'center' }, // Tax
          7: { cellWidth: 25, halign: 'right' } // Line Total
        },
        margin: { left: margin, right: margin },
        tableWidth: 'auto',
        pageBreak: 'auto'
      });

      // === TOTALS SECTION ===
      
      const tableEndY = (doc as any).lastAutoTable.finalY + 10;
      
      // Notes (left side)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(darkGray);
      doc.text('Notes:', margin, tableEndY);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(mediumGray);
      doc.text('Order period: Q1 2025', margin, tableEndY + 6);
      doc.text('Reference: Project Alpha', margin, tableEndY + 10);

      // Summary box (right side) - properly positioned
      const summaryX = pageWidth - 65; // Position from right edge
      const summaryWidth = 55;
      
      // Calculate box height based on content
      let boxHeight = 45;
      if (paidAmount > 0) boxHeight += 12; // Add space for paid amount and balance due
      
      doc.setDrawColor(lightGray);
      doc.setLineWidth(0.3);
      doc.rect(summaryX, tableEndY - 3, summaryWidth, boxHeight);

      // Totals calculations - compact but readable
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(darkGray);
      
      let currentY = tableEndY + 3;
      const labelX = summaryX + 3;
      const valueX = summaryX + summaryWidth - 3;
      
      // Subtotal
      doc.text('Subtotal:', labelX, currentY);
      doc.text(`£${subtotal.toFixed(2)}`, valueX, currentY, { align: 'right' });
      currentY += 6;
      
      // Discount
      if (discountAmount > 0) {
        doc.text('Discount:', labelX, currentY);
        doc.text(`-£${discountAmount.toFixed(2)}`, valueX, currentY, { align: 'right' });
        currentY += 6;
      }
      
      // Shipping
      doc.text('Shipping:', labelX, currentY);
      doc.text('£0.00', valueX, currentY, { align: 'right' });
      currentY += 6;
      
      // Tax
      if (taxAmount > 0) {
        doc.text(`Tax (${taxRate}%):`, labelX, currentY);
        doc.text(`£${taxAmount.toFixed(2)}`, valueX, currentY, { align: 'right' });
        currentY += 6;
      }

      // Total line
      doc.setDrawColor(primaryColor);
      doc.setLineWidth(0.5);
      doc.line(labelX, currentY, valueX, currentY);
      
      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(primaryColor);
      doc.text('Total Due:', labelX, currentY);
      doc.text(`£${grandTotal.toFixed(2)}`, valueX, currentY, { align: 'right' });

      // Payment information (if any payment made)
      if (paidAmount > 0) {
        currentY += 8;
        
        // Paid amount
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor('#059669'); // Green color for paid amount
        doc.text('Paid:', labelX, currentY);
        doc.text(`£${paidAmount.toFixed(2)}`, valueX, currentY, { align: 'right' });
        currentY += 6;
        
        // Balance due
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(balanceDue > 0 ? '#DC2626' : '#059669'); // Red if balance due, green if fully paid
        doc.text('Balance Due:', labelX, currentY);
        doc.text(`£${balanceDue.toFixed(2)}`, valueX, currentY, { align: 'right' });
      }

      // === FOOTER ===
      
      const footerY = 270;
      
      // Divider line
      doc.setDrawColor(lightGray);
      doc.setLineWidth(0.5);
      doc.line(15, footerY, 195, footerY);

      // Footer text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(mediumGray);
      doc.text('Thank you for your business.', 105, footerY + 8, { align: 'center' });

      doc.setFontSize(7);
      doc.text('BYKO SPORTS • Registered in England & Wales • Company No: 12345678 • VAT No: GB123456789', 105, footerY + 15, { align: 'center' });
      doc.text('Registered Office: Nortex Business Center, BL1 3AS, Bolton, United Kingdom', 105, footerY + 22, { align: 'center' });

      // Save the PDF
      doc.save(`invoice-${invoiceNumber}.pdf`);
      
      alert('Professional invoice PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please check the console for details.');
    }
  };

  return (
    <DashboardLayout>
      <SuppressHydrationWarning>
        <div className="h-full flex flex-col space-y-4 lg:space-y-6 p-4 lg:p-6">
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

          {/* Three Section Layout - Responsive: Vertical on mobile, Horizontal on desktop */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Section 1: Customer Selection (20% on desktop, full width on mobile) */}
            <div className="w-full lg:w-1/5">
              <Card className="h-auto lg:h-full">
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

            {/* Section 2: Product Addition (60% on desktop, full width on mobile) */}
            <div className="w-full lg:w-3/5">
              <Card className="h-auto lg:h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Products & Invoice Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 h-auto lg:h-full flex flex-col">
                  {/* Product Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by product name, article, SKU, or category..."
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
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                                    onFocus={(e) => e.target.select()}
                                    className="w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="0.00"
                                  />
                                </TableCell>
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

            {/* Section 3: Invoice Settings (20% on desktop, full width on mobile) */}
            <div className="w-full lg:w-1/5">
              <Card className="h-auto lg:h-full">
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

                    <div className="space-y-2">
                      <Label htmlFor="paid-amount" className="dark:text-gray-300">Paid Amount (£)</Label>
                      <Input
                        id="paid-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
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
                    {paidAmount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Paid Amount:</span>
                        <span>£{paidAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {paidAmount > 0 && (
                      <div className="flex justify-between font-bold text-lg border-t pt-2 dark:border-gray-700 dark:text-white">
                        <span>Balance Due:</span>
                        <span className={balanceDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                          £{balanceDue.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      className="w-full dark:bg-blue-600 dark:hover:bg-blue-700" 
                      onClick={saveInvoice}
                      disabled={!selectedCustomer || invoiceItems.length === 0 || loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Invoice'}
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
