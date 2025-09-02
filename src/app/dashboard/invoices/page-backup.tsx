'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SuppressHydrationWarning } from '@/components/SuppressHydrationWarning';
import { getNextInvoiceNumber } from '@/lib/utils/invoice-numbering';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, FileText, DollarSign, Clock, CheckCircle, Edit, Eye, Printer, Trash2 } from 'lucide-react';
import { Invoice, Customer, Product } from '@/lib/types';

// Mock data using updated structures
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
    variants: [
      {
        id: 'v1',
        productId: '1',
        sku: 'BGC-1011-RED-10',
        attributes: { Size: '10oz', Color: 'RED' },
        qty: 25
      },
      {
        id: 'v2',
        productId: '1',
        sku: 'BGC-1011-BLUE-12',
        attributes: { Size: '12oz', Color: 'BLUE' },
        qty: 18,
        wholesale: 62,
        retail: 89.99,
        club: 75.99,
        costBefore: 48,
        costAfter: 55
      }
    ]
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
    variants: [
      {
        id: 'v3',
        productId: '2',
        sku: 'TRK-2022-BLACK-M',
        attributes: { Size: 'M', Color: 'BLACK' },
        qty: 40
      },
      {
        id: 'v4',
        productId: '2',
        sku: 'TRK-2022-BLUE-L',
        attributes: { Size: 'L', Color: 'BLUE' },
        qty: 30
      }
    ]
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

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>(() => mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'overdue': return 'destructive';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setIsDialogOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    // Navigate to edit page or open edit dialog
    router.push(`/dashboard/invoices/edit/${invoice.id}`);
  };

  const handlePrintInvoice = async (invoice: Invoice) => {
    try {
      // Dynamic import of jsPDF
      const jsPDF = (await import('jspdf')).default;
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF('p', 'mm', 'a4'); // Explicit A4 sizing
      const invoiceNumber = invoice.invoiceNumber;
      
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

      // Logo placeholder
      doc.setDrawColor(lightGray);
      doc.setLineWidth(0.5);
      doc.rect(margin, 8, 20, 20);
      doc.setFontSize(8);
      doc.setTextColor(mediumGray);
      doc.text('LOGO', margin + 8, 20);

      // Company information - better positioning
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(darkGray);
      doc.text('WINSIDE LTD', margin + 25, 16);

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
      doc.text(invoice.createdAt.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }), metadataX + 25, metadataStartY + lineSpacing);
      doc.text(invoice.dueDate.toLocaleDateString('en-GB', { 
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
      doc.text(invoice.customer.name, margin + 3, cardsY + 12);
      if (invoice.customer.company) {
        doc.text(invoice.customer.company, margin + 3, cardsY + 16);
      }
      doc.text(invoice.customer.address, margin + 3, invoice.customer.company ? cardsY + 20 : cardsY + 16);
      doc.text(invoice.customer.phone, margin + 3, invoice.customer.company ? cardsY + 24 : cardsY + 20);

      // Ship To card
      doc.setFont('helvetica', 'bold');
      doc.text('Ship To:', margin + cardWidth + 13, cardsY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(mediumGray);
      doc.text('Same as billing address', margin + cardWidth + 13, cardsY + 12);

      // === LINE ITEMS TABLE ===
      
      const tableStartY = cardsY + 40;
      
      // Prepare table data with proper formatting
      const tableData = invoice.items.map((item, index) => {
        const product = mockProducts.find(p => p.id === item.productId);
        
        // Create item description
        let itemDescription = product?.title || 'Unknown Product';
        if (product?.article) {
          itemDescription = `${itemDescription} (${product.article})`;
        }
        
        return [
          (index + 1).toString(),
          itemDescription,
          product?.article || '-',
          item.quantity.toString(),
          `£${item.unitPrice.toFixed(2)}`,
          '0%',
          '0%',
          `£${item.total.toFixed(2)}`
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
      
      doc.setDrawColor(lightGray);
      doc.setLineWidth(0.3);
      doc.rect(summaryX, tableEndY - 3, summaryWidth, 45);

      // Totals calculations - compact but readable
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(darkGray);
      
      let currentY = tableEndY + 3;
      const labelX = summaryX + 3;
      const valueX = summaryX + summaryWidth - 3;
      
      // Subtotal
      doc.text('Subtotal:', labelX, currentY);
      doc.text(`£${invoice.subtotal.toFixed(2)}`, valueX, currentY, { align: 'right' });
      currentY += 6;
      
      // Shipping
      doc.text('Shipping:', labelX, currentY);
      doc.text('£0.00', valueX, currentY, { align: 'right' });
      currentY += 6;
      
      // Tax
      if (invoice.tax > 0) {
        doc.text('Tax:', labelX, currentY);
        doc.text(`£${invoice.tax.toFixed(2)}`, valueX, currentY, { align: 'right' });
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
      doc.text(`£${invoice.total.toFixed(2)}`, valueX, currentY, { align: 'right' });

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
      doc.text('WINSIDE LTD • Registered in England & Wales • Company No: 12345678 • VAT No: GB123456789', 105, footerY + 15, { align: 'center' });
      doc.text('Registered Office: Nortex Business Center, BL1 3AS, Bolton, United Kingdom', 105, footerY + 22, { align: 'center' });

      // Save the PDF
      doc.save(`invoice-${invoiceNumber}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please check the console for details.');
    }
  };

  // Generate PDF function (placeholder for future implementation)
  const generatePDF = () => {
    console.log('Generating professional PDF invoice...');
    // TODO: Implement PDF generation with professional template
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) {
      setInvoices(invoices.filter(inv => inv.id !== invoice.id));
    }
  };

  return (
    <DashboardLayout>
      <SuppressHydrationWarning>
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Invoice Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, manage and track your invoices with customer-specific pricing
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/invoices/create')} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Invoice Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                All time invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paidInvoices}</div>
              <p className="text-xs text-muted-foreground">
                Successfully collected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingInvoices}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From paid invoices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search invoices by number, customer name, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <button
                          onClick={() => router.push(`/dashboard/customers/${invoice.customer?.id}`)}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left"
                        >
                          {invoice.customer?.name}
                        </button>
                        <div className="text-sm text-gray-600">{invoice.customer?.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      £{invoice.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={
                        invoice.status === 'overdue' ? 'text-red-600 font-medium' : ''
                      }>
                        {invoice.dueDate.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice)}
                          title="View Invoice Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditInvoice(invoice)}
                          title="Edit Invoice"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePrintInvoice(invoice)}
                          title="Print Invoice"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteInvoice(invoice)}
                          title="Delete Invoice"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
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

        {/* View Invoice Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>
            {viewingInvoice && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Invoice Info</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      <p><strong>Number:</strong> {viewingInvoice.invoiceNumber}</p>
                      <p><strong>Date:</strong> {viewingInvoice.createdAt.toLocaleDateString()}</p>
                      <p><strong>Due Date:</strong> {viewingInvoice.dueDate.toLocaleDateString()}</p>
                      <p><strong>Status:</strong> 
                        <Badge className="ml-2" variant={getStatusColor(viewingInvoice.status)}>
                          {viewingInvoice.status}
                        </Badge>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Customer</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{viewingInvoice.customer?.name}</p>
                      <p className="text-sm text-gray-600">{viewingInvoice.customer?.phone}</p>
                      {viewingInvoice.customer?.company && (
                        <p className="text-sm text-gray-600">{viewingInvoice.customer.company}</p>
                      )}
                      <Badge className="mt-1" variant="outline">
                        {viewingInvoice.customer?.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Items</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingInvoice.items.map((item) => {
                        const product = mockProducts.find(p => p.id === item.productId);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>{product?.title || 'Product Not Found'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>£{item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell>£{item.total.toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="bg-gray-50 p-4 rounded space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>£{viewingInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>£{viewingInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>£{viewingInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </SuppressHydrationWarning>
    </DashboardLayout>
  );
}
