const { getFullCsvMigratedProducts } = require('./src/lib/data/complete-csv-migration.ts');

// Test the CSV migration
const products = getFullCsvMigratedProducts();

console.log(`Total Products: ${products.length}`);
console.log(`Total Variants: ${products.reduce((sum, p) => sum + p.variants.length, 0)}`);

// Calculate total stock value using retail prices
const totalStockValue = products.reduce((sum, product) => {
  const productValue = product.variants.reduce((variantSum, variant) => {
    return variantSum + (variant.retail * variant.qty);
  }, 0);
  return sum + productValue;
}, 0);

console.log(`Total Stock Value: $${totalStockValue.toFixed(2)}`);

// Show some sample data
console.log('\nSample products:');
products.slice(0, 3).forEach(product => {
  console.log(`- ${product.title}: ${product.variants.length} variants`);
});

// Show categories
const categories = [...new Set(products.map(p => p.category))];
console.log(`\nCategories: ${categories.join(', ')}`);
console.log(`Total Categories: ${categories.length}`);
