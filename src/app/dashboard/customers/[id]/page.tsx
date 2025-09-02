'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Search, Edit, Trash2, Download, DollarSign, FileText, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Customer, Invoice } from '@/lib/types'

// Mock data - replace with actual API calls
const mockCustomer: Customer = {
  id: 'CUST001',
  name: 'John Smith',
  company: 'Smith Industries',
  email: 'john.smith@smithindustries.com',
  phone: '+1 (555) 123-4567',
  address: '123 Business Street, City, State 12345',
  type: 'wholesale' as const,
  createdAt: new Date('2024-01-01'),
  totalOrders: 15,
  totalSpent: 2450.50
}

const mockInvoices: Invoice[] = [
  {
    id: 'INV001',
    invoiceNumber: 'INV-2025-001',
    customerId: 'CUST001',
    customerName: 'John Smith',
    date: '2025-08-15',
    dueDate: new Date('2025-09-14'),
    items: [
      { id: '1', productId: 'PROD001', productName: 'Product A', sku: 'SKU001', quantity: 2, unitPrice: 50.00, total: 100.00 }
    ],
    subtotal: 100.00,
    discount: 10.00,
    tax: 7.20,
    total: 97.20,
    status: 'paid' as const,
    paymentStatus: 'paid' as const,
    notes: 'Bulk order discount applied',
    createdAt: new Date('2025-08-15'),
  },
  {
    id: 'INV002',
    invoiceNumber: 'INV-2025-002',
    customerId: 'CUST001',
    customerName: 'John Smith',
    date: '2025-08-20',
    dueDate: new Date('2025-09-19'),
    items: [
      { id: '1', productId: 'PROD002', productName: 'Product B', sku: 'SKU002', quantity: 1, unitPrice: 75.00, total: 75.00 }
    ],
    subtotal: 75.00,
    discount: 0.00,
    tax: 6.00,
    total: 81.00,
    status: 'pending' as const,
    paymentStatus: 'unpaid' as const,
    notes: '',
    createdAt: new Date('2025-08-20'),
  },
  {
    id: 'INV003',
    invoiceNumber: 'INV-2025-003',
    customerId: 'CUST001',
    customerName: 'John Smith',
    date: '2025-08-25',
    dueDate: new Date('2025-09-24'),
    items: [
      { id: '1', productId: 'PROD003', productName: 'Product C', sku: 'SKU003', quantity: 3, unitPrice: 30.00, total: 90.00 }
    ],
    subtotal: 90.00,
    discount: 5.00,
    tax: 6.80,
    total: 91.80,
    status: 'overdue' as const,
    paymentStatus: 'partial' as const,
    notes: 'Partial payment received: £50.00',
    createdAt: new Date('2025-08-25'),
  }
]

export default function CustomerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [totalOutstanding, setTotalOutstanding] = useState(0)
  const [totalPaid, setTotalPaid] = useState(0)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Load customer data and invoices
  useEffect(() => {
    // Simulate API call
    setCustomer(mockCustomer)
    setInvoices(mockInvoices)
    setFilteredInvoices(mockInvoices)

    // Calculate totals
    const outstanding = mockInvoices
      .filter(inv => inv.paymentStatus !== 'paid')
      .reduce((sum, inv) => sum + inv.total, 0)
    setTotalOutstanding(outstanding)
    
    // Calculate total paid amount
    const paid = mockInvoices
      .filter(inv => inv.paymentStatus === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0)
    setTotalPaid(paid)
  }, [customerId])

  // Filter invoices based on search
  useEffect(() => {
    const filtered = invoices.filter(invoice =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.notes && invoice.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredInvoices(filtered)
  }, [searchTerm, invoices])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      overdue: { color: 'bg-red-100 text-red-800', label: 'Overdue' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      unpaid: { color: 'bg-red-100 text-red-800', label: 'Unpaid' },
      partial: { color: 'bg-orange-100 text-orange-800', label: 'Partial' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setIsEditDialogOpen(true)
  }

  const handleSaveInvoice = () => {
    if (editingInvoice) {
      const updatedInvoices = invoices.map(inv =>
        inv.id === editingInvoice.id ? editingInvoice : inv
      )
      setInvoices(updatedInvoices)
      
      // Recalculate totals
      const outstanding = updatedInvoices
        .filter(inv => inv.paymentStatus !== 'paid')
        .reduce((sum, inv) => sum + inv.total, 0)
      setTotalOutstanding(outstanding)
      
      const paid = updatedInvoices
        .filter(inv => inv.paymentStatus === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0)
      setTotalPaid(paid)
      
      setIsEditDialogOpen(false)
      setEditingInvoice(null)
    }
  }

  const handleDeleteInvoice = (invoiceId: string) => {
    const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId)
    setInvoices(updatedInvoices)
    
    // Recalculate totals
    const outstanding = updatedInvoices
      .filter(inv => inv.paymentStatus !== 'paid')
      .reduce((sum, inv) => sum + inv.total, 0)
    setTotalOutstanding(outstanding)
    
    const paid = updatedInvoices
      .filter(inv => inv.paymentStatus === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0)
    setTotalPaid(paid)
    
    setIsDeleteDialogOpen(false)
    setDeletingInvoice(null)
  }

  const confirmDeleteInvoice = (invoice: Invoice) => {
    setDeletingInvoice(invoice)
    setIsDeleteDialogOpen(true)
  }

  const clearPayment = () => {
    // Logic to clear all outstanding payments
    const updatedInvoices = invoices.map(inv => ({
      ...inv,
      paymentStatus: 'paid' as const,
      status: 'paid' as const
    }))
    setInvoices(updatedInvoices)
    
    // Recalculate totals
    setTotalOutstanding(0)
    const totalAmount = updatedInvoices.reduce((sum, inv) => sum + inv.total, 0)
    setTotalPaid(totalAmount)
  }

  const downloadInvoice = (invoice: Invoice) => {
    // Generate PDF directly from the invoice data
    generateInvoicePDF(invoice);
  }

  // Professional PDF generation function
  const generateInvoicePDF = (invoice: Invoice) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Professional invoice HTML template
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  font-size: 14px; 
                  line-height: 1.6; 
                  color: #333; 
                  background: white;
              }
              .invoice-container { 
                  max-width: 210mm; 
                  margin: 0 auto; 
                  padding: 20mm; 
                  min-height: 297mm;
                  position: relative;
              }
              
              /* Header Section */
              .header { 
                  display: flex; 
                  justify-content: space-between; 
                  align-items: flex-start; 
                  margin-bottom: 40px;
                  padding-bottom: 20px;
                  border-bottom: 3px solid #2563eb;
                  page-break-inside: avoid;
              }
              .company-info h1 { 
                  color: #2563eb; 
                  font-size: 32px; 
                  font-weight: 700;
                  margin-bottom: 10px; 
                  letter-spacing: -0.5px;
              }
              .company-info p { 
                  color: #666; 
                  margin-bottom: 5px;
                  font-size: 13px;
              }
              .invoice-info { 
                  text-align: right; 
                  background: #f8fafc;
                  padding: 20px;
                  border-radius: 8px;
                  border-left: 4px solid #2563eb;
              }
              .invoice-info h2 { 
                  color: #1e293b; 
                  font-size: 28px; 
                  margin-bottom: 15px;
                  font-weight: 800;
              }
              .invoice-info p { 
                  margin-bottom: 8px;
                  font-size: 13px;
              }
              .invoice-info strong { color: #374151; }
              
              /* Customer Section */
              .customer-section { 
                  margin-bottom: 40px;
                  page-break-inside: avoid;
              }
              .customer-section h3 { 
                  color: #1e293b; 
                  margin-bottom: 15px; 
                  padding-bottom: 8px; 
                  border-bottom: 2px solid #e5e7eb;
                  font-size: 18px;
                  font-weight: 600;
              }
              .customer-details { 
                  background: #f8fafc; 
                  padding: 20px; 
                  border-radius: 8px;
                  border: 1px solid #e5e7eb;
              }
              .customer-details p {
                  margin-bottom: 6px;
                  font-size: 13px;
              }
              .customer-details strong {
                  color: #374151;
              }
              
              /* Items Table */
              .items-table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-bottom: 30px;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                  border-radius: 8px;
                  overflow: hidden;
              }
              .items-table th { 
                  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
                  color: white; 
                  padding: 16px 12px; 
                  text-align: left;
                  font-weight: 600;
                  font-size: 13px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
              }
              .items-table td { 
                  padding: 14px 12px; 
                  border-bottom: 1px solid #f1f5f9;
                  font-size: 13px;
              }
              .items-table tr:nth-child(even) { 
                  background: #f8fafc; 
              }
              .items-table tr:hover {
                  background: #f1f5f9;
              }
              .text-right { text-align: right; }
              .font-medium { font-weight: 600; }
              
              /* Status badges */
              .status-badge {
                  display: inline-block;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
              }
              .status-paid { background: #dcfce7; color: #166534; }
              .status-pending { background: #fef3c7; color: #92400e; }
              .status-overdue { background: #fecaca; color: #991b1b; }
              .status-partial { background: #fed7aa; color: #c2410c; }
              
              /* Totals Section */
              .totals-section { 
                  margin-left: auto; 
                  width: 350px;
                  background: #f8fafc;
                  padding: 25px;
                  border-radius: 8px;
                  border: 1px solid #e5e7eb;
                  page-break-inside: avoid;
              }
              .totals-row { 
                  display: flex; 
                  justify-content: space-between; 
                  padding: 10px 0;
                  font-size: 14px;
              }
              .totals-row.discount {
                  color: #dc2626;
                  font-weight: 600;
              }
              .totals-row.total { 
                  border-top: 2px solid #374151; 
                  font-weight: 700; 
                  font-size: 18px;
                  margin-top: 10px;
                  padding-top: 15px;
                  color: #1e293b;
              }
              
              /* Footer */
              .footer { 
                  margin-top: 100px; 
                  text-align: center; 
                  color: #6b7280; 
                  font-size: 12px;
                  border-top: 2px solid #e5e7eb;
                  padding-top: 30px;
                  page-break-inside: avoid;
                  break-inside: avoid;
                  clear: both;
              }
              .footer p {
                  margin-bottom: 5px;
              }
              
              /* Print Styles */
              @media print { 
                  body { 
                      print-color-adjust: exact; 
                      -webkit-print-color-adjust: exact;
                  }
                  .invoice-container { 
                      padding: 15mm;
                      box-shadow: none;
                  }
                  .header {
                      page-break-after: avoid;
                  }
                  .customer-section {
                      page-break-before: avoid;
                      page-break-after: avoid;
                  }
                  .items-table {
                      page-break-before: avoid;
                  }
                  .items-table thead {
                      display: table-header-group;
                  }
                  .items-table tr {
                      page-break-inside: avoid;
                  }
                  .totals-section {
                      page-break-before: avoid;
                  }
                  
                  /* Force footer to last page */
                  .footer {
                      page-break-before: always;
                      margin-top: auto;
                      position: relative;
                      min-height: 200px;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                  }
                  
                  /* Keep content together */
                  .totals-section {
                      page-break-after: avoid;
                      page-break-inside: avoid;
                  }
                  
                  .invoice-container {
                      min-height: 100vh;
                      display: flex;
                      flex-direction: column;
                  }
                  
                  .main-content {
                      flex: 1;
                  }
                  
                  /* Ensure proper page breaks */
                  h1, h2, h3 {
                      page-break-after: avoid;
                  }
                  
                  /* Avoid breaking these elements */
                  .customer-details,
                  .totals-section {
                      page-break-inside: avoid;
                  }
                  
                  /* Page layout */
                  @page {
                      margin: 15mm;
                      size: A4;
                  }
              }
          </style>
      </head>
      <body>
          <div class="invoice-container">
              <div class="main-content">
                  <div class="header">
                      <div class="company-info">
                          <h1>Your Company Name</h1>
                          <p><strong>123 Business Street</strong></p>
                          <p>Business City, BC 12345</p>
                          <p><strong>Phone:</strong> (555) 123-4567</p>
                          <p><strong>Email:</strong> info@yourcompany.com</p>
                          <p><strong>Website:</strong> www.yourcompany.com</p>
                      </div>
                      <div class="invoice-info">
                          <h2>INVOICE</h2>
                          <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
                          <p><strong>Date:</strong> ${invoice.date || new Date(invoice.createdAt).toLocaleDateString()}</p>
                          <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                          <p><strong>Terms:</strong> Net 30 Days</p>
                          <p><span class="status-badge status-${invoice.status}">${invoice.status.toUpperCase()}</span></p>
                      </div>
                  </div>

              <div class="customer-section">
                  <h3>Bill To:</h3>
                  <div class="customer-details">
                      <p><strong>${customer?.name}</strong></p>
                      ${customer?.company ? `<p><strong>Company:</strong> ${customer.company}</p>` : ''}
                      <p><strong>Phone:</strong> ${customer?.phone}</p>
                      <p><strong>Address:</strong> ${customer?.address}</p>
                      <p><span class="status-badge">${customer?.type ? customer.type.charAt(0).toUpperCase() + customer.type.slice(1) : 'Unknown'} Customer</span></p>
                  </div>
              </div>

              <table class="items-table">
                  <thead>
                      <tr>
                          <th style="width: 45%;">Description</th>
                          <th style="width: 20%;">SKU/Product</th>
                          <th style="width: 10%;" class="text-right">Qty</th>
                          <th style="width: 12%;" class="text-right">Unit Price</th>
                          <th style="width: 13%;" class="text-right">Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${invoice.items.map((item: any) => `
                          <tr>
                              <td>
                                  <div class="font-medium">${item.productName || 'Product'}</div>
                                  ${item.sku ? `<div style="color: #6b7280; font-size: 12px; margin-top: 4px;">SKU: ${item.sku}</div>` : ''}
                              </td>
                              <td><span class="font-medium">${item.sku || item.productId}</span></td>
                              <td class="text-right font-medium">${item.quantity}</td>
                              <td class="text-right">£{item.unitPrice.toFixed(2)}</td>
                              <td class="text-right font-medium">£{item.total.toFixed(2)}</td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>

              <div class="totals-section">
                  <div class="totals-row">
                      <span><strong>Subtotal:</strong></span>
                      <span class="font-medium">£{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  ${(invoice.discount && invoice.discount > 0) ? `
                      <div class="totals-row discount">
                          <span><strong>Discount:</strong></span>
                          <span class="font-medium">-£{invoice.discount.toFixed(2)}</span>
                      </div>
                  ` : ''}
                  ${invoice.tax > 0 ? `
                      <div class="totals-row">
                          <span><strong>Tax:</strong></span>
                          <span class="font-medium">£{invoice.tax.toFixed(2)}</span>
                      </div>
                  ` : ''}
                  <div class="totals-row total">
                      <span>TOTAL AMOUNT:</span>
                      <span>£{invoice.total.toFixed(2)}</span>
                  </div>
                  ${invoice.paymentStatus === 'partial' ? `
                      <div class="totals-row" style="color: #dc2626; margin-top: 10px;">
                          <span><strong>Payment Status:</strong></span>
                          <span class="font-medium">PARTIALLY PAID</span>
                      </div>
                  ` : ''}
                  ${invoice.paymentStatus === 'paid' ? `
                      <div class="totals-row" style="color: #059669; margin-top: 10px;">
                          <span><strong>Payment Status:</strong></span>
                          <span class="font-medium">PAID IN FULL</span>
                      </div>
                  ` : ''}
              </div>
              </div> <!-- End main-content -->

              <div class="footer">
                  <p><strong>Thank you for your business!</strong></p>
                  <p>Payment is due within 30 days of invoice date.</p>
                  <p>For questions about this invoice, please contact us at info@yourcompany.com or (555) 123-4567</p>
                  <p style="margin-top: 15px; font-size: 11px; color: #9ca3af;">
                      This invoice was generated electronically and is valid without signature.
                  </p>
                  ${invoice.notes ? `
                      <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 6px; text-align: left;">
                          <p style="font-weight: 600; margin-bottom: 8px;">Notes:</p>
                          <p style="font-size: 12px; color: #374151;">${invoice.notes}</p>
                      </div>
                  ` : ''}
              </div>
          </div>
          
          <script>
              // Auto-print when loaded
              window.onload = function() {
                  setTimeout(function() {
                      window.print();
                  }, 500);
              };
              
              // Close window after printing
              window.onafterprint = function() {
                  window.close();
              };
          </script>
      </body>
      </html>
    `;

    // Write the HTML content
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading customer profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <p className="text-muted-foreground">{customer.company}</p>
          </div>
        </div>
        <Button onClick={() => router.push('/dashboard/invoices/create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Total Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Outstanding Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">£{totalOutstanding.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Paid Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">£{totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customer Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="capitalize">{customer.type}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={clearPayment} variant="outline">
          <DollarSign className="h-4 w-4 mr-2" />
          Clear Payment
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search invoices by number or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>£{invoice.total.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(invoice.paymentStatus || 'unpaid')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditInvoice(invoice)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadInvoice(invoice)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDeleteInvoice(invoice)}
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

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update invoice details and payment status.
            </DialogDescription>
          </DialogHeader>
          {editingInvoice && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-number">Invoice Number</Label>
                  <Input
                    id="invoice-number"
                    value={editingInvoice.invoiceNumber}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      invoiceNumber: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="total">Total Amount</Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    value={editingInvoice.total}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      total: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingInvoice.status}
                    onValueChange={(value) => setEditingInvoice({
                      ...editingInvoice,
                      status: value as 'pending' | 'paid' | 'overdue'
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment-status">Payment Status</Label>
                  <Select
                    value={editingInvoice.paymentStatus || 'unpaid'}
                    onValueChange={(value) => setEditingInvoice({
                      ...editingInvoice,
                      paymentStatus: value as 'paid' | 'unpaid' | 'partial'
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editingInvoice.notes || ''}
                  onChange={(e) => setEditingInvoice({
                    ...editingInvoice,
                    notes: e.target.value
                  })}
                  placeholder="Add any notes about this invoice..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveInvoice}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice {deletingInvoice?.invoiceNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deletingInvoice && handleDeleteInvoice(deletingInvoice.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
