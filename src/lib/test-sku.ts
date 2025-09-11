// Test file to debug SKU utilities
import { 
  generateVariantCombinations, 
  mergeVariants, 
  validateSKUUniqueness, 
  calculateVariantSummary 
} from './utils/sku';

// Test data
const testArticle = 'BGC-1011';
const testAttributes = ['Size', 'Color'];
const testAttributeValues = {
  Size: ['10oz', '12oz'],
  Color: ['RED', 'BLUE']
};
const testDefaults = {
  qty: 10,
  wholesale: 50,
  retail: 75,
  costBefore: 40,
  costAfter: 45
};

console.log('Testing SKU utilities...');

try {
  const variants = generateVariantCombinations(
    testArticle,
    testAttributes,
    testAttributeValues,
    testDefaults
  );
  
  console.log('Generated variants:', variants);
  console.log('Test passed!');
} catch (error) {
  console.error('Test failed:', error);
}
