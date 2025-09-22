'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, Plus, Edit3, Trash2, Package } from 'lucide-react';
import { useInsoleAuth } from '@/lib/context/insole-auth';
import { getInsoleProducts, updateInsoleProduct, type InsoleProduct } from '@/lib/db/insole-db';

interface Variation {
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  attributes: Record<string, string>;
}

export default function EditInsoleProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useInsoleAuth();
  const [product, setProduct] = useState<InsoleProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<InsoleProduct>>({});
  const [variations, setVariations] = useState<Variation[]>([]);
  const [newAttribute, setNewAttribute] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState('');
  const [editingVariant, setEditingVariant] = useState<number | null>(null);

  useEffect(() => {
    if (params.id && user) {
      fetchProduct(params.id as string);
    }
  }, [params.id, user]);

  const fetchProduct = async (id: string) => {
    try {
      const products = await getInsoleProducts();
      const foundProduct = products.find(p => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        setFormData(foundProduct);
        setVariations(foundProduct.variations || []);
      } else {
        console.error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAttribute = () => {
    if (!newAttribute.trim()) return;
    
    const currentAttributes = formData.attributes || {};
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...currentAttributes,
        [newAttribute.trim()]: []
      }
    }));
    setNewAttribute('');
  };

  const removeAttribute = (attributeToRemove: string) => {
    const updatedAttributes = { ...(formData.attributes || {}) };
    delete updatedAttributes[attributeToRemove];
    
    setFormData(prev => ({
      ...prev,
      attributes: updatedAttributes
    }));
  };

  const addAttributeValue = () => {
    if (!selectedAttribute || !newAttributeValue.trim()) return;

    const currentValues = formData.attributes?.[selectedAttribute] || [];
    const newValues = newAttributeValue.split(',').map(v => v.trim()).filter(v => v);
    const uniqueValues = [...new Set([...currentValues, ...newValues])];

    setFormData(prev => ({
      ...prev,
      attributes: {
        ...(prev.attributes || {}),
        [selectedAttribute]: uniqueValues
      }
    }));
    setNewAttributeValue('');
  };

  const removeAttributeValue = (attribute: string, valueToRemove: string) => {
    const updatedValues = (formData.attributes?.[attribute] || []).filter((v: string) => v !== valueToRemove);
    
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...(prev.attributes || {}),
        [attribute]: updatedValues
      }
    }));
  };

  const generateVariations = () => {
    if (!formData.attributes || Object.keys(formData.attributes).length === 0) {
      alert('Please add attributes and values first to generate variations.');
      return;
    }
    
    const attributeEntries = Object.entries(formData.attributes).filter(([_, values]) => 
      Array.isArray(values) && values.length > 0
    );
    
    if (attributeEntries.length === 0) {
      alert('Please add values to your attributes first.');
      return;
    }
    
    const combinations: Record<string, string>[] = [];
    
    function generateCombinations(index: number, current: Record<string, string>) {
      if (index === attributeEntries.length) {
        combinations.push({ ...current });
        return;
      }
      
      const [attrName, values] = attributeEntries[index];
      for (const value of values as string[]) {
        current[attrName] = value;
        generateCombinations(index + 1, current);
      }
    }
    
    generateCombinations(0, {});
    
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
      sku: `${formData.article || 'ITEM'}-VAR${variations.length + 1}`,
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

  const updateVariation = (index: number, field: string, value: any) => {
    const updatedVariations = [...variations];
    updatedVariations[index] = {
      ...updatedVariations[index],
      [field]: value
    };
    setVariations(updatedVariations);
  };

  const handleSave = async () => {
    if (!user || !product) return;
    
    setSaving(true);
    try {
      const updatedProduct = {
        ...formData,
        variations: variations
      };
      await updateInsoleProduct(product.id, updatedProduct);
      console.log('Product updated successfully');
      router.push('/dashboard/insole/products');
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please log in to access this page</p>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/insole/auth')}
            className="mt-4"
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Product not found</p>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/insole/products')}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/insole/products')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Product
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Update product information, pricing, variants, and attributes
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/insole/products')}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Product Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Product Title</Label>
                      <Input
                        id="title"
                        value={formData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter product title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="article">Article Number</Label>
                      <Input
                        id="article"
                        value={formData.article || ''}
                        onChange={(e) => handleInputChange('article', e.target.value)}
                        placeholder="Enter article number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="insoles">Insoles</SelectItem>
                          <SelectItem value="arch-support">Arch Support</SelectItem>
                          <SelectItem value="heel-pads">Heel Pads</SelectItem>
                          <SelectItem value="orthotic">Orthotic</SelectItem>
                          <SelectItem value="cushioning">Cushioning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={formData.brand || ''}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        placeholder="Enter brand name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="media_main">Main Image URL</Label>
                    <Input
                      id="media_main"
                      value={formData.media_main || ''}
                      onChange={(e) => handleInputChange('media_main', e.target.value)}
                      placeholder="Enter image URL"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Base Pricing (Optional)</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Set default prices that will be applied to new variants. All pricing fields are optional.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="retail">Retail Price (£) - Optional</Label>
                      <Input
                        id="retail"
                        type="number"
                        step="0.01"
                        value={formData.retail || ''}
                        onChange={(e) => handleInputChange('retail', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wholesale">Wholesale Price (£) - Optional</Label>
                      <Input
                        id="wholesale"
                        type="number"
                        step="0.01"
                        value={formData.wholesale || ''}
                        onChange={(e) => handleInputChange('wholesale', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cost_after">Cost Price (£) - Optional</Label>
                      <Input
                        id="cost_after"
                        type="number"
                        step="0.01"
                        value={formData.cost_after || ''}
                        onChange={(e) => handleInputChange('cost_after', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Base Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Base Inventory</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Default stock settings (variants have individual stock quantities)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stock_quantity">Base Stock Quantity</Label>
                      <Input
                        id="stock_quantity"
                        type="number"
                        value={formData.stock_quantity || ''}
                        onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
                      <Input
                        id="min_stock_level"
                        type="number"
                        value={formData.min_stock_level || ''}
                        onChange={(e) => handleInputChange('min_stock_level', parseInt(e.target.value) || 0)}
                        placeholder="5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Variations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Product Variations
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage individual product variants with their own pricing, stock, and attributes
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={generateVariations}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Generate from Attributes
                    </Button>
                    <Button
                      onClick={addVariation}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Manual Variant
                    </Button>
                  </div>

                  {variations.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Current Variations ({variations.length})</Label>
                      {variations.map((variant, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Variant {index + 1}</Badge>
                              <span className="text-sm font-medium">{variant.name}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                onClick={() => setEditingVariant(editingVariant === index ? null : index)}
                                variant="ghost"
                                size="sm"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => removeVariation(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {editingVariant === index && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t">
                              <div>
                                <Label className="text-xs">Variant Name</Label>
                                <Input
                                  value={variant.name}
                                  onChange={(e) => updateVariation(index, 'name', e.target.value)}
                                  placeholder="Variant name"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">SKU</Label>
                                <Input
                                  value={variant.sku}
                                  onChange={(e) => updateVariation(index, 'sku', e.target.value)}
                                  placeholder="SKU"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Stock Quantity</Label>
                                <Input
                                  type="number"
                                  value={variant.stock}
                                  onChange={(e) => updateVariation(index, 'stock', parseInt(e.target.value) || 0)}
                                  placeholder="0"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Price (£)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={variant.price}
                                  onChange={(e) => updateVariation(index, 'price', parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Cost (£)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={variant.cost}
                                  onChange={(e) => updateVariation(index, 'cost', parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                  onClick={() => setEditingVariant(null)}
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  Done
                                </Button>
                              </div>
                            </div>
                          )}

                          {editingVariant !== index && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <div>SKU: <span className="font-medium">{variant.sku}</span></div>
                              <div>Stock: <span className="font-medium">{variant.stock}</span></div>
                              <div>Price: <span className="font-medium">£{variant.price?.toFixed(2) || '0.00'}</span></div>
                              <div>Cost: <span className="font-medium">£{variant.cost?.toFixed(2) || '0.00'}</span></div>
                            </div>
                          )}

                          {/* Variant Attributes */}
                          {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                            <div>
                              <Label className="text-xs">Attributes:</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(variant.attributes).map(([key, value]) => (
                                  <Badge
                                    key={key}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {key}: {value}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {variations.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No variations added yet</p>
                      <p className="text-sm">Generate from attributes or add manually</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Attributes & Settings */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Attributes</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage product attributes for variation generation
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add New Attribute */}
                  <div className="flex gap-2">
                    <Input
                      value={newAttribute}
                      onChange={(e) => setNewAttribute(e.target.value)}
                      placeholder="Add attribute (e.g., Size, Color)"
                      onKeyPress={(e) => e.key === 'Enter' && addAttribute()}
                    />
                    <Button
                      onClick={addAttribute}
                      size="sm"
                      disabled={!newAttribute.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Current Attributes */}
                  {formData.attributes && Object.keys(formData.attributes).length > 0 && (
                    <div className="space-y-2">
                      <Label>Current Attributes:</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(formData.attributes).map((attr, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {attr}
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-red-500"
                              onClick={() => removeAttribute(attr)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Attribute Values */}
                  {formData.attributes && Object.keys(formData.attributes).length > 0 && (
                    <div className="space-y-2">
                      <Label>Add Values to Attribute:</Label>
                      <Select value={selectedAttribute} onValueChange={setSelectedAttribute}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select attribute" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(formData.attributes).map((attr) => (
                            <SelectItem key={attr} value={attr}>
                              {attr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedAttribute && (
                        <div className="flex gap-2">
                          <Input
                            value={newAttributeValue}
                            onChange={(e) => setNewAttributeValue(e.target.value)}
                            placeholder="Enter values (comma-separated)"
                            onKeyPress={(e) => e.key === 'Enter' && addAttributeValue()}
                          />
                          <Button
                            onClick={addAttributeValue}
                            size="sm"
                            disabled={!newAttributeValue.trim()}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Current Attribute Values */}
                  {formData.attributes && Object.keys(formData.attributes).length > 0 && (
                    <div className="space-y-3">
                      <Label>Current Values:</Label>
                      {Object.entries(formData.attributes).map(([attribute, values]) => (
                        <div key={attribute} className="space-y-1">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {attribute}:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(values) && values.map((value: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                {value}
                                <X
                                  className="w-3 h-3 cursor-pointer hover:text-red-500"
                                  onClick={() => removeAttributeValue(attribute, value)}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

