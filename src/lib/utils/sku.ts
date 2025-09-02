import { Variant } from '../types';

/**
 * Transform attribute value according to SKU rules
 */
export function transformAttributeValue(value: string, attributeName: string): string {
  let transformed = value.trim();
  
  // Special case for Size: 10oz → 10 (drop oz)
  if (attributeName.toLowerCase() === 'size' && transformed.toLowerCase().endsWith('oz')) {
    transformed = transformed.slice(0, -2);
  }
  
  // Uppercase and replace non-alphanumeric with -
  transformed = transformed
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '-')
    .replace(/^-+|-+$/g, '') // trim leading/trailing -
    .replace(/-+/g, '-'); // collapse multiple - into single -
  
  return transformed;
}

/**
 * Generate SKU from article and attributes
 */
export function generateSKU(
  article: string, 
  attributeValues: Record<string, string>, 
  attributeOrder: string[]
): string {
  const parts = [article.trim()];
  
  // Add attribute values in the specified order
  for (const attributeName of attributeOrder) {
    const value = attributeValues[attributeName];
    if (value) {
      parts.push(transformAttributeValue(value, attributeName));
    }
  }
  
  return parts.join('-');
}

/**
 * Generate all possible variants from attribute combinations
 */
export function generateVariantCombinations(
  article: string,
  attributes: string[],
  attributeValues: Record<string, string[]>,
  defaultQty: number = 0
): Omit<Variant, 'id' | 'productId'>[] {
  if (attributes.length === 0) {
    return [];
  }
  
  // Generate cartesian product of all attribute values
  const combinations: Record<string, string>[] = [];
  
  function generateCombinations(
    index: number, 
    currentCombination: Record<string, string>
  ) {
    if (index >= attributes.length) {
      combinations.push({ ...currentCombination });
      return;
    }
    
    const attributeName = attributes[index];
    const values = attributeValues[attributeName] || [];
    
    for (const value of values) {
      if (value.trim()) {
        currentCombination[attributeName] = value.trim();
        generateCombinations(index + 1, currentCombination);
        delete currentCombination[attributeName];
      }
    }
  }
  
  generateCombinations(0, {});
  
  // Generate variants from combinations
  return combinations.map(combination => ({
    sku: generateSKU(article, combination, attributes),
    attributes: combination,
    qty: defaultQty,
    // Optional pricing fields left undefined - will inherit from product
  }));
}

/**
 * Merge existing variants with newly generated ones, preserving user edits
 */
export function mergeVariants(
  existingVariants: Omit<Variant, 'id' | 'productId'>[],
  newVariants: Omit<Variant, 'id' | 'productId'>[]
): Omit<Variant, 'id' | 'productId'>[] {
  const existingBySKU = new Map(
    existingVariants.map(variant => [variant.sku, variant])
  );
  
  return newVariants.map(newVariant => {
    const existing = existingBySKU.get(newVariant.sku);
    return existing || newVariant;
  });
}

/**
 * Validate SKU uniqueness within a product
 */
export function validateSKUUniqueness(variants: Omit<Variant, 'id' | 'productId'>[]): string[] {
  const skuCounts = new Map<string, number>();
  const errors: string[] = [];
  
  variants.forEach(variant => {
    const count = skuCounts.get(variant.sku) || 0;
    skuCounts.set(variant.sku, count + 1);
  });
  
  skuCounts.forEach((count, sku) => {
    if (count > 1) {
      errors.push(`Duplicate SKU: ${sku} (appears ${count} times)`);
    }
  });
  
  return errors;
}

/**
 * Calculate summary statistics for variants
 */
export function calculateVariantSummary(
  variants: Omit<Variant, 'id' | 'productId'>[], 
  globalCostAfter?: number
) {
  const totalUnits = variants.reduce((sum, variant) => sum + variant.qty, 0);
  const totalValue = variants.reduce((sum, variant) => {
    // Use variant's costAfter if provided, otherwise use global costAfter
    const costAfter = variant.costAfter ?? globalCostAfter ?? 0;
    return sum + (variant.qty * costAfter);
  }, 0);
  
  return {
    totalUnits,
    totalValue,
    variantCount: variants.length
  };
}
