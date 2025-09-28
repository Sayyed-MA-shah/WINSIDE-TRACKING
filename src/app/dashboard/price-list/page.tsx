'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Receipt, 
  Download, 
  Filter,
  Package,
  DollarSign,
  Search,
  RefreshCw,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProducts } from '@/lib/stores/productStore';
import { Product as ProductType } from '@/lib/types';



interface PriceListFilters {
  category: string;
  priceType: 'retail' | 'wholesale' | 'club';
  brand: string;
  search: string;
  includeVariations: boolean;
}

export default function PriceListPage() {
  const { user } = useAuth();
  const { products, isLoading } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [filters, setFilters] = useState<PriceListFilters>({
    category: 'all',
    priceType: 'retail',
    brand: 'all',
    search: '',
    includeVariations: true // Default to include variations (current behavior)
  });

  useEffect(() => {
    if (user && products.length > 0) {
      initializeData();
    }
  }, [user, products]);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const initializeData = () => {
    // Filter out archived products
    const activeProducts = products.filter((product: ProductType) => !product.archived);
    
    // Extract unique categories and brands
    const uniqueCategories = [...new Set(activeProducts.map((p: ProductType) => p.category))].filter(Boolean) as string[];
    const uniqueBrands = [...new Set(activeProducts.map((p: ProductType) => p.brand))].filter(Boolean) as string[];
    
    setCategories(uniqueCategories);
    setBrands(uniqueBrands);
  };

  const applyFilters = () => {
    const variants: any[] = [];

    products.forEach(product => {
      // Apply filters to main product first
      const matchesCategory = filters.category === 'all' || product.category === filters.category;
      const matchesBrand = filters.brand === 'all' || product.brand === filters.brand;
      const matchesSearch = !filters.search || 
        product.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.article.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.brand.toLowerCase().includes(filters.search.toLowerCase());
      
      if (matchesCategory && matchesBrand && matchesSearch) {
        if (filters.includeVariations && product.variants && product.variants.length > 0) {
          // Add all variants of this product
          product.variants.forEach(variant => {
            variants.push({
              id: `${product.id}-${variant.sku}`,
              article: product.article,
              title: product.title,
              sku: variant.sku,
              category: product.category,
              brand: product.brand,
              // Use variant pricing if available, otherwise product pricing
              wholesale: variant.wholesale ?? product.wholesale,
              retail: variant.retail ?? product.retail,
              club: variant.club ?? product.club,
              qty: variant.qty,
              attributes: variant.attributes || {},
              // Keep getPrice compatible
              variants: [variant] // Single variant for getPrice function
            });
          });
        } else {
          // Add only the main product (without variations) or if no variants exist
          variants.push({
            id: product.id,
            article: product.article,
            title: product.title,
            sku: product.article, // Use article as SKU for main product
            category: product.category,
            brand: product.brand,
            wholesale: product.wholesale,
            retail: product.retail,
            club: product.club,
            qty: 0,
            attributes: {},
            variants: [] // Empty variants array
          });
        }
      }
    });

    // Sort by title, then by SKU
    variants.sort((a, b) => {
      const titleCompare = a.title.localeCompare(b.title);
      if (titleCompare === 0) {
        return a.sku.localeCompare(b.sku);
      }
      return titleCompare;
    });

    setFilteredProducts(variants);
  };

  const handleFilterChange = (key: keyof PriceListFilters, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getPrice = (product: ProductType): number => {
    switch (filters.priceType) {
      case 'wholesale':
        return product.wholesale || 0;
      case 'club':
        return product.club || product.wholesale || 0;
      case 'retail':
      default:
        return product.retail || 0;
    }
  };

  const getPriceLabel = (): string => {
    return 'PRICE';
  };

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Function to load logo as base64
  const loadLogoAsBase64 = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Canvas context not available'));
        }
      };
      img.onerror = () => reject(new Error('Logo failed to load'));
      img.src = '/assets/BYKO-LOGO.png';
    });
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10; // Minimal margins for maximum table space
      const contentWidth = pageWidth - (2 * margin); // 190mm available width
      const contentHeight = pageHeight - (2 * margin);
      
      const categoryText = filters.category === 'all' ? 'All Categories' : filters.category;
      const priceTypeText = filters.priceType.charAt(0).toUpperCase() + filters.priceType.slice(1);
      
      // Helper function to extract color and size from SKU
      const getColorAndSize = (sku: string): string => {
        const parts = sku.split('-');
        if (parts.length >= 3) {
          // Return everything after the second hyphen (color and size)
          return parts.slice(2).join('-');
        }
        return sku; // Return full SKU if format doesn't match expected pattern
      };

      // Try to load logo
      let logoBase64: string | undefined;
      try {
        logoBase64 = await loadLogoAsBase64();
      } catch (error) {
        console.log('Logo not available, proceeding without it');
      }
      
      let currentY = margin;
      let currentPage = 1;
      
      // Calculate column widths based on variations setting and RRP requirement
      const needsRRPColumn = filters.priceType === 'wholesale' || filters.priceType === 'club';
      const includeSKU = filters.includeVariations; // Only show SKU when showing variations
      
      let colWidths: number[];
      if (includeSKU && needsRRPColumn) {
        colWidths = [20, 55, 40, 30, 22, 22]; // Article, Product, SKU, Category, Wholesale, RRP (Total: 189mm)
      } else if (includeSKU && !needsRRPColumn) {
        colWidths = [28, 60, 43, 32, 25]; // Article, Product, SKU, Category, Price (Total: 188mm)
      } else if (!includeSKU && needsRRPColumn) {
        colWidths = [25, 80, 40, 22, 22]; // Article, Product, Category, Wholesale, RRP (Total: 189mm)
      } else {
        colWidths = [35, 85, 40, 25]; // Article, Product, Category, Price (Total: 185mm)
      }
      
      // Header function (only for first page)
      const addFirstPageHeader = (logoData?: string) => {
        // Add logo if available
        if (logoData) {
          const logoWidth = 20; // 20mm width
          const logoHeight = 15; // 15mm height
          pdf.addImage(logoData, 'PNG', margin, currentY + 2, logoWidth, logoHeight);
          
          // Company name next to logo
          pdf.setFontSize(20);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(15, 23, 42);
          pdf.text('BYKO SPORTS', margin + logoWidth + 5, currentY + 15);
        } else {
          // Fallback without logo
          pdf.setFontSize(20);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(15, 23, 42);
          pdf.text('BYKO SPORTS', margin, currentY + 15);
        }
        
        // Document title
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(71, 85, 105);
        pdf.text('PRICE LIST', pageWidth - margin - 40, currentY + 15);
        
        // Date
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        const dateText = new Date().toLocaleDateString('en-GB', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        pdf.text(`Generated: ${dateText}`, pageWidth - margin - 60, currentY + 25);
        
        // Blue line
        pdf.setDrawColor(59, 130, 246);
        pdf.setLineWidth(1);
        pdf.line(margin, currentY + 35, pageWidth - margin, currentY + 35);
        
        currentY += 50;
        
        // Filter information box (removed pricing type)
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, currentY, contentWidth, 20, 'F');
        
        // Blue left border
        pdf.setFillColor(59, 130, 246);
        pdf.rect(margin, currentY, 2, 20, 'F');
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(71, 85, 105);
        
        let filterX = margin + 10;
        pdf.text('CATEGORY:', filterX, currentY + 8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(15, 23, 42);
        pdf.text(categoryText, filterX + 25, currentY + 8);
        
        filterX += 80;
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(71, 85, 105);
        pdf.text('TOTAL PRODUCTS:', filterX, currentY + 8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(15, 23, 42);
        pdf.text(filteredProducts.length.toString(), filterX + 35, currentY + 8);
        
        currentY += 35;
      };
      
      // Simple header for subsequent pages
      const addSimpleHeader = () => {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(71, 85, 105);
        pdf.text('BYKO SPORTS - PRICE LIST', margin, currentY + 15);
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        pdf.text(categoryText, pageWidth - margin - 40, currentY + 15);
        
        // Simple line
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.5);
        pdf.line(margin, currentY + 20, pageWidth - margin, currentY + 20);
        
        currentY += 30;
      };
      
      // Table header function
      const addTableHeader = () => {
        // Header background
        pdf.setFillColor(15, 23, 42);
        pdf.rect(margin, currentY, contentWidth, 12, 'F');
        
        // Add column separators for better visual structure
        pdf.setDrawColor(255, 255, 255);
        pdf.setLineWidth(0.2);
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        
        let colX = margin + 2;
        let colIndex = 0;
        
        pdf.text('ARTICLE', colX, currentY + 8);
        colX += colWidths[colIndex++];
        
        // Vertical separator
        pdf.line(colX, currentY, colX, currentY + 12);
        
        pdf.text('PRODUCT NAME', colX + 2, currentY + 8);
        colX += colWidths[colIndex++];
        
        // Vertical separator
        pdf.line(colX, currentY, colX, currentY + 12);
        
        // Only show SKU column if including variations
        if (includeSKU) {
          pdf.text('SKU', colX + 2, currentY + 8);
          colX += colWidths[colIndex++];
          
          // Vertical separator
          pdf.line(colX, currentY, colX, currentY + 12);
        }
        
        pdf.text('CATEGORY', colX + 2, currentY + 8);
        colX += colWidths[colIndex++];
        
        // Vertical separator
        pdf.line(colX, currentY, colX, currentY + 12);
        
        // Price header
        const priceLabel = filters.priceType === 'wholesale' ? 'WHOLESALE (£)' : 
                          filters.priceType === 'club' ? 'CLUB PRICE (£)' : 'PRICE (£)';
        
        // Use smaller font for longer headers
        if (priceLabel.length > 10) {
          pdf.setFontSize(7);
        }
        pdf.text(priceLabel, colX + 2, currentY + 8);
        if (priceLabel.length > 10) {
          pdf.setFontSize(8); // Reset font size
        }
        colX += colWidths[colIndex++];
        
        // Add RRP column for wholesale and club
        if (needsRRPColumn) {
          // Vertical separator
          pdf.line(colX, currentY, colX, currentY + 12);
          
          pdf.text('RRP (£)', colX + 2, currentY + 8);
        }
        
        currentY += 12;
      };
      
      // Footer function
      const addFooter = () => {
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(71, 85, 105);
        pdf.text('BYKO SPORTS', margin, pageHeight - 20);
        
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(148, 163, 184);
        pdf.text('Professional Sports Equipment', margin, pageHeight - 15);
        
        pdf.setFontSize(7);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Document generated on ${new Date().toLocaleString('en-GB')}`, pageWidth - margin - 60, pageHeight - 20);
        
        pdf.setFontSize(6);
        pdf.setTextColor(148, 163, 184);
        pdf.text('For internal use only', pageWidth - margin - 30, pageHeight - 15);
        
        // Page numbers
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        const totalPages = Math.ceil(filteredProducts.length / 25) + 1; // Rough estimate
        pdf.text(`Page ${currentPage}`, pageWidth - margin - 20, pageHeight - 10);
      };
      
      // Start first page  
      addFirstPageHeader(logoBase64);
      addTableHeader();
      
      // Add products
      const rowHeight = 8;
      
      filteredProducts.forEach((product, index) => {
        // Check if we need a new page
        if (currentY + rowHeight > pageHeight - 50) {
          addFooter();
          pdf.addPage();
          currentPage++;
          currentY = margin;
          addSimpleHeader();
          addTableHeader();
        }
        
        // Row background
        if (index % 2 === 1) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
        }
        
        // Light column separators
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.1);
        
        // Row data
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        
        let colX = margin + 2;
        let colIndex = 0;
        
        // Article
        pdf.setTextColor(71, 85, 105);
        pdf.setFont('helvetica', 'bold');
        pdf.text(product.article, colX, currentY + 5);
        colX += colWidths[colIndex++];
        
        // Vertical separator
        pdf.line(colX, currentY, colX, currentY + rowHeight);
        
        // Product name (truncate to fit column width)
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'normal');
        const productName = product.title.length > 32 ? product.title.substring(0, 32) + '...' : product.title;
        pdf.text(productName, colX + 2, currentY + 5);
        colX += colWidths[colIndex++];
        
        // Vertical separator
        pdf.line(colX, currentY, colX, currentY + rowHeight);
        
        // SKU (show only color and size part) - only if including variations
        if (includeSKU) {
          pdf.setTextColor(100, 116, 139);
          pdf.text(getColorAndSize(product.sku), colX + 2, currentY + 5);
          colX += colWidths[colIndex++];
          
          // Vertical separator
          pdf.line(colX, currentY, colX, currentY + rowHeight);
        }
        
        // Category (truncate if too long)
        pdf.setTextColor(100, 116, 139);
        const categoryName = product.category.length > 12 ? product.category.substring(0, 12) + '...' : product.category;
        pdf.text(categoryName, colX + 2, currentY + 5);
        colX += colWidths[colIndex++];
        
        // Vertical separator
        pdf.line(colX, currentY, colX, currentY + rowHeight);
        
        // Price (right-aligned within column)
        pdf.setTextColor(16, 185, 129);
        pdf.setFont('helvetica', 'bold');
        const priceText = `£${getPrice(product).toFixed(2)}`;
        pdf.text(priceText, colX + colWidths[colIndex] - 15, currentY + 5);
        colX += colWidths[colIndex++];
        
        // Add RRP column for wholesale and club
        if (needsRRPColumn) {
          // Vertical separator
          pdf.line(colX, currentY, colX, currentY + rowHeight);
          
          // RRP (Retail Recommended Price)
          pdf.setTextColor(75, 85, 99);
          pdf.setFont('helvetica', 'normal');
          const rrpText = `£${(product.retail || 0).toFixed(2)}`;
          pdf.text(rrpText, colX + colWidths[colIndex] - 15, currentY + 5);
        }
        
        currentY += rowHeight;
      });
      
      // Add final footer
      addFooter();
      
      const filename = `price-list-${filters.priceType}-${categoryText.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExport = () => {
    const needsRRPColumn = filters.priceType === 'wholesale' || filters.priceType === 'club';
    const includeSKU = filters.includeVariations; // Only show SKU when showing variations
    
    const headers = ['Article', 'Product Name'];
    if (includeSKU) {
      headers.push('SKU');
    }
    headers.push('Category', getPriceLabel());
    if (needsRRPColumn) {
      headers.push('RRP');
    }
    headers.push('Stock');
    
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map((product: any) => {
        const row = [
          product.article,
          `"${product.title}"`
        ];
        if (includeSKU) {
          row.push(product.sku);
        }
        row.push(
          product.category,
          getPrice(product).toFixed(2)
        );
        if (needsRRPColumn) {
          row.push((product.retail || 0).toFixed(2));
        }
        row.push(product.qty.toString());
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const categoryText = filters.category === 'all' ? 'All Categories' : filters.category;
    const filename = `price-list-${filters.priceType}-${categoryText.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please log in to access price lists</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="h-6 w-6" />
            Generate Price List
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create customized price lists by category and pricing type
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={generatePDF} 
            variant="default" 
            size="sm"
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            {isGeneratingPDF ? 'Generating PDF...' : 'Generate PDF'}
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Price List Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Type Filter */}
            <div className="space-y-2">
              <Label>Price Type</Label>
              <Select value={filters.priceType} onValueChange={(value) => handleFilterChange('priceType', value as 'retail' | 'wholesale' | 'club')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail Price</SelectItem>
                  <SelectItem value="wholesale">Wholesale Price</SelectItem>
                  <SelectItem value="club">Club Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <Label>Brand</Label>
              <Select value={filters.brand} onValueChange={(value) => handleFilterChange('brand', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search products..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Variations Toggle */}
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Product Display</Label>
              <Select 
                value={filters.includeVariations ? 'variations' : 'main'} 
                onValueChange={(value) => handleFilterChange('includeVariations', value === 'variations')}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select display type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Products Only</SelectItem>
                  <SelectItem value="variations">Include All Variations</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {filters.includeVariations ? 
                  'Showing all product variations with individual colors and sizes' : 
                  'Showing only main products without variations'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Price List Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Price List - {getPriceLabel()}
            </span>
            <Badge variant="secondary">
              {filters.category === 'all' ? 'All Categories' : filters.category}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No products found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Article</th>
                    <th className="text-left py-3 px-4 font-semibold w-1/4">Product Name</th>
                    <th className="text-left py-3 px-4 font-semibold w-32">SKU</th>
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-right py-3 px-4 font-semibold">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="h-4 w-4" />
                        {getPriceLabel()}
                      </div>
                    </th>
                    {(filters.priceType === 'wholesale' || filters.priceType === 'club') && (
                      <th className="text-right py-3 px-4 font-semibold">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="h-4 w-4" />
                          RRP
                        </div>
                      </th>
                    )}
                    <th className="text-center py-3 px-4 font-semibold">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr 
                      key={product.id} 
                      className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {product.article}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {product.title}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600 dark:text-gray-400">
                          {product.sku}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {product.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          £{getPrice(product).toFixed(2)}
                        </span>
                      </td>
                      {(filters.priceType === 'wholesale' || filters.priceType === 'club') && (
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-gray-600 dark:text-gray-400">
                            £{(product.retail || 0).toFixed(2)}
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-4 text-center">
                        <Badge 
                          variant={product.qty > 0 ? "default" : "secondary"}
                          className={product.qty === 0 ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" : ""}
                        >
                          {product.qty}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}