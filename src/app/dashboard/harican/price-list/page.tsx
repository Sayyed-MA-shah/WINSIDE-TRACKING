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
import { useHaricanAuth } from '@/lib/context/harican-auth';
import { useProducts } from '@/lib/stores/productStore';
import { Product as ProductType } from '@/lib/types';
import { ImageUploadService } from '@/lib/services/imageUploadService';
import { HaricanLayout } from '@/components/harican/HaricanLayout';

interface PriceListFilters {
  category: string;
  priceType: 'wholesale' | 'retail' | 'club';
  includeVariations: boolean;
  includeImages: boolean;
  search: string;
}

export default function HaricanPriceListPage() {
  const { user } = useHaricanAuth();
  const { products, isLoading } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<PriceListFilters>({
    category: 'all',
    priceType: 'retail',
    includeVariations: false,
    includeImages: true,
    search: ''
  });

  // Filter for Harican products only
  const haricanProducts = products.filter(product => product.brand === 'harican');

  // Initialize categories and apply filters
  useEffect(() => {
    initializeData();
  }, [haricanProducts]);

  useEffect(() => {
    applyFilters();
  }, [haricanProducts, filters]);

  const initializeData = () => {
    // Filter out archived products
    const activeProducts = haricanProducts.filter((product: ProductType) => !product.archived);
    
    // Extract unique categories from Harican products
    const uniqueCategories = [...new Set(activeProducts.map((p: ProductType) => p.category))].filter(Boolean) as string[];
    
    setCategories(uniqueCategories);
  };

  const applyFilters = () => {
    const variants: any[] = [];

    haricanProducts.forEach(product => {
      // Apply filters to main product first
      const matchesCategory = filters.category === 'all' || product.category === filters.category;
      const matchesSearch = !filters.search || 
        product.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.article.toLowerCase().includes(filters.search.toLowerCase());
      
      if (matchesCategory && matchesSearch) {
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
              mediaMain: product.mediaMain, // Include mediaMain field
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
          let totalStock = 0;
          
          if (product.variants && product.variants.length > 0) {
            // Sum up all variant quantities
            totalStock = product.variants.reduce((total, variant) => {
              return total + (variant.qty || 0);
            }, 0);
          }
            
          variants.push({
            id: product.id,
            article: product.article,
            title: product.title,
            sku: product.article, // Use article as SKU for main product
            category: product.category,
            brand: product.brand,
            mediaMain: product.mediaMain, // Include mediaMain field
            wholesale: product.wholesale,
            retail: product.retail,
            club: product.club,
            qty: totalStock, // Total stock from all variants
            attributes: {},
            variants: product.variants || [] // Keep original variants for reference
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
        return product.club || 0;
      default:
        return product.retail || 0;
    }
  };

  const getPriceTypeLabel = (): string => {
    switch (filters.priceType) {
      case 'wholesale':
        return 'Wholesale';
      case 'club':
        return 'Club';
      default:
        return 'Retail';
    }
  };

  const loadImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
    try {
      const optimizedUrl = ImageUploadService.optimizeImageUrl(imageUrl, 200);
      
      const response = await fetch(optimizedUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          const maxWidth = 150;
          const maxHeight = 150;
          
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            try {
              const base64 = canvas.toDataURL('image/jpeg', 0.8);
              resolve(base64);
            } catch (error) {
              console.error('Error converting image to base64:', error);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };
        
        img.onerror = () => {
          console.error('Error loading image:', optimizedUrl);
          resolve(null);
        };
        
        img.src = URL.createObjectURL(blob);
      });
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  };

  const generatePDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);
      
      let currentY = margin;
      const lineHeight = 6;
      const rowHeight = filters.includeImages ? 35 : 8;

      // Load and cache product images
      const imageCache: { [key: string]: string | null } = {};
      const productsWithImages = filteredProducts.filter(product => product.mediaMain && product.mediaMain.trim());
      
      if (filters.includeImages && productsWithImages.length > 0) {
        console.log('Loading product images...');
        
        for (let i = 0; i < productsWithImages.length; i++) {
          const product = productsWithImages[i];
          if (product.mediaMain && product.mediaMain.trim()) {
            try {
              const base64Image = await loadImageAsBase64(product.mediaMain);
              if (base64Image) {
                imageCache[product.id] = base64Image;
              }
            } catch (error) {
              console.error(`Failed to load image for product ${product.article}:`, error);
            }
          }
        }
      }

      // Helper function to add a new page
      const addNewPage = () => {
        pdf.addPage();
        currentY = margin;
        addHeader();
      };

      // Header function
      const addHeader = () => {
        // Company header
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('HARICAN', margin, currentY + 8);
        
        // Subtitle
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Product Price List', margin, currentY + 16);
        
        // Date
        pdf.setFontSize(10);
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, currentY + 8);
        
        // Price type
        pdf.text(`${getPriceTypeLabel()} Prices`, pageWidth - margin - 50, currentY + 16);
        
        currentY += 25;
        
        // Horizontal line
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        
        currentY += 8;
      };

      // Add initial header
      addHeader();

      // Filter info
      if (filters.category !== 'all' || filters.search) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        
        let filterText = 'Filters: ';
        if (filters.category !== 'all') filterText += `Category: ${filters.category} `;
        if (filters.search) filterText += `Search: ${filters.search} `;
        
        pdf.text(filterText, margin, currentY);
        currentY += lineHeight + 2;
      }

      // Products header
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Products:', margin, currentY);
      currentY += lineHeight + 2;

      // Table headers
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      
      let colX = margin;
      const imageColWidth = filters.includeImages ? 35 : 0;
      const articleColWidth = 20;
      const nameColWidth = contentWidth - imageColWidth - articleColWidth - 25;
      const priceColWidth = 25;
      
      if (filters.includeImages) {
        pdf.text('Image', colX, currentY);
        colX += imageColWidth;
      }
      
      pdf.text('Article', colX, currentY);
      colX += articleColWidth;
      
      pdf.text('Product Name', colX, currentY);
      colX += nameColWidth;
      
      pdf.text('Price', colX, currentY);
      
      currentY += lineHeight;
      
      // Header line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 3;

      // Products
      pdf.setFont('helvetica', 'normal');
      
      filteredProducts.forEach((product, index) => {
        // Check if we need a new page
        if (currentY + rowHeight > pageHeight - margin) {
          addNewPage();
        }
        
        const startY = currentY;
        colX = margin;
        
        // Image column
        if (filters.includeImages) {
          const imageData = imageCache[product.id];
          if (imageData) {
            try {
              pdf.addImage(imageData, 'JPEG', colX + 2, currentY, 25, 25);
            } catch (error) {
              console.error('Error adding image to PDF:', error);
            }
          }
          colX += imageColWidth;
        }
        
        // Article
        pdf.text(product.article || '', colX, currentY + (filters.includeImages ? 12 : 4));
        colX += articleColWidth;
        
        // Product name (with text wrapping)
        const productName = product.title || '';
        const maxNameWidth = nameColWidth - 5;
        const nameLines = pdf.splitTextToSize(productName, maxNameWidth);
        const nameY = currentY + (filters.includeImages ? 12 : 4);
        
        nameLines.slice(0, filters.includeImages ? 3 : 1).forEach((line: string, i: number) => {
          pdf.text(line, colX, nameY + (i * 4));
        });
        colX += nameColWidth;
        
        // Price
        const price = getPrice(product);
        pdf.text(`£${price.toFixed(2)}`, colX, currentY + (filters.includeImages ? 12 : 4));
        
        currentY += rowHeight;
        
        // Row separator line
        if (index < filteredProducts.length - 1) {
          pdf.setDrawColor(240, 240, 240);
          pdf.setLineWidth(0.1);
          pdf.line(margin, currentY - 2, pageWidth - margin, currentY - 2);
        }
      });

      // Footer
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
        pdf.text('HARICAN Product Catalog', margin, pageHeight - 10);
      }

      // Save the PDF
      const fileName = `harican-price-list-${filters.priceType}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <HaricanLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading Harican products...</div>
        </div>
      </HaricanLayout>
    );
  }

  return (
    <HaricanLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Harican Price Lists</h1>
            <p className="text-muted-foreground">
              Generate professional price lists for Harican products
            </p>
          </div>
          <Button onClick={generatePDF} disabled={filteredProducts.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Price List Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
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

              <div className="space-y-2">
                <Label htmlFor="priceType">Price Type</Label>
                <Select value={filters.priceType} onValueChange={(value) => handleFilterChange('priceType', value as 'wholesale' | 'retail' | 'club')}>
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

              <div className="space-y-2">
                <Label htmlFor="search">Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.includeVariations}
                      onChange={(e) => handleFilterChange('includeVariations', e.target.checked)}
                    />
                    <span className="text-sm">Show Variations</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.includeImages}
                      onChange={(e) => handleFilterChange('includeImages', e.target.checked)}
                    />
                    <span className="text-sm">Include Images</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredProducts.length}</div>
              <p className="text-xs text-muted-foreground">
                Harican products in list
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filters.category === 'all' ? categories.length : 1}
              </div>
              <p className="text-xs text-muted-foreground">
                Product categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Price Range</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{filteredProducts.length > 0 ? Math.min(...filteredProducts.map(p => getPrice(p))).toFixed(2) : '0.00'} - 
                £{filteredProducts.length > 0 ? Math.max(...filteredProducts.map(p => getPrice(p))).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                {getPriceTypeLabel()} prices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Images</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredProducts.filter(p => p.mediaMain && p.mediaMain.trim()).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Products with images
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Price List Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Harican products found</h3>
                <p className="text-gray-500">
                  Adjust your filters to see Harican products.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-4 font-medium border-b pb-2">
                  {filters.includeImages && <div className="col-span-2">Image</div>}
                  <div className={filters.includeImages ? "col-span-2" : "col-span-3"}>Article</div>
                  <div className={filters.includeImages ? "col-span-6" : "col-span-7"}>Product Name</div>
                  <div className="col-span-2">Price</div>
                </div>
                {filteredProducts.slice(0, 10).map((product, index) => (
                  <div key={product.id} className="grid grid-cols-12 gap-4 py-2 border-b border-gray-100">
                    {filters.includeImages && (
                      <div className="col-span-2">
                        {product.mediaMain ? (
                          <img 
                            src={product.mediaMain} 
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className={filters.includeImages ? "col-span-2" : "col-span-3"}>
                      <Badge variant="outline">{product.article}</Badge>
                    </div>
                    <div className={filters.includeImages ? "col-span-6" : "col-span-7"}>
                      {product.title}
                    </div>
                    <div className="col-span-2 font-medium">
                      £{getPrice(product).toFixed(2)}
                    </div>
                  </div>
                ))}
                {filteredProducts.length > 10 && (
                  <div className="text-center py-4 text-gray-500">
                    ... and {filteredProducts.length - 10} more products
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HaricanLayout>
  );
}