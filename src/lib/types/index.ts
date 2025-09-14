export interface Variant {
  id: string;
  productId: string;
  sku: string;
  attributes: Record<string, string>; // e.g., { Size: "10oz", Color: "RED" }
  qty: number;
  // Optional pricing overrides - if not provided, uses product's global pricing
  wholesale?: number;
  retail?: number;
  club?: number;
  costBefore?: number;
  costAfter?: number;
}

export type Brand = 'greenhil' | 'harican' | 'byko';

export interface BrandStats {
  brand: Brand;
  totalProducts: number;
  lowStockCount: number;
  stockValue: number;
  totalInvoices: number;
  totalRevenue: number;
  pendingInvoices: number;
  // Potential revenue from current stock
  potentialWholesaleRevenue: number; // (wholesale - costAfter) * stock
  potentialRetailRevenue: number;    // (retail - costAfter) * stock  
  potentialClubRevenue: number;      // (club - costAfter) * stock
  lowStockProducts: Array<{
    name: string;
    stock: number;
    minStock: number;
  }>;
}

export interface Product {
  id: string;
  article: string; // required, unique; e.g., BGC-1011
  title: string; // required
  category: string; // required
  brand: 'greenhil' | 'harican' | 'byko'; // required brand selection
  taxable: boolean; // default true
  attributes: string[]; // array of attribute names, e.g., ["Size","Color"]
  mediaMain?: string; // optional image URL
  archived: boolean; // default false
  // Global pricing for all variants
  wholesale: number;
  retail: number;
  club: number;
  costBefore: number;
  costAfter: number;
  createdAt: Date;
  updatedAt: Date;
  variants: Variant[]; // array of variants
}

// Legacy Product interface for backward compatibility
export interface LegacyProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Stock {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  location: string;
  lastUpdated: Date;
}

export interface Customer {
  id: string;
  name: string;
  email?: string; // Added email field
  phone: string;
  company?: string; // Optional company field
  address: string; // Simplified to single address field
  type: 'retail' | 'wholesale' | 'club'; // Customer type
  createdAt: Date;
  totalOrders: number;
  totalSpent: number;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName?: string; // Added product name field
  sku?: string; // Added SKU field
  product?: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poNumber?: string; // Added PO/reference number field
  customerId: string;
  customerName?: string; // Added customer name field
  customer?: Customer;
  date?: string; // Added date field for display
  items: InvoiceItem[];
  subtotal: number;
  discount?: number; // Added discount field
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus?: 'paid' | 'unpaid' | 'partial'; // Added payment status field
  paidAmount?: number; // Added paid amount field
  dueDate: Date;
  notes?: string; // Added notes field
  createdAt: Date;
  paidAt?: Date;
}

export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalInvoices: number;
  totalRevenue: number;
  lowStockItems: number;
  pendingInvoices: number;
}
