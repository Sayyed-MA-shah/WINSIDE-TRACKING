// Simple data migration script
const fs = require('fs');
const path = require('path');

// Read CSV file and parse manually
function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current); // Add the last value
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return data;
}

// Main migration
try {
  console.log('🚀 Starting simple data migration...');
  console.log('Current directory:', __dirname);
  
  const dataPath = path.join(__dirname, '../exported_all_db/product data');
  console.log('Data path:', dataPath);
  
  // Check if directory exists
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Data directory not found:', dataPath);
    process.exit(1);
  }
  
  // Read and parse CSV files
  const productsCSV = fs.readFileSync(path.join(dataPath, 'products.csv'), 'utf8');
  const categoriesCSV = fs.readFileSync(path.join(dataPath, 'categories.csv'), 'utf8');
  const variantsCSV = fs.readFileSync(path.join(dataPath, 'variants.csv'), 'utf8');
  const colorsCSV = fs.readFileSync(path.join(dataPath, 'colors.csv'), 'utf8');
  const sizesCSV = fs.readFileSync(path.join(dataPath, 'sizes.csv'), 'utf8');
  
  const products = parseCSV(productsCSV);
  const categories = parseCSV(categoriesCSV);
  const variants = parseCSV(variantsCSV);
  const colors = parseCSV(colorsCSV);
  const sizes = parseCSV(sizesCSV);
  
  console.log(`📊 Parsed ${products.length} products, ${categories.length} categories`);
  console.log(`📦 Parsed ${variants.length} variants, ${colors.length} colors, ${sizes.length} sizes`);
  
  // Create lookup maps
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.id] = cat.name;
  });
  
  const colorMap = {};
  colors.forEach(color => {
    colorMap[color.id] = color.name;
  });
  
  const sizeMap = {};
  sizes.forEach(size => {
    sizeMap[size.id] = size.name;
  });
  
  // Group variants by product
  const variantsByProduct = {};
  variants.forEach(variant => {
    if (!variantsByProduct[variant.product_id]) {
      variantsByProduct[variant.product_id] = [];
    }
    variantsByProduct[variant.product_id].push({
      color: colorMap[variant.color_id] || 'Unknown',
      size: sizeMap[variant.size_id] || 'Unknown',
      quantity: parseInt(variant.quantity) || 0,
      id: `variant-${variant.product_id}-${variant.color_id}-${variant.size_id}`,
      productId: `prod-${variant.product_id}`
    });
  });
  
  // Transform products
  const transformedProducts = products.map(product => {
    const productVariants = variantsByProduct[product.id] || [];
    
    return {
      id: `prod-${product.id}`,
      article: product.article,
      title: product.name,
      category: categoryMap[product.category_id] || 'Uncategorized',
      brand: 'greenhil', // Default brand
      taxable: true,
      attributes: productVariants.length > 0 ? ['Size', 'Color'] : [],
      mediaMain: undefined,
      archived: false,
      wholesale: parseFloat(product.wholesale_price) || 0,
      retail: parseFloat(product.retail_price) || 0,
      club: Math.round((parseFloat(product.retail_price) * 0.85) * 100) / 100, // 15% discount
      costBefore: parseFloat(product.cost_before) || 0,
      costAfter: parseFloat(product.cost_after) || 0,
      variants: productVariants,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
  
  // Create output data
  const outputData = {
    products: transformedProducts,
    categories: categories.map(cat => cat.name),
    metadata: {
      totalProducts: transformedProducts.length,
      totalVariants: variants.length,
      migrationDate: new Date().toISOString(),
      source: 'Legacy SQLite Database'
    }
  };
  
  // Ensure directory exists
  const outputDir = path.join(__dirname, '../src/lib/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write output
  const outputPath = path.join(outputDir, 'migrated-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  
  console.log('✅ Migration completed successfully!');
  console.log(`📁 Data written to: ${outputPath}`);
  console.log(`📊 Migrated ${transformedProducts.length} products`);
  
  // Show summary
  const summary = {};
  transformedProducts.forEach(product => {
    summary[product.category] = (summary[product.category] || 0) + 1;
  });
  
  console.log('\n📈 Products by Category:');
  Object.entries(summary).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} products`);
  });
  
} catch (error) {
  console.error('❌ Migration failed:', error);
}
