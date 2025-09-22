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
  sku: string;
  price: number;
  cost: number;
  stock: number;
  attributes: Record<string, string>;
}

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

  // WINSIDE-style attribute management
  const [attributes, setAttributes] = useState<string[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string[]>>({});
  const [newAttributeName, setNewAttributeName] = useState('');
  const [attributeValueInputs, setAttributeValueInputs] = useState<Record<string, string>>({});
  
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

  // WINSIDE-style attribute management functions
  const addAttribute = () => {
    if (newAttributeName.trim() && !attributes.includes(newAttributeName.trim())) {
      const newAttr = newAttributeName.trim();
      setAttributes([...attributes, newAttr]);
      setAttributeValues(prev => ({
        ...prev,
        [newAttr]: []
      }));
      setAttributeValueInputs(prev => ({
        ...prev,
        [newAttr]: ''
      }));
      setNewAttributeName('');
    }
  };

  const removeAttribute = (attributeName: string) => {
    setAttributes(attributes.filter(attr => attr !== attributeName));
    setAttributeValues(prev => {
      const newValues = { ...prev };
      delete newValues[attributeName];
      return newValues;
    });
    setAttributeValueInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[attributeName];
      return newInputs;
    });
  };

  const updateAttributeValues = (attributeName: string, valuesString: string) => {
    const values = valuesString
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);
    
    setAttributeValues(prev => ({
      ...prev,
      [attributeName]: values
    }));
  };

  // Generate all possible variant combinations
  const generateVariants = () => {
    if (attributes.length === 0) return;
    
    // Generate all combinations
    const attrNames = attributes;
    const attrValues = attrNames.map(name => attributeValues[name] || []);
    
    if (attrValues.some(values => values.length === 0)) {
      alert('Please add values to all attributes before generating variants');
      return;
    }

    const combinations: Array<Record<string, string>> = [];
    
    function generateCombinations(index: number, current: Record<string, string>) {
      if (index === attrNames.length) {
        combinations.push({ ...current });
        return;
      }
      
      for (const value of attrValues[index]) {
        current[attrNames[index]] = value;
        generateCombinations(index + 1, current);
      }
    }
    
    generateCombinations(0, {});
    
    // Convert combinations to variations
    const newVariations = combinations.map((combo, index) => {
      const variantName = Object.entries(combo).map(([key, value]) => value).join(' ');
      const sku = `${formData.article}-${Object.values(combo).join('-')}`;
      
      return {
        name: variantName,
        sku: sku,
        price: Number(formData.retail) || 0,
        cost: Number(formData.cost_after) || 0,
        stock: 0,
        attributes: combo
      };
    });
    
    setVariations(newVariations);
  };

  const addVariation = () => {
    const newVariation: Variation = {
      name: `Variation ${variations.length + 1}`,
      sku: `${formData.article}-VAR${variations.length + 1}`,
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

    // Pricing is optional - only validate if provided
    if (formData.retail && (isNaN(Number(formData.retail)) || Number(formData.retail) <= 0)) {
      newErrors.retail = 'Retail price must be a valid positive number';
    }

    if (formData.wholesale && (isNaN(Number(formData.wholesale)) || Number(formData.wholesale) <= 0)) {
      newErrors.wholesale = 'Wholesale price must be a valid positive number';
    }

    if (formData.cost_after && (isNaN(Number(formData.cost_after)) || Number(formData.cost_after) < 0)) {
      newErrors.cost_after = 'Cost must be a valid number';
    }

    if (!formData.stock_quantity) {
      newErrors.stock_quantity = 'Stock quantity is required';
    } else if (isNaN(Number(formData.stock_quantity)) || Number(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = 'Stock must be a valid number';
    }

    // No required attribute validation needed since we removed the attributes section

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
        attributes: attributes,
        attributeValues: attributeValues,
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
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.category ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select category</option>
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
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

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Stock Information</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure pricing tiers and stock levels for this product. All pricing fields are optional.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wholesale">Wholesale Price (£) - Optional</Label>
                    <Input
                      id="wholesale"
                      name="wholesale"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.wholesale}
                      onChange={handleChange}
                      placeholder="e.g., 15.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retail">Retail Price (£) - Optional</Label>
                    <Input
                      id="retail"
                      name="retail"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.retail}
                      onChange={handleChange}
                      placeholder="e.g., 25.00"
                      className={errors.retail ? 'border-red-500' : ''}
                    />
                    {errors.retail && (
                      <p className="text-sm text-red-600">{errors.retail}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost_before">Cost Before (£) - Optional</Label>
                    <Input
                      id="cost_before"
                      name="cost_before"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost_before}
                      onChange={handleChange}
                      placeholder="e.g., 8.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost_after">Cost After (£) - Optional</Label>
                    <Input
                      id="cost_after"
                      name="cost_after"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost_after}
                      onChange={handleChange}
                      placeholder="e.g., 10.00"
                      className={errors.cost_after ? 'border-red-500' : ''}
                    />
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
                      placeholder="e.g., 50"
                      className={errors.stock_quantity ? 'border-red-500' : ''}
                    />
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
                      placeholder="e.g., 5"
                    />
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

            {/* Product Attributes & Variations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Attributes
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create dynamic attributes (e.g., Size, Color) with values to auto-generate product variations.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Attribute */}
                <div className="space-y-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="new-attribute">Add Attribute</Label>
                      <Input
                        id="new-attribute"
                        value={newAttributeName}
                        onChange={(e) => setNewAttributeName(e.target.value)}
                        placeholder="e.g., Size, Color, Material"
                        onKeyPress={(e) => e.key === 'Enter' && addAttribute()}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={addAttribute}
                      disabled={!newAttributeName.trim()}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Existing Attributes */}
                {attributes.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Attributes ({attributes.length})</h4>
                    {attributes.map((attributeName) => (
                      <div key={attributeName} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900 dark:text-white">{attributeName}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttribute(attributeName)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`values-${attributeName}`}>
                            Values (comma separated)
                          </Label>
                          <Input
                            id={`values-${attributeName}`}
                            value={attributeValueInputs[attributeName] || ''}
                            onChange={(e) => {
                              setAttributeValueInputs(prev => ({
                                ...prev,
                                [attributeName]: e.target.value
                              }));
                              updateAttributeValues(attributeName, e.target.value);
                            }}
                            placeholder="e.g., Small, Medium, Large or Red, Blue, Green"
                          />
                          {attributeValues[attributeName]?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {attributeValues[attributeName].map((value, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                >
                                  {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Generate Variations Button */}
                {attributes.length > 0 && (
                  <div className="border-t pt-4">
                    <Button
                      type="button"
                      onClick={generateVariants}
                      className="w-full gap-2"
                      variant="outline"
                    >
                      <Package className="h-4 w-4" />
                      Generate All Variations
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      This will create variations for all possible combinations of your attributes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generated Variations */}
            {variations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Variations ({variations.length})
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generated variations based on your attributes. You can adjust pricing and stock for each variation.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
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
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {variation.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                SKU: {variation.sku}
                              </p>
                            </div>
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

                        {/* Attribute Display */}
                        {Object.keys(variation.attributes).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(variation.attributes).map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              >
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </CardContent>
              </Card>
            )}

            {/* Manual Variation Option */}
            {attributes.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Manual Variations
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    If you don't need dynamic attributes, you can manually add individual variations.
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
                      Add Manual Variation
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
                      <p className="text-sm">Create dynamic attributes above or add manual variations</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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