const fs = require('fs');

// Read the current JSON migration file
const migrationPath = './src/lib/data/json-migration.ts';
const content = fs.readFileSync(migrationPath, 'utf8');

// Count products in the catalogData
const productMatches = content.match(/"id":\s*\d+/g) || [];
const productCount = productMatches.length;

// Count variants
const variantMatches = content.match(/"product_id":\s*\d+/g) || [];
const variantCount = variantMatches.length;

console.log('🔍 Current Data Analysis:');
console.log(`Products found: ${productCount}`);
console.log(`Variants found: ${variantCount}`);
console.log('');
console.log('📊 Expected from your old app:');
console.log('Products: 63');
console.log('Variants: 353');
console.log('Stock value: $15,244.92');
console.log('');
console.log('❌ Missing:');
console.log(`Products: ${63 - productCount}`);
console.log(`Variants: ${353 - variantCount}`);

// Extract categories mentioned
const categoryMatches = content.match(/"name":\s*"([^"]+)"/g) || [];
const categories = [...new Set(categoryMatches.map(m => m.match(/"([^"]+)"/)[1]))];
console.log('');
console.log('📂 Categories found:');
categories.forEach(cat => console.log(`- ${cat}`));
