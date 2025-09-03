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

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Load invoices from API
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      } else {
        console.error('Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.customer?.company && invoice.customer.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'partial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'partial': return 'outline';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setIsDialogOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    router.push(`/dashboard/invoices/edit/${invoice.id}`);
  };

  const handlePrintInvoice = async (invoice: Invoice) => {
    try {
      // Dynamic import of jsPDF
      const jsPDF = (await import('jspdf')).default;
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF('p', 'mm', 'a4');
      const invoiceNumber = invoice.invoiceNumber;
      
      // Professional Colors
      const primaryColor = '#0F62FE';
      const darkGray = '#1A1D21';
      const lightGray = '#E9EDF2';
      const mediumGray = '#5C6270';

      // Page dimensions
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 8;

      // Header
      doc.setFillColor(primaryColor);
      doc.rect(0, 0, pageWidth, 4, 'F');

      // Logo placeholder
      doc.setDrawColor(lightGray);
      doc.setLineWidth(0.5);
      doc.rect(margin, 8, 20, 20);
      doc.setFontSize(8);
      doc.setTextColor(mediumGray);
      doc.text('LOGO', margin + 8, 20);

      // Company info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(darkGray);
      doc.text('WINSIDE LTD', margin + 25, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(mediumGray);
      doc.text('Nortex Business Center, BL1 3AS', margin + 25, 21);
      doc.text('Bolton, United Kingdom', margin + 25, 25);

      // Invoice title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(darkGray);
      doc.text('INVOICE', pageWidth - 50, 16);

      // Invoice metadata
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(mediumGray);
      
      const metadataStartY = 22;
      const lineSpacing = 4;
      const metadataX = pageWidth - 70;
      
      doc.text('Invoice No:', metadataX, metadataStartY);
      doc.text('Issue Date:', metadataX, metadataStartY + lineSpacing);
      doc.text('Due Date:', metadataX, metadataStartY + (lineSpacing * 2));

      doc.setFont('helvetica', 'normal');
      doc.text(invoiceNumber, metadataX + 25, metadataStartY);
      doc.text(new Date(invoice.createdAt).toLocaleDateString('en-GB'), metadataX + 25, metadataStartY + lineSpacing);
      doc.text(new Date(invoice.dueDate).toLocaleDateString('en-GB'), metadataX + 25, metadataStartY + (lineSpacing * 2));

      // Customer info
      const cardsY = 40;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(darkGray);
      doc.text('Bill To:', margin + 3, cardsY + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      if (invoice.customer) {
        doc.text(invoice.customer.name, margin + 3, cardsY + 12);
        if (invoice.customer.company) {
          doc.text(invoice.customer.company, margin + 3, cardsY + 16);
        }
        doc.text(invoice.customer.address, margin + 3, invoice.customer.company ? cardsY + 20 : cardsY + 16);
        doc.text(invoice.customer.phone, margin + 3, invoice.customer.company ? cardsY + 24 : cardsY + 20);
      }

      // Table
      const tableStartY = cardsY + 40;
      
      const tableData = invoice.items.map((item, index) => [
        (index + 1).toString(),
        `Product Item ${index + 1}`,
        '-',
        item.quantity.toString(),
        `£${item.unitPrice.toFixed(2)}`,
        '0%',
        '0%',
        `£${item.total.toFixed(2)}`
      ]);

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
          fillColor: '#E1E8F4',
          textColor: '#374151',
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'left',
          cellPadding: { top: 6, bottom: 6, left: 4, right: 4 }
        },
        alternateRowStyles: {
          fillColor: '#F9FAFB'
        },
        bodyStyles: {
          fillColor: '#FFFFFF'
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 70, halign: 'left' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 12, halign: 'center' },
          4: { cellWidth: 20, halign: 'right' },
          5: { cellWidth: 15, halign: 'center' },
          6: { cellWidth: 12, halign: 'center' },
          7: { cellWidth: 25, halign: 'right' }
        },
        margin: { left: margin, right: margin },
        tableWidth: 'auto',
        pageBreak: 'auto'
      });

      // Totals
      const tableEndY = (doc as any).lastAutoTable.finalY + 10;
      const summaryX = pageWidth - 65;
      const summaryWidth = 55;
      
      let boxHeight = 45;
      if (invoice.status === 'paid' || invoice.paymentStatus === 'partial') boxHeight += 12;
      
      doc.setDrawColor(lightGray);
      doc.setLineWidth(0.3);
      doc.rect(summaryX, tableEndY - 3, summaryWidth, boxHeight);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(darkGray);
      
      let currentY = tableEndY + 3;
      const labelX = summaryX + 3;
      const valueX = summaryX + summaryWidth - 3;
      
      doc.text('Subtotal:', labelX, currentY);
      doc.text(`£${invoice.subtotal.toFixed(2)}`, valueX, currentY, { align: 'right' });
      currentY += 6;
      
      doc.text('Tax:', labelX, currentY);
      doc.text(`£${invoice.tax.toFixed(2)}`, valueX, currentY, { align: 'right' });
      currentY += 6;

      doc.setDrawColor(primaryColor);
      doc.setLineWidth(0.5);
      doc.line(labelX, currentY, valueX, currentY);
      
      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(primaryColor);
      doc.text('Total Due:', labelX, currentY);
      doc.text(`£${invoice.total.toFixed(2)}`, valueX, currentY, { align: 'right' });

      if (invoice.status === 'paid') {
        currentY += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor('#059669');
        doc.text('Status:', labelX, currentY);
        doc.text('PAID', valueX, currentY, { align: 'right' });
        currentY += 6;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor('#059669');
        doc.text('Balance Due:', labelX, currentY);
        doc.text('£0.00', valueX, currentY, { align: 'right' });
      }

      // Footer
      const footerY = 270;
      
      doc.setDrawColor(lightGray);
      doc.setLineWidth(0.5);
      doc.line(15, footerY, 195, footerY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(mediumGray);
      doc.text('Thank you for your business.', 105, footerY + 8, { align: 'center' });

      doc.setFontSize(7);
      doc.text('WINSIDE LTD • Registered in England & Wales • Company No: 12345678 • VAT No: GB123456789', 105, footerY + 15, { align: 'center' });
      doc.text('Registered Office: Nortex Business Center, BL1 3AS, Bolton, United Kingdom', 105, footerY + 22, { align: 'center' });

      doc.save(`invoice-${invoiceNumber}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/invoices/${invoice.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setInvoices(invoices.filter(inv => inv.id !== invoice.id));
        } else {
          alert('Failed to delete invoice. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Error deleting invoice. Please try again.');
      }
    }
  };

  // Calculate dashboard stats
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending').length;
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading invoices...</p>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{totalInvoices}</div>
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
                <CardTitle className="text-sm font-medium dark:text-gray-300">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{pendingInvoices}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{paidInvoices}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-white">Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-700">All Status</SelectItem>
                    <SelectItem value="paid" className="dark:text-white dark:hover:bg-gray-700">Paid</SelectItem>
                    <SelectItem value="pending" className="dark:text-white dark:hover:bg-gray-700">Pending</SelectItem>
                    <SelectItem value="partial" className="dark:text-white dark:hover:bg-gray-700">Partial</SelectItem>
                    <SelectItem value="overdue" className="dark:text-white dark:hover:bg-gray-700">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Invoices Table */}
              <div className="rounded-md border dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-gray-700">
                      <TableHead className="dark:text-gray-300">Invoice #</TableHead>
                      <TableHead className="dark:text-gray-300">Customer</TableHead>
                      <TableHead className="dark:text-gray-300">Amount</TableHead>
                      <TableHead className="dark:text-gray-300">Status</TableHead>
                      <TableHead className="dark:text-gray-300">Date</TableHead>
                      <TableHead className="dark:text-gray-300">Due Date</TableHead>
                      <TableHead className="dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          No invoices found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="dark:border-gray-700">
                          <TableCell className="font-medium dark:text-white">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            <div>
                              <div className="font-medium">{invoice.customer?.name || 'Unknown'}</div>
                              {invoice.customer?.company && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {invoice.customer.company}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            £{invoice.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(invoice.status)} className={getStatusBadge(invoice.status)}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {new Date(invoice.dueDate).toLocaleDateString()}
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* View Invoice Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Invoice Details</DialogTitle>
              </DialogHeader>
              {viewingInvoice && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Invoice Information</h3>
                      <p><strong>Invoice #:</strong> {viewingInvoice.invoiceNumber}</p>
                      <p><strong>Status:</strong> <Badge variant={getStatusVariant(viewingInvoice.status)}>{viewingInvoice.status}</Badge></p>
                      <p><strong>Created:</strong> {new Date(viewingInvoice.createdAt).toLocaleDateString()}</p>
                      <p><strong>Due Date:</strong> {new Date(viewingInvoice.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Customer Information</h3>
                      <p><strong>Name:</strong> {viewingInvoice.customer?.name}</p>
                      <p><strong>Phone:</strong> {viewingInvoice.customer?.phone}</p>
                      {viewingInvoice.customer?.company && <p><strong>Company:</strong> {viewingInvoice.customer.company}</p>}
                      <p><strong>Address:</strong> {viewingInvoice.customer?.address}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Items</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingInvoice.items.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>Product Item {index + 1}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>£{item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell>£{item.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-end space-y-1">
                      <div className="text-right">
                        <p><strong>Subtotal:</strong> £{viewingInvoice.subtotal.toFixed(2)}</p>
                        <p><strong>Tax:</strong> £{viewingInvoice.tax.toFixed(2)}</p>
                        <p className="text-lg"><strong>Total:</strong> £{viewingInvoice.total.toFixed(2)}</p>
                        {viewingInvoice.status === 'paid' && (
                          <>
                            <p className="text-green-600"><strong>Status:</strong> PAID</p>
                            <p className="text-lg text-green-600"><strong>Balance Due:</strong> £0.00</p>
                          </>
                        )}
                        {viewingInvoice.paymentStatus === 'partial' && (
                          <>
                            <p className="text-yellow-600"><strong>Status:</strong> PARTIALLY PAID</p>
                          </>
                        )}
                      </div>
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
