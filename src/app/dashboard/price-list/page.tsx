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
import { ImageUploadService } from '@/lib/services/imageUploadService';



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
  
  // Alert to make sure our changes are working
  console.log('🚨 PRICE LIST DEBUG: Component loaded with products:', products.length);
  console.log('🚨 PRICE LIST DEBUG: Sample products:', products.slice(0, 3).map(p => ({
    article: p?.article,
    mediaMain: p?.mediaMain,
    hasMediaMain: !!p?.mediaMain,
    keys: Object.keys(p || {})
  })));
  
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  
  // Debug what we're getting from the store
  useEffect(() => {
    console.log('🎯 PriceList useEffect triggered with:', {
      productsLength: products.length,
      isLoading,
      hasProducts: products.length > 0
    });
    
    if (products.length > 0) {
      console.log('🎯 PriceList: First product structure:', {
        keys: Object.keys(products[0]),
        article: products[0].article,
        mediaMain: products[0].mediaMain,
        hasMediaMain: !!products[0].mediaMain
      });
      
      const productsWithImages = products.filter(product => product.mediaMain && product.mediaMain.trim());
      console.log('🎯 PriceList: Products from store with mediaMain:', productsWithImages.length, 'out of', products.length);
      
      if (productsWithImages.length > 0) {
        console.log('🎯 PriceList: Sample product with image from store:', {
          article: productsWithImages[0].article,
          mediaMain: productsWithImages[0].mediaMain
        });
      }
    }
  }, [products, isLoading]);
  
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
    console.log('Applying filters with includeVariations:', filters.includeVariations);

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
              mediaMain: product.mediaMain, // ✅ Fixed: Include mediaMain field
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
          console.log('Processing main product:', product.article, 'variants:', product.variants?.length);
          
          // Calculate total stock from all variants - same logic as when showing variations
          let totalStock = 0;
          
          if (product.variants && product.variants.length > 0) {
            // Sum up all variant quantities
            totalStock = product.variants.reduce((total, variant) => {
              console.log('Variant qty:', variant.qty);
              return total + (variant.qty || 0);
            }, 0);
            console.log('Total stock calculated:', totalStock);
          }
            
          variants.push({
            id: product.id,
            article: product.article,
            title: product.title,
            sku: product.article, // Use article as SKU for main product
            category: product.category,
            brand: product.brand,
            mediaMain: product.mediaMain, // ✅ Fixed: Include mediaMain field
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
      const margin = 15; // Increased margins for better presentation
      const contentWidth = pageWidth - (2 * margin); // 180mm available width
      const contentHeight = pageHeight - (2 * margin);
      
      const categoryText = filters.category === 'all' ? 'All Categories' : filters.category;
      const priceTypeText = filters.priceType.charAt(0).toUpperCase() + filters.priceType.slice(1);
      
      // Professional color scheme
      const colors = {
        primary: [30, 64, 175], // Deep blue
        secondary: [148, 163, 184], // Light gray
        accent: [16, 185, 129], // Green for prices
        background: [248, 250, 252], // Very light blue-gray
        text: {
          primary: [15, 23, 42], // Dark blue-gray
          secondary: [71, 85, 105], // Medium gray
          muted: [148, 163, 184] // Light gray
        }
      };
      
      // Helper function to extract color and size from SKU
      const getColorAndSize = (sku: string): string => {
        const parts = sku.split('-');
        if (parts.length >= 3) {
          // Return everything after the second hyphen (color and size)
          return parts.slice(2).join('-');
        }
        return sku; // Return full SKU if format doesn't match expected pattern
      };

      // Enhanced image loading for both uploaded and external images
      const loadImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
        try {
          if (!imageUrl) {
            console.log('❌ No image URL provided');
            return null;
          }
          
          console.log('🔄 Loading image:', imageUrl);
          
          // Optimize Supabase images for PDF
          const optimizedUrl = ImageUploadService.optimizeImageUrl(imageUrl, 200, 200);
          console.log('🔄 Optimized URL:', optimizedUrl);
          
          // Check image source type
          const isSupabaseImage = imageUrl.includes('supabase');
          const isBykoImage = imageUrl.includes('byko.co.uk');
          
          console.log('📍 Image type:', { isSupabaseImage, isBykoImage });
          
          // Method 1: Try fetch for Supabase and Byko images
          if (isSupabaseImage || isBykoImage) {
            try {
              console.log('🌐 Trying fetch method...');
              const response = await fetch(optimizedUrl, { 
                mode: 'cors',
                credentials: 'omit',
                headers: {
                  'Accept': 'image/*'
                }
              });
              
              console.log('📡 Fetch response status:', response.status);
              
              if (response.ok) {
                const blob = await response.blob();
                console.log('📦 Blob created, size:', blob.size);
                
                return new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    console.log('✅ Image loaded via fetch:', optimizedUrl);
                    resolve(reader.result as string);
                  };
                  reader.onerror = (error) => {
                    console.log('❌ FileReader error:', error);
                    resolve(null);
                  };
                  reader.readAsDataURL(blob);
                });
              } else {
                console.log('❌ Fetch failed with status:', response.status);
              }
            } catch (fetchError) {
              console.log('❌ Fetch error:', fetchError);
            }
          }
          
          // Method 2: Fallback to image element loading
          console.log('🖼️ Trying image element method...');
          return new Promise((resolve) => {
            const img = new Image();
            
            img.onload = () => {
              try {
                console.log('🖼️ Image element loaded, size:', img.width, 'x', img.height);
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  console.log('❌ Canvas context not available');
                  resolve(null);
                  return;
                }
                
                // Optimize image size for PDF
                const maxWidth = 200;
                const scale = Math.min(maxWidth / img.width, maxWidth / img.height);
                const width = img.width * scale;
                const height = img.height * scale;
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                console.log('✅ Image processed via canvas:', optimizedUrl);
                resolve(dataURL);
              } catch (canvasError) {
                console.log('❌ Canvas conversion failed:', canvasError);
                resolve(null);
              }
            };
            
            img.onerror = (error) => {
              console.log('❌ Image element loading failed:', optimizedUrl, error);
              resolve(null);
            };
            
            // Set CORS for external images
            if (!isSupabaseImage) {
              img.crossOrigin = 'anonymous';
            }
            
            img.src = optimizedUrl;
            
            // Timeout after 8 seconds
            setTimeout(() => {
              console.log('⏱️ Image loading timeout:', optimizedUrl);
              resolve(null);
            }, 8000);
          });
        } catch (error) {
          console.log('❌ Complete failure loading image:', error, imageUrl);
          return null;
        }
      };

      // Pre-load all product images with enhanced debugging
      const imageCache: { [key: string]: string | null } = {};
      
      console.log('📊 Filtered products sample:', filteredProducts.slice(0, 3).map(p => ({
        article: p.article,
        mediaMain: p.mediaMain,
        hasMediaMain: !!p.mediaMain
      })));
      
      const productsWithImages = filteredProducts.filter(product => product.mediaMain && product.mediaMain.trim());
      
      console.log('📊 Products with images:', productsWithImages.length, 'out of', filteredProducts.length);
      
      if (productsWithImages.length > 0) {
        console.log('🖼️ Products with images:', productsWithImages.map(p => ({
          article: p.article,
          title: p.title,
          imageUrl: p.mediaMain
        })));
      }
      
      const imageLoadPromises = productsWithImages.map(async (product: any) => {
        console.log('🔄 Processing image for product:', product.article, 'URL:', product.mediaMain);
        const imageData = await loadImageAsBase64(product.mediaMain);
        imageCache[product.id] = imageData;
        console.log('📋 Image result for', product.article, ':', imageData ? 'SUCCESS ✅' : 'FAILED ❌');
        return { productId: product.id, success: !!imageData };
      });
      
      // Wait for all images to load
      console.log('⏳ Loading', imageLoadPromises.length, 'product images...');
      const results = await Promise.all(imageLoadPromises);
      const successCount = results.filter(r => r.success).length;
      console.log('📈 Image loading complete! Success:', successCount, '/', results.length);
      console.log('💾 Image cache contents:', Object.keys(imageCache).length, 'items');
      
      // Debug: Show which images were loaded successfully
      Object.entries(imageCache).forEach(([productId, imageData]) => {
        const product = filteredProducts.find(p => p.id === productId);
        console.log('🎯', product?.article, ':', imageData ? 'HAS IMAGE ✅' : 'NO IMAGE ❌');
      });

      // Try to load logo
      let logoBase64: string | undefined;
      try {
        logoBase64 = await loadLogoAsBase64();
      } catch (error) {
        console.log('Logo not available, proceeding without it');
      }
      
      let currentY = margin;
      let currentPage = 1;
      
      // Calculate column widths - Professional spacing
      const needsRRPColumn = filters.priceType === 'wholesale' || filters.priceType === 'club';
      const includeSKU = filters.includeVariations;
      const imageColumnWidth = 18; // Slightly smaller for more text space
      
      // Helper function to get unique sizes from product variants
      const getProductSizes = (product: any): string => {
        if (!product.variants || product.variants.length === 0) return '--';
        const sizes = [...new Set(product.variants.map((v: any) => v.attributes?.Size || v.attributes?.size).filter(Boolean))];
        return sizes.join(', ') || '--';
      };

      // Helper function to get unique colors from product variants
      const getProductColors = (product: any): string => {
        if (!product.variants || product.variants.length === 0) return '--';
        const colors = [...new Set(product.variants.map((v: any) => v.attributes?.Color || v.attributes?.color).filter(Boolean))];
        return colors.join(', ') || '--';
      };

      // Conservative text wrapping to prevent unprofessional line breaks
      const wrapText = (text: string, maxWidth: number, fontSize: number = 9): string[] => {
        if (!text || text === '--') return [text || '--'];
        
        pdf.setFontSize(fontSize);
        
        // For very narrow columns (price columns), don't wrap - just truncate if needed
        if (maxWidth < 20) {
          const textWidth = pdf.getTextWidth(text);
          if (textWidth <= maxWidth - 4) {
            return [text];
          } else {
            // Truncate with ellipsis for narrow columns
            let truncated = text;
            while (pdf.getTextWidth(truncated + '...') > maxWidth - 4 && truncated.length > 1) {
              truncated = truncated.slice(0, -1);
            }
            return [truncated + (truncated !== text ? '...' : '')];
          }
        }
        
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = pdf.getTextWidth(testLine);
          
          if (textWidth <= maxWidth - 6) { // Account for padding
            currentLine = testLine;
          } else {
            if (currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              // Single word too long, truncate with ellipsis
              let truncated = word;
              while (pdf.getTextWidth(truncated + '...') > maxWidth - 6 && truncated.length > 1) {
                truncated = truncated.slice(0, -1);
              }
              lines.push(truncated + (truncated !== word ? '...' : ''));
              currentLine = '';
            }
          }
        }
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        // Limit to maximum 3 lines for professional appearance
        return lines.slice(0, 3);
      };

      // Enhanced text rendering with proper line spacing
      const renderMultiLineText = (lines: string[], x: number, y: number, lineHeight: number = 3, alignment: 'left' | 'center' | 'right' = 'left', colWidth?: number) => {
        lines.forEach((line, index) => {
          const lineY = y + (index * lineHeight);
          let textX = x;
          
          if (alignment === 'center' && colWidth) {
            const textWidth = pdf.getTextWidth(line);
            textX = x + (colWidth - textWidth) / 2;
          } else if (alignment === 'right' && colWidth) {
            const textWidth = pdf.getTextWidth(line);
            textX = x + colWidth - textWidth - 3;
          } else {
            textX = x + 3; // Left padding
          }
          
          pdf.text(line, textX, lineY);
        });
        
        return lines.length * lineHeight; // Return total height used
      };
      
      let colWidths: number[];
      // Precisely calculated for A4 page - Total: 180mm (page width 210mm - 30mm margins)
      if (includeSKU && needsRRPColumn) {
        // 8 columns: Image, Article, Product, SKU, Sizes, Colors, Wholesale, RRP
        colWidths = [16, 16, 44, 22, 26, 26, 15, 15]; // Total: 180mm
      } else if (includeSKU && !needsRRPColumn) {
        // 7 columns: Image, Article, Product, SKU, Sizes, Colors, Price
        colWidths = [16, 18, 50, 24, 28, 28, 16]; // Total: 180mm
      } else if (!includeSKU && needsRRPColumn) {
        // 7 columns: Image, Article, Product, Sizes, Colors, Wholesale, RRP
        colWidths = [16, 20, 54, 30, 30, 15, 15]; // Total: 180mm
      } else {
        // 6 columns: Image, Article, Product, Sizes, Colors, Price
        colWidths = [16, 24, 60, 32, 32, 16]; // Total: 180mm
      }
      
      // Professional header function for first page
      const addFirstPageHeader = (logoData?: string) => {
        // Header background with gradient effect
        pdf.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
        pdf.rect(margin, currentY, contentWidth, 45, 'F');
        
        // Top border accent
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.rect(margin, currentY, contentWidth, 3, 'F');
        
        currentY += 8;
        
        // Add logo if available
        if (logoData) {
          const logoWidth = 25;
          const logoHeight = 20;
          pdf.addImage(logoData, 'PNG', margin + 5, currentY, logoWidth, logoHeight);
          
          // Company name next to logo
          pdf.setFontSize(22);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(colors.text.primary[0], colors.text.primary[1], colors.text.primary[2]);
          pdf.text('BYKO SPORTS', margin + logoWidth + 10, currentY + 12);
          
          // Tagline
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(colors.text.secondary[0], colors.text.secondary[1], colors.text.secondary[2]);
          pdf.text('Professional Sports Equipment', margin + logoWidth + 10, currentY + 18);
        } else {
          // Fallback without logo
          pdf.setFontSize(22);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(colors.text.primary[0], colors.text.primary[1], colors.text.primary[2]);
          pdf.text('BYKO SPORTS', margin + 5, currentY + 12);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(colors.text.secondary[0], colors.text.secondary[1], colors.text.secondary[2]);
          pdf.text('Professional Sports Equipment', margin + 5, currentY + 18);
        }
        
        // Document title - right aligned
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        const titleText = `${priceTypeText} Price List`;
        const titleWidth = pdf.getTextWidth(titleText);
        pdf.text(titleText, pageWidth - margin - titleWidth - 5, currentY + 12);
        
        // Date - right aligned
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.text.muted[0], colors.text.muted[1], colors.text.muted[2]);
        const dateText = new Date().toLocaleDateString('en-GB', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        const dateWidth = pdf.getTextWidth(`Generated: ${dateText}`);
        pdf.text(`Generated: ${dateText}`, pageWidth - margin - dateWidth - 5, currentY + 20);
        
        currentY += 40;
        
        // Filter information section with better styling
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, currentY, contentWidth, 25, 3, 3, 'FD');
        
        // Blue accent border
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.roundedRect(margin, currentY, 4, 25, 2, 2, 'F');
        
        currentY += 8;
        
        // Filter information with better layout
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(colors.text.secondary[0], colors.text.secondary[1], colors.text.secondary[2]);
        
        let filterX = margin + 15;
        pdf.text('CATEGORY:', filterX, currentY + 6);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.text.primary[0], colors.text.primary[1], colors.text.primary[2]);
        pdf.text(categoryText, filterX + 25, currentY + 6);
        
        filterX += 90;
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(colors.text.secondary[0], colors.text.secondary[1], colors.text.secondary[2]);
        pdf.text('PRODUCTS:', filterX, currentY + 6);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.text.primary[0], colors.text.primary[1], colors.text.primary[2]);
        pdf.text(filteredProducts.length.toString(), filterX + 25, currentY + 6);
        
        filterX += 60;
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(colors.text.secondary[0], colors.text.secondary[1], colors.text.secondary[2]);
        pdf.text('PRICING:', filterX, currentY + 6);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.text.primary[0], colors.text.primary[1], colors.text.primary[2]);
        pdf.text(priceTypeText, filterX + 25, currentY + 6);
        
        currentY += 30;
      };
      
      // Professional simple header for subsequent pages
      const addSimpleHeader = () => {
        // Clean header background
        pdf.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
        pdf.rect(margin, currentY, contentWidth, 25, 'F');
        
        // Top accent line
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.rect(margin, currentY, contentWidth, 2, 'F');
        
        currentY += 8;
        
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(colors.text.primary[0], colors.text.primary[1], colors.text.primary[2]);
        pdf.text('BYKO SPORTS - PRICE LIST', margin + 5, currentY + 8);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.text.muted[0], colors.text.muted[1], colors.text.muted[2]);
        const pageInfo = `${categoryText} | Page ${currentPage}`;
        const pageInfoWidth = pdf.getTextWidth(pageInfo);
        pdf.text(pageInfo, pageWidth - margin - pageInfoWidth - 5, currentY + 8);
        
        currentY += 20;
      };
      
      // Premium table header function with enhanced design
      const addTableHeader = () => {
        const headerHeight = 18; // Increased height for premium look
        
        // Premium header background with gradient effect
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.roundedRect(margin, currentY, contentWidth, headerHeight, 2, 2, 'F');
        
        // Subtle shadow effect
        pdf.setFillColor(0, 0, 0, 0.1);
        pdf.roundedRect(margin + 1, currentY + 1, contentWidth, headerHeight, 2, 2, 'F');
        pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        pdf.roundedRect(margin, currentY, contentWidth, headerHeight, 2, 2, 'F');
        
        // Header text styling - increased font size and perfect centering
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        
        let colX = margin;
        let colIndex = 0;
        const textY = currentY + headerHeight / 2 + 2; // Perfect vertical centering
        
        // Image column header - centered
        const imageHeaderText = 'IMAGE';
        const imageTextWidth = pdf.getTextWidth(imageHeaderText);
        pdf.text(imageHeaderText, colX + (colWidths[colIndex] - imageTextWidth) / 2, textY);
        colX += colWidths[colIndex++];
        
        // Article header - left aligned with padding
        pdf.text('ARTICLE', colX + 4, textY);
        colX += colWidths[colIndex++];
        
        // Product name header - left aligned with padding
        pdf.text('PRODUCT NAME', colX + 4, textY);
        colX += colWidths[colIndex++];
        
        // SKU header (if including variations)
        if (includeSKU) {
          const skuTextWidth = pdf.getTextWidth('SKU');
          pdf.text('SKU', colX + (colWidths[colIndex] - skuTextWidth) / 2, textY);
          colX += colWidths[colIndex++];
        }
        
        // Size header - centered
        const sizeTextWidth = pdf.getTextWidth('SIZES');
        pdf.text('SIZES', colX + (colWidths[colIndex] - sizeTextWidth) / 2, textY);
        colX += colWidths[colIndex++];
        
        // Color header - centered
        const colorTextWidth = pdf.getTextWidth('COLORS');
        pdf.text('COLORS', colX + (colWidths[colIndex] - colorTextWidth) / 2, textY);
        colX += colWidths[colIndex++];
        
        // Price header with £ symbol - centered
        const priceLabelWidth = pdf.getTextWidth('£');
        pdf.text('£', colX + (colWidths[colIndex] - priceLabelWidth) / 2, textY);
        colX += colWidths[colIndex++];
        
        // RRP header (if needed)
        if (needsRRPColumn) {
          const rrpWidth = pdf.getTextWidth('RRP');
          pdf.text('RRP', colX + (colWidths[colIndex] - rrpWidth) / 2, textY);
        }
        
        currentY += headerHeight;
        
        // Premium separator line with gradient effect
        pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        pdf.setLineWidth(0.5);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 3; // Extra spacing after header
      };
      
      // Professional footer function
      const addFooter = () => {
        const footerY = pageHeight - 35;
        
        // Footer separator line
        pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        pdf.setLineWidth(0.5);
        pdf.line(margin, footerY, pageWidth - margin, footerY);
        
        // Company information
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(colors.text.primary[0], colors.text.primary[1], colors.text.primary[2]);
        pdf.text('BYKO SPORTS', margin, footerY + 12);
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(colors.text.secondary[0], colors.text.secondary[1], colors.text.secondary[2]);
        pdf.text('Professional Sports Equipment', margin, footerY + 18);
        
        // Generation info - right aligned
        pdf.setFontSize(8);
        pdf.setTextColor(colors.text.muted[0], colors.text.muted[1], colors.text.muted[2]);
        const genText = `Generated: ${new Date().toLocaleDateString('en-GB')}`;
        const genWidth = pdf.getTextWidth(genText);
        pdf.text(genText, pageWidth - margin - genWidth, footerY + 12);
        
        // Confidentiality notice
        pdf.setFontSize(7);
        const confText = 'Confidential - For Internal Use Only';
        const confWidth = pdf.getTextWidth(confText);
        pdf.text(confText, pageWidth - margin - confWidth, footerY + 18);
        
        // Page number - centered
        pdf.setFontSize(9);
        pdf.setTextColor(colors.text.secondary[0], colors.text.secondary[1], colors.text.secondary[2]);
        const pageText = `${currentPage}`;
        const pageTextWidth = pdf.getTextWidth(pageText);
        pdf.text(pageText, (pageWidth - pageTextWidth) / 2, footerY + 25);
      };
      
      // Start first page  
      addFirstPageHeader(logoBase64);
      addTableHeader();
      
      // Professional product rows with controlled height and precise layout
      const baseRowHeight = 12; // Professional minimum height
      const lineHeight = 3.2; // Tighter line spacing for cleaner look
      
      filteredProducts.forEach((product, index) => {
        // Pre-calculate text content with conservative wrapping
        const productNameLines = wrapText(product.title, colWidths[includeSKU ? 2 : 2], 9);
        const sizesText = getProductSizes(product);
        const sizesLines = wrapText(sizesText, colWidths[includeSKU ? 4 : 3], 8);
        const colorsText = getProductColors(product);
        const colorsLines = wrapText(colorsText, colWidths[includeSKU ? 5 : 4], 8);
        
        // Calculate required row height - max 3 lines for professional look
        const maxLines = Math.min(Math.max(
          productNameLines.length,
          sizesLines.length,
          colorsLines.length,
          1
        ), 3); // Maximum 3 lines to prevent excessive height
        
        const dynamicRowHeight = Math.max(baseRowHeight, 8 + (maxLines * lineHeight));
        
        // Check if we need a new page (improved calculation for dynamic heights)
        if (currentY + dynamicRowHeight > pageHeight - 70) { // Increased footer space
          addFooter();
          pdf.addPage();
          currentPage++;
          currentY = margin;
          addSimpleHeader();
          addTableHeader();
        }
        
        // Premium zebra striping with better contrast
        if (index % 2 === 1) {
          pdf.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
          pdf.rect(margin, currentY, contentWidth, dynamicRowHeight, 'F');
        }
        
        // Subtle row borders for professional look
        pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        pdf.setLineWidth(0.1);
        pdf.line(margin, currentY + dynamicRowHeight, pageWidth - margin, currentY + dynamicRowHeight);
        
        // Column separators
        let colX = margin;
        let colIndex = 0;
        const textStartY = currentY + 6; // Top padding
        
        // Image column with enhanced styling (16mm width)
        const productImage = imageCache[product.id];
        if (productImage) {
          try {
            const imgWidth = colWidths[colIndex] - 8; // Better padding
            const imgHeight = Math.min(dynamicRowHeight - 6, 10); // Constrain height
            const imgY = currentY + (dynamicRowHeight - imgHeight) / 2; // Center vertically
            pdf.addImage(productImage, 'JPEG', colX + 4, imgY, imgWidth, imgHeight);
          } catch (error) {
            // Enhanced placeholder design
            const placeholderHeight = Math.min(dynamicRowHeight - 6, 10);
            const placeholderY = currentY + (dynamicRowHeight - placeholderHeight) / 2;
            pdf.setFillColor(250, 250, 250);
            pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
            pdf.setLineWidth(0.5);
            pdf.roundedRect(colX + 4, placeholderY, colWidths[colIndex] - 8, placeholderHeight, 1, 1, 'FD');
            pdf.setFontSize(7);
            pdf.setTextColor(colors.text.muted[0], colors.text.muted[1], colors.text.muted[2]);
            pdf.text('IMG', colX + colWidths[colIndex]/2 - 3, placeholderY + placeholderHeight/2 + 1);
          }
        } else {
          // Professional "no image" placeholder
          const placeholderHeight = Math.min(dynamicRowHeight - 6, 10);
          const placeholderY = currentY + (dynamicRowHeight - placeholderHeight) / 2;
          pdf.setFillColor(250, 250, 250);
          pdf.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(colX + 4, placeholderY, colWidths[colIndex] - 8, placeholderHeight, 1, 1, 'FD');
          pdf.setFontSize(7);
          pdf.setTextColor(colors.text.muted[0], colors.text.muted[1], colors.text.muted[2]);
          pdf.text('--', colX + colWidths[colIndex]/2 - 2, placeholderY + placeholderHeight/2 + 1);
        }
        
        // Column positioning (no separators)
        colX += colWidths[colIndex++];
        
        // Article number with emphasis
        pdf.setFontSize(9);
        pdf.setTextColor(colors.text.secondary[0], colors.text.secondary[1], colors.text.secondary[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(product.article, colX + 3, textStartY + 3);
        
        colX += colWidths[colIndex++];
        
        // Product name with full content display
        pdf.setTextColor(colors.text.primary[0], colors.text.primary[1], colors.text.primary[2]);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        renderMultiLineText(productNameLines, colX, textStartY + 3, lineHeight, 'left');
        
        colX += colWidths[colIndex++];
        
        // SKU (if including variations)
        if (includeSKU) {
          pdf.setTextColor(colors.text.muted[0], colors.text.muted[1], colors.text.muted[2]);
          pdf.setFontSize(8);
          const skuText = getColorAndSize(product.sku);
          const skuLines = wrapText(skuText, colWidths[colIndex], 8);
          renderMultiLineText(skuLines, colX, textStartY + 3, lineHeight, 'center', colWidths[colIndex]);
          
          colX += colWidths[colIndex++];
        }
        
        // Sizes with full content display
        pdf.setTextColor(colors.text.muted[0], colors.text.muted[1], colors.text.muted[2]);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        renderMultiLineText(sizesLines, colX, textStartY + 3, lineHeight, 'center', colWidths[colIndex]);
        
        colX += colWidths[colIndex++];
        
        // Colors with full content display
        renderMultiLineText(colorsLines, colX, textStartY + 3, lineHeight, 'center', colWidths[colIndex]);
        
        colX += colWidths[colIndex++];
        
        // Price with enhanced formatting
        pdf.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        const priceText = `${getPrice(product).toFixed(2)}`;
        renderMultiLineText([priceText], colX, textStartY + 3, lineHeight, 'right', colWidths[colIndex]);
        
        colX += colWidths[colIndex++];
        
        // RRP with enhanced formatting
        if (needsRRPColumn) {
          pdf.setTextColor(colors.text.secondary[0], colors.text.secondary[1], colors.text.secondary[2]);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          const rrpText = `${(product.retail || 0).toFixed(2)}`;
          renderMultiLineText([rrpText], colX, textStartY + 3, lineHeight, 'right', colWidths[colIndex]);
        }
        
        currentY += dynamicRowHeight;
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
    const includeSKU = filters.includeVariations;
    
    // Helper function to get unique sizes from product variants (full content)
    const getProductSizes = (product: any): string => {
      if (!product.variants || product.variants.length === 0) return '--';
      const sizes = [...new Set(product.variants.map((v: any) => v.attributes?.Size || v.attributes?.size).filter(Boolean))];
      return sizes.join(', ') || '--';
    };

    // Helper function to get unique colors from product variants (full content)
    const getProductColors = (product: any): string => {
      if (!product.variants || product.variants.length === 0) return '--';
      const colors = [...new Set(product.variants.map((v: any) => v.attributes?.Color || v.attributes?.color).filter(Boolean))];
      return colors.join(', ') || '--';
    };
    
    const headers = ['Article', 'Product Name'];
    if (includeSKU) {
      headers.push('SKU');
    }
    headers.push('Sizes', 'Colors', getPriceLabel());
    if (needsRRPColumn) {
      headers.push('RRP');
    }
    headers.push('Stock');
    
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map((product: any) => {
        const row = [
          product.article,
          `"${product.title}"` // Full product name without truncation
        ];
        if (includeSKU) {
          row.push(product.sku);
        }
        row.push(
          `"${getProductSizes(product)}"`, // Full sizes without truncation
          `"${getProductColors(product)}"`, // Full colors without truncation
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