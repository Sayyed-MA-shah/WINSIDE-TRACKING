'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Save,
  Heart,
  Plus,
  X,
  Package
} from 'lucide-react';
import { useInsoleAuth } from '@/lib/context/insole-auth';
import { getInsoleProducts, addInsoleProduct } from '@/lib/db/insole-db';

interface Variation {
  name: string;
  price: number;
  cost: number;
  stock: number;
  attributes: Record<string, string>;
}

// Simple Select component for this form
const SimpleSelect = ({ value, onValueChange, placeholder, options, className }: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  className?: string;
}) => (
  <select 
    value={value} 
    onChange={(e) => onValueChange(e.target.value)}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
);

// Simple Checkbox component
const SimpleCheckbox = ({ checked, onCheckedChange, label }: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) => (
  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <label className="text-sm text-gray-900 dark:text-white">{label}</label>
  </div>
);

export default function NewInsoleProduct() {
  const router = useRouter();
  const { user } = useInsoleAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    article: '',
    title: '',
    category: '',
    brand: '',
    taxable: true,
    wholesale: '',
    retail: '',
    cost_before: '',
    cost_after: '',
    stock_quantity: '',
    min_stock_level: '5'
  });

  const [productAttributes, setProductAttributes] = useState<Record<string, any>>({});
  const [variations, setVariations] = useState<Variation[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!user) {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAttributeChange = (attributeName: string, value: any) => {
    setProductAttributes(prev => ({
      ...prev,
      [attributeName]: value
    }));
  };

  const addVariation = () => {
    const newVariation: Variation = {
      name: `Variation ${variations.length + 1}`,
      price: Number(formData.retail) || 0,
      cost: Number(formData.cost_after) || 0,
      stock: 0,
      attributes: {}
    };
    setVariations([...variations, newVariation]);
  };

  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const updateVariation = (index: number, field: keyof Variation, value: any) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], [field]: value };
    setVariations(updated);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.article.trim()) {
      newErrors.article = 'Article/SKU is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.retail) {
      newErrors.retail = 'Retail price is required';
    } else if (isNaN(Number(formData.retail)) || Number(formData.retail) <= 0) {
      newErrors.retail = 'Retail price must be a valid positive number';
    }

    if (!formData.cost_after) {
      newErrors.cost_after = 'Cost is required';
    } else if (isNaN(Number(formData.cost_after)) || Number(formData.cost_after) < 0) {
      newErrors.cost_after = 'Cost must be a valid number';
    }

    if (!formData.stock_quantity) {
      newErrors.stock_quantity = 'Stock quantity is required';
    } else if (isNaN(Number(formData.stock_quantity)) || Number(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = 'Stock must be a valid number';
    }

    // Validate required attributes (Size is required)
    if (!productAttributes.size) {
      newErrors.attr_size = 'Size is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      const productData = {
        article: formData.article.trim(),
        title: formData.title.trim(),
        category: formData.category.trim(),
        brand: formData.brand.trim() || 'INSOLE CLINIC',
        taxable: formData.taxable,
        attributes: productAttributes,
        variations: variations,
        wholesale: Number(formData.wholesale) || 0,
        retail: Number(formData.retail),
        cost_before: Number(formData.cost_before) || 0,
        cost_after: Number(formData.cost_after),
        stock_quantity: Number(formData.stock_quantity),
        min_stock_level: Number(formData.min_stock_level)
      };

      console.log('Submitting product:', productData);
      await addInsoleProduct(productData);
      
      alert('Product created successfully!');
      router.push('/dashboard/insole/products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please check console for details or ensure the database tables are created.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const categoryOptions = [
    { value: 'Comfort Insoles', label: 'Comfort Insoles' },
    { value: 'Orthotic Insoles', label: 'Orthotic Insoles' },
    { value: 'Sports Insoles', label: 'Sports Insoles' },
    { value: 'Medical Insoles', label: 'Medical Insoles' },
    { value: 'Gel Insoles', label: 'Gel Insoles' },
    { value: 'Memory Foam', label: 'Memory Foam' },
    { value: 'Heel Grips', label: 'Heel Grips' },
    { value: 'Arch Support', label: 'Arch Support' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/insole/products')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="article">Article/SKU *</Label>
                    <Input
                      id="article"
                      name="article"
                      value={formData.article}
                      onChange={handleChange}
                      placeholder="e.g., INS001"
                      className={errors.article ? 'border-red-500' : ''}
                    />
                    {errors.article && (
                      <p className="text-sm text-red-600">{errors.article}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Product Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Memory Foam Insole"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <SimpleSelect
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      placeholder="Select category"
                      options={categoryOptions}
                      className={errors.category ? 'border-red-500' : ''}
                    />
                    {errors.category && (
                      <p className="text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="INSOLE CLINIC (default)"
                    />
                  </div>
                </div>

                <SimpleCheckbox
                  checked={formData.taxable}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, taxable: checked }))}
                  label="Taxable item"
                />
              </CardContent>
            </Card>

            {/* Simple Product Attributes */}
            <Card>
              <CardHeader>
                <CardTitle>Product Attributes</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add basic product attributes like size, color, and material.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <SimpleSelect
                      value={productAttributes.size || ''}
                      onValueChange={(value) => handleAttributeChange('size', value)}
                      placeholder="Select size"
                      options={[
                        { value: 'XS', label: 'Extra Small (XS)' },
                        { value: 'S', label: 'Small (S)' },
                        { value: 'M', label: 'Medium (M)' },
                        { value: 'L', label: 'Large (L)' },
                        { value: 'XL', label: 'Extra Large (XL)' },
                        { value: 'XXL', label: 'Double XL (XXL)' },
                        { value: 'Custom', label: 'Custom Size' }
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <SimpleSelect
                      value={productAttributes.color || ''}
                      onValueChange={(value) => handleAttributeChange('color', value)}
                      placeholder="Select color"
                      options={[
                        { value: 'Black', label: 'Black' },
                        { value: 'White', label: 'White' },
                        { value: 'Brown', label: 'Brown' },
                        { value: 'Blue', label: 'Blue' },
                        { value: 'Red', label: 'Red' },
                        { value: 'Green', label: 'Green' },
                        { value: 'Grey', label: 'Grey' },
                        { value: 'Navy', label: 'Navy' },
                        { value: 'Beige', label: 'Beige' }
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <SimpleSelect
                      value={productAttributes.material || ''}
                      onValueChange={(value) => handleAttributeChange('material', value)}
                      placeholder="Select material"
                      options={[
                        { value: 'Memory Foam', label: 'Memory Foam' },
                        { value: 'Gel', label: 'Gel' },
                        { value: 'Leather', label: 'Leather' },
                        { value: 'Fabric', label: 'Fabric' },
                        { value: 'Synthetic', label: 'Synthetic' },
                        { value: 'Cork', label: 'Cork' },
                        { value: 'Rubber', label: 'Rubber' },
                        { value: 'Silicone', label: 'Silicone' }
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arch_support">Arch Support</Label>
                    <SimpleSelect
                      value={productAttributes.arch_support || ''}
                      onValueChange={(value) => handleAttributeChange('arch_support', value)}
                      placeholder="Select arch support level"
                      options={[
                        { value: 'Low', label: 'Low Support' },
                        { value: 'Medium', label: 'Medium Support' },
                        { value: 'High', label: 'High Support' },
                        { value: 'Custom', label: 'Custom Support' }
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Product Description</Label>
                  <textarea
                    id="description"
                    value={productAttributes.description || ''}
                    onChange={(e) => handleAttributeChange('description', e.target.value)}
                    placeholder="Describe the product features, benefits, and use cases..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This will help customers understand your product better
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Stock Information</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure pricing tiers and stock levels for this product.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wholesale">Wholesale Price (£)</Label>
                    <Input
                      id="wholesale"
                      name="wholesale"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.wholesale}
                      onChange={handleChange}
                      placeholder="e.g., 15.00 (bulk/trade price)"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Price for bulk orders or trade customers
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retail">Retail Price * (£)</Label>
                    <Input
                      id="retail"
                      name="retail"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.retail}
                      onChange={handleChange}
                      placeholder="e.g., 25.00 (customer price)"
                      className={errors.retail ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Price charged to end customers
                    </p>
                    {errors.retail && (
                      <p className="text-sm text-red-600">{errors.retail}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost_before">Cost Before (£)</Label>
                    <Input
                      id="cost_before"
                      name="cost_before"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost_before}
                      onChange={handleChange}
                      placeholder="e.g., 8.00 (original cost)"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your original purchase cost per unit
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost_after">Cost After * (£)</Label>
                    <Input
                      id="cost_after"
                      name="cost_after"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost_after}
                      onChange={handleChange}
                      placeholder="e.g., 10.00 (current cost)"
                      className={errors.cost_after ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Current cost including any adjustments
                    </p>
                    {errors.cost_after && (
                      <p className="text-sm text-red-600">{errors.cost_after}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Current Stock Quantity *</Label>
                    <Input
                      id="stock_quantity"
                      name="stock_quantity"
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      placeholder="e.g., 50 (units in stock)"
                      className={errors.stock_quantity ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      How many units are currently in stock
                    </p>
                    {errors.stock_quantity && (
                      <p className="text-sm text-red-600">{errors.stock_quantity}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
                    <Input
                      id="min_stock_level"
                      name="min_stock_level"
                      type="number"
                      min="0"
                      value={formData.min_stock_level}
                      onChange={handleChange}
                      placeholder="e.g., 5 (reorder threshold)"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Alert when stock falls below this level
                    </p>
                  </div>
                </div>

                {/* Profit Preview */}
                {formData.retail && formData.cost_after && !errors.retail && !errors.cost_after && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                      Profit Analysis
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-400">Profit per unit:</span>
                        <span className="font-medium text-blue-900 dark:text-blue-300">
                          £{(Number(formData.retail) - Number(formData.cost_after)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700 dark:text-blue-400">Profit margin:</span>
                        <span className="font-medium text-blue-900 dark:text-blue-300">
                          {(((Number(formData.retail) - Number(formData.cost_after)) / Number(formData.retail)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Variations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Variations
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create variations for different sizes, colors, materials, or other product attributes. Each variation can have its own pricing and stock levels.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Variations ({variations.length})</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {variations.length === 0 ? 'No variations created yet' : `${variations.length} variation${variations.length > 1 ? 's' : ''} defined`}
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={addVariation} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Variation
                  </Button>
                </div>

                {variations.length > 0 && (
                  <div className="space-y-4">
                    {variations.map((variation, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {index + 1}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {variation.name || `Variation ${index + 1}`}
                            </h4>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariation(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`variation-name-${index}`}>Variation Name *</Label>
                            <Input
                              id={`variation-name-${index}`}
                              placeholder="e.g., Small Blue, Large Red, Size 8"
                              value={variation.name}
                              onChange={(e) => updateVariation(index, 'name', e.target.value)}
                              className="bg-white dark:bg-gray-900"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`variation-price-${index}`}>Retail Price (£) *</Label>
                            <Input
                              id={`variation-price-${index}`}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={variation.price || ''}
                              onChange={(e) => updateVariation(index, 'price', e.target.value ? Number(e.target.value) : 0)}
                              className="bg-white dark:bg-gray-900"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`variation-cost-${index}`}>Cost Price (£)</Label>
                            <Input
                              id={`variation-cost-${index}`}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={variation.cost || ''}
                              onChange={(e) => updateVariation(index, 'cost', e.target.value ? Number(e.target.value) : 0)}
                              className="bg-white dark:bg-gray-900"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`variation-stock-${index}`}>Stock Quantity</Label>
                            <Input
                              id={`variation-stock-${index}`}
                              type="number"
                              min="0"
                              placeholder="0"
                              value={variation.stock || ''}
                              onChange={(e) => updateVariation(index, 'stock', e.target.value ? Number(e.target.value) : 0)}
                              className="bg-white dark:bg-gray-900"
                            />
                          </div>
                        </div>

                        {/* Profit Margin Calculation */}
                        {variation.price && variation.cost && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-blue-700 dark:text-blue-300">Profit Margin:</span>
                              <span className="font-medium text-blue-900 dark:text-blue-100">
                                £{(variation.price - variation.cost).toFixed(2)} ({((variation.price - variation.cost) / variation.price * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {variations.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No variations yet</p>
                    <p className="text-sm">Click "Add Variation" to create different product variants</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Database Setup Notice */}
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Database Setup Required</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      If you encounter errors when saving, please run the SQL from <code>insole-schema.sql</code> in your Supabase SQL Editor to create the required tables.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/insole/products')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}