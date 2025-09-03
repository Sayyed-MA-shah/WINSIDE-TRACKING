"use client";

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowLeft, ArrowRight, Image, AlertCircle } from 'lucide-react';
import { Product, Variant, Brand } from '@/lib/types';
import { generateId } from '@/lib/utils/ssr-safe';
import { 
  generateVariantCombinations, 
  mergeVariants, 
  validateSKUUniqueness, 
  calculateVariantSummary 
} from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface ProductVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingProduct?: Product | null;
}

type FormStep = 'basics' | 'attributes' | 'variants';

interface ProductFormData {
  article: string;
  title: string;
  category: string;
  brand: Brand;
  taxable: boolean;
  mediaMain: string;
  attributes: string[];
  attributeValues: Record<string, string[]>;
  // Global pricing
  wholesale: number;
  retail: number;
  club: number;
  costBefore: number;
  costAfter: number;
  variants: Omit<Variant, 'id' | 'productId'>[];
}

interface DefaultValues {
  qty: number;
}

const DEMO_DATA = {
  article: 'BGC-1011',
  title: 'Boxing Gloves Classic',
  category: 'Gloves',
  brand: 'greenhil' as Brand,
  taxable: true,
  mediaMain: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
  attributes: ['Size', 'Color'],
  attributeValues: {
    Size: ['10oz', '12oz', '14oz', '16oz'],
    Color: ['RED', 'BLUE', 'BLACK', 'WHITE']
  },
  wholesale: 55,
  retail: 79.99,
  club: 67.99,
  costBefore: 42,
  costAfter: 48
};

export default function ProductVariantModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingProduct 
}: ProductVariantModalProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('basics');
  const [formData, setFormData] = useState<ProductFormData>({
    article: '',
    title: '',
    category: '',
    brand: 'greenhil',
    taxable: true,
    mediaMain: '',
    attributes: [],
    attributeValues: {},
    wholesale: 0,
    retail: 0,
    club: 0,
    costBefore: 0,
    costAfter: 0,
    variants: []
  });
  const [defaultValues, setDefaultValues] = useState<DefaultValues>({
    qty: 0
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [newAttributeName, setNewAttributeName] = useState('');
  const [attributeValueInputs, setAttributeValueInputs] = useState<Record<string, string>>({});
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  // Fetch available categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setAvailableCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Reset form when modal opens/closes or editing product changes
  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        // Load existing product data
        setFormData({
          article: editingProduct.article,
          title: editingProduct.title,
          category: editingProduct.category,
          brand: editingProduct.brand,
          taxable: editingProduct.taxable,
          mediaMain: editingProduct.mediaMain || '',
          attributes: editingProduct.attributes,
          attributeValues: extractAttributeValues(editingProduct.variants, editingProduct.attributes),
          wholesale: editingProduct.wholesale,
          retail: editingProduct.retail,
          club: editingProduct.club,
          costBefore: editingProduct.costBefore,
          costAfter: editingProduct.costAfter,
          variants: editingProduct.variants.map(v => ({
            sku: v.sku,
            attributes: v.attributes,
            qty: v.qty
          }))
        });
      } else {
        // Reset to empty form
        setFormData({
          article: '',
          title: '',
          category: '',
          brand: 'greenhil',
          taxable: true,
          mediaMain: '',
          attributes: [],
          attributeValues: {},
          wholesale: 0,
          retail: 0,
          club: 0,
          costBefore: 0,
          costAfter: 0,
          variants: []
        });
      }
      setCurrentStep('basics');
      setErrors([]);
      setNewAttributeName('');
      setAttributeValueInputs({});
    }
  }, [isOpen, editingProduct]);

  // Extract attribute values from existing variants
  function extractAttributeValues(variants: Variant[], attributes: string[]): Record<string, string[]> {
    const valueMap: Record<string, Set<string>> = {};
    
    attributes.forEach(attr => {
      valueMap[attr] = new Set();
    });
    
    variants.forEach(variant => {
      Object.entries(variant.attributes).forEach(([attr, value]) => {
        if (valueMap[attr]) {
          valueMap[attr].add(value);
        }
      });
    });
    
    const result: Record<string, string[]> = {};
    Object.entries(valueMap).forEach(([attr, valueSet]) => {
      result[attr] = Array.from(valueSet);
    });
    
    return result;
  }

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];
    
    // Step 1 validation
    if (!formData.article.trim()) validationErrors.push('Article is required');
    if (!formData.title.trim()) validationErrors.push('Title is required');
    if (!formData.category.trim()) validationErrors.push('Category is required');
    
    // Global pricing validation
    if (formData.wholesale < 0) validationErrors.push('Wholesale must be ≥ 0');
    if (formData.retail < 0) validationErrors.push('Retail must be ≥ 0');
    if (formData.club < 0) validationErrors.push('Club Price must be ≥ 0');
    if (formData.costBefore < 0) validationErrors.push('Cost Before must be ≥ 0');
    if (formData.costAfter < 0) validationErrors.push('Cost After must be ≥ 0');
    
    // Step 3 validation
    if (formData.variants.length === 0) {
      validationErrors.push('At least one variant must exist');
    }
    
    // Numeric validation for variants
    formData.variants.forEach((variant, index) => {
      if (variant.qty < 0) validationErrors.push(`Variant ${index + 1}: Quantity must be ≥ 0`);
    });
    
    // SKU uniqueness
    const skuErrors = validateSKUUniqueness(formData.variants);
    validationErrors.push(...skuErrors);
    
    return validationErrors;
  };

  const handleNext = () => {
    if (currentStep === 'basics') {
      setCurrentStep('attributes');
    } else if (currentStep === 'attributes') {
      setCurrentStep('variants');
    }
  };

  const handleBack = () => {
    if (currentStep === 'variants') {
      setCurrentStep('attributes');
    } else if (currentStep === 'attributes') {
      setCurrentStep('basics');
    }
  };

  const handleSeedDemo = () => {
    setFormData(prev => ({
      ...prev,
      ...DEMO_DATA,
      attributeValues: { ...DEMO_DATA.attributeValues }
    }));
    setAttributeValueInputs({
      Size: DEMO_DATA.attributeValues.Size.join(', '),
      Color: DEMO_DATA.attributeValues.Color.join(', ')
    });
  };

  const addAttribute = () => {
    if (newAttributeName.trim() && !formData.attributes.includes(newAttributeName.trim())) {
      const newAttr = newAttributeName.trim();
      setFormData(prev => ({
        ...prev,
        attributes: [...prev.attributes, newAttr],
        attributeValues: {
          ...prev.attributeValues,
          [newAttr]: []
        }
      }));
      setAttributeValueInputs(prev => ({
        ...prev,
        [newAttr]: ''
      }));
      setNewAttributeName('');
    }
  };

  const removeAttribute = (attributeName: string) => {
    setFormData(prev => {
      const newAttributeValues = { ...prev.attributeValues };
      delete newAttributeValues[attributeName];
      
      return {
        ...prev,
        attributes: prev.attributes.filter(attr => attr !== attributeName),
        attributeValues: newAttributeValues
      };
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
    
    setFormData(prev => ({
      ...prev,
      attributeValues: {
        ...prev.attributeValues,
        [attributeName]: values
      }
    }));
  };

  const generateVariants = () => {
    if (formData.attributes.length === 0) return;
    
    const newVariants = generateVariantCombinations(
      formData.article,
      formData.attributes,
      formData.attributeValues,
      defaultValues.qty
    );
    
    // Merge with existing variants to preserve user edits
    const mergedVariants = mergeVariants(formData.variants, newVariants);
    
    setFormData(prev => ({
      ...prev,
      variants: mergedVariants
    }));
  };

  const updateVariant = (index: number, field: keyof Omit<Variant, 'id' | 'productId'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        article: formData.article.trim(),
        title: formData.title.trim(),
        category: formData.category.trim(),
        brand: formData.brand,
        taxable: formData.taxable,
        attributes: formData.attributes,
        mediaMain: formData.mediaMain.trim() || undefined,
        archived: false,
        wholesale: formData.wholesale,
        retail: formData.retail,
        club: formData.club,
        costBefore: formData.costBefore,
        costAfter: formData.costAfter,
        variants: formData.variants.map((variant, index) => ({
          ...variant,
          id: generateId('variant'),
          productId: ''
        }))
      };
      
      onSave(productData);
      onClose();
    }
  };

  const summary = calculateVariantSummary(formData.variants, formData.costAfter);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingProduct ? 'Edit Product' : 'Create Product'}
            </h2>
            <div className="flex items-center mt-2 space-x-4">
              <div className={`px-3 py-1 rounded text-sm ${
                currentStep === 'basics' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                1. Basics
              </div>
              <div className={`px-3 py-1 rounded text-sm ${
                currentStep === 'attributes' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                2. Attributes
              </div>
              <div className={`px-3 py-1 rounded text-sm ${
                currentStep === 'variants' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                3. Variants
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Please fix the following issues:
              </h3>
            </div>
            <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'basics' && (
            <BasicsStep 
              formData={formData} 
              setFormData={setFormData} 
              onSeedDemo={handleSeedDemo}
              availableCategories={availableCategories}
            />
          )}
          
          {currentStep === 'attributes' && (
            <AttributesStep
              formData={formData}
              newAttributeName={newAttributeName}
              setNewAttributeName={setNewAttributeName}
              attributeValueInputs={attributeValueInputs}
              setAttributeValueInputs={setAttributeValueInputs}
              onAddAttribute={addAttribute}
              onRemoveAttribute={removeAttribute}
              onUpdateAttributeValues={updateAttributeValues}
              onGenerateVariants={generateVariants}
            />
          )}
          
          {currentStep === 'variants' && (
            <VariantsStep
              formData={formData}
              setFormData={setFormData}
              defaultValues={defaultValues}
              setDefaultValues={setDefaultValues}
              summary={summary}
              onUpdateVariant={updateVariant}
              onRemoveVariant={removeVariant}
              onGenerateVariants={generateVariants}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t dark:border-gray-700">
          <div className="flex space-x-3">
            {currentStep !== 'basics' && (
              <button
                onClick={handleBack}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            {currentStep !== 'variants' ? (
              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              >
                Save Product
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function BasicsStep({ 
  formData, 
  setFormData, 
  onSeedDemo,
  availableCategories
}: { 
  formData: ProductFormData; 
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  onSeedDemo: () => void;
  availableCategories: Category[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
        <button
          onClick={onSeedDemo}
          className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30"
        >
          Seed Demo Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Article* <span className="text-xs text-gray-500">(unique, e.g., BGC-1011)</span>
          </label>
          <input
            type="text"
            value={formData.article}
            onChange={(e) => setFormData(prev => ({ ...prev, article: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="BGC-1011"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title*
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Boxing Gloves Classic"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category*
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select a category</option>
            {availableCategories.map((category: Category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brand*
          </label>
          <select
            value={formData.brand}
            onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value as Brand }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="greenhil">Greenhil</option>
            <option value="harican">Harican</option>
            <option value="byko">Byko</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="taxable"
            checked={formData.taxable}
            onChange={(e) => setFormData(prev => ({ ...prev, taxable: e.target.checked }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="taxable" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Taxable
          </label>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Main Image URL (optional)
        </label>
        <input
          type="url"
          value={formData.mediaMain}
          onChange={(e) => setFormData(prev => ({ ...prev, mediaMain: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="https://example.com/image.jpg"
        />
        {formData.mediaMain && (
          <div className="mt-3 flex items-center space-x-3">
            <Image className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Preview:</span>
            <img
              src={formData.mediaMain}
              alt="Preview"
              className="w-16 h-16 object-cover rounded border"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      
      {/* Global Pricing Section */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Global Pricing (applies to all variants)</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Wholesale
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.wholesale}
              onChange={(e) => setFormData(prev => ({ ...prev, wholesale: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="55.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Retail
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.retail}
              onChange={(e) => setFormData(prev => ({ ...prev, retail: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="79.99"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Club Price
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.club}
              onChange={(e) => setFormData(prev => ({ ...prev, club: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="67.99"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cost Before
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.costBefore}
              onChange={(e) => setFormData(prev => ({ ...prev, costBefore: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="42.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cost After
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.costAfter}
              onChange={(e) => setFormData(prev => ({ ...prev, costAfter: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="48.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AttributesStep({
  formData,
  newAttributeName,
  setNewAttributeName,
  attributeValueInputs,
  setAttributeValueInputs,
  onAddAttribute,
  onRemoveAttribute,
  onUpdateAttributeValues,
  onGenerateVariants
}: {
  formData: ProductFormData;
  newAttributeName: string;
  setNewAttributeName: React.Dispatch<React.SetStateAction<string>>;
  attributeValueInputs: Record<string, string>;
  setAttributeValueInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onAddAttribute: () => void;
  onRemoveAttribute: (attributeName: string) => void;
  onUpdateAttributeValues: (attributeName: string, valuesString: string) => void;
  onGenerateVariants: () => void;
}) {
  const handleAttributeValueChange = (attributeName: string, value: string) => {
    setAttributeValueInputs(prev => ({
      ...prev,
      [attributeName]: value
    }));
    onUpdateAttributeValues(attributeName, value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product Attributes</h3>
      
      {/* Add Attribute */}
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Attribute
          </label>
          <input
            type="text"
            value={newAttributeName}
            onChange={(e) => setNewAttributeName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onAddAttribute()}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Size, Color, Material"
          />
        </div>
        <button
          onClick={onAddAttribute}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </button>
      </div>
      
      {/* Attribute Values */}
      <div className="space-y-4">
        {formData.attributes.map(attributeName => (
          <div key={attributeName} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white">{attributeName}</h4>
              <button
                onClick={() => onRemoveAttribute(attributeName)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Values (comma-separated)
              </label>
              <input
                type="text"
                value={attributeValueInputs[attributeName] || ''}
                onChange={(e) => handleAttributeValueChange(attributeName, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={attributeName === 'Size' ? '10oz, 12oz, 14oz, 16oz' : 'RED, BLUE, BLACK, WHITE'}
              />
              {formData.attributeValues[attributeName]?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.attributeValues[attributeName].map(value => (
                    <span
                      key={value}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
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
      
      {formData.attributes.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={onGenerateVariants}
            className="px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            Generate Variants
          </button>
        </div>
      )}
    </div>
  );
}

function VariantsStep({
  formData,
  setFormData,
  defaultValues,
  setDefaultValues,
  summary,
  onUpdateVariant,
  onRemoveVariant,
  onGenerateVariants
}: {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  defaultValues: DefaultValues;
  setDefaultValues: React.Dispatch<React.SetStateAction<DefaultValues>>;
  summary: { totalUnits: number; totalValue: number; variantCount: number };
  onUpdateVariant: (index: number, field: keyof Omit<Variant, 'id' | 'productId'>, value: any) => void;
  onRemoveVariant: (index: number) => void;
  onGenerateVariants: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product Variants</h3>
        <button
          onClick={onGenerateVariants}
          className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30"
        >
          Re-generate Variants
        </button>
      </div>
      
      {/* Default Quantity */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Default Quantity (for generation)</h4>
        <div className="w-32">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Qty</label>
          <input
            type="number"
            min="0"
            value={defaultValues.qty}
            onChange={(e) => setDefaultValues(prev => ({ ...prev, qty: Number(e.target.value) }))}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      
      {/* Global Pricing Display */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Global Pricing (applies to all variants)</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">£{formData.wholesale.toFixed(2)}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Wholesale</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">£{formData.retail.toFixed(2)}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Retail</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">£{formData.club.toFixed(2)}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Club Price</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">£{formData.costBefore.toFixed(2)}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Cost Before</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">£{formData.costAfter.toFixed(2)}</div>
            <div className="text-sm text-blue-800 dark:text-blue-300">Cost After</div>
          </div>
        </div>
      </div>
      
      {/* Summary */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.variantCount}</div>
            <div className="text-sm text-green-800 dark:text-green-300">Variants</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.totalUnits}</div>
            <div className="text-sm text-green-800 dark:text-green-300">Total Units</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">£{summary.totalValue.toFixed(2)}</div>
            <div className="text-sm text-green-800 dark:text-green-300">Total Value</div>
          </div>
        </div>
      </div>
      
      {/* Variants Table */}
      {formData.variants.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Pricing Behavior</h4>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>• <strong>Empty fields</strong>: Variant uses global pricing (shown as placeholder values)</p>
                  <p>• <strong>Custom values</strong>: Override global pricing for specific variants</p>
                  <p>• <strong>Clear field</strong>: Delete value to revert back to global pricing</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Attributes
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Wholesale
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Retail
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Club Price
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cost Before
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cost After
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {formData.variants.map((variant, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(variant.attributes).map(([key, value]) => (
                          <span
                            key={key}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                          >
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => onUpdateVariant(index, 'sku', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={variant.qty}
                        onChange={(e) => onUpdateVariant(index, 'qty', Number(e.target.value))}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.wholesale ?? formData.wholesale}
                        onChange={(e) => onUpdateVariant(index, 'wholesale', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder={`${formData.wholesale.toFixed(2)}`}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.retail ?? formData.retail}
                        onChange={(e) => onUpdateVariant(index, 'retail', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder={`${formData.retail.toFixed(2)}`}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.club ?? formData.club}
                        onChange={(e) => onUpdateVariant(index, 'club', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder={`${formData.club.toFixed(2)}`}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.costBefore ?? formData.costBefore}
                        onChange={(e) => onUpdateVariant(index, 'costBefore', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder={`${formData.costBefore.toFixed(2)}`}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.costAfter ?? formData.costAfter}
                        onChange={(e) => onUpdateVariant(index, 'costAfter', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder={`${formData.costAfter.toFixed(2)}`}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <button
                        onClick={() => onRemoveVariant(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No variants generated yet. Go back to Attributes step and click "Generate Variants".
        </div>
      )}
    </div>
  );
}
