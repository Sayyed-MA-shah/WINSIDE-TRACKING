const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Read CSV files and convert to JSON
async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Main migration function
async function migrateData() {
  try {
    console.log('🚀 Starting data migration...');
    
    const dataPath = path.join(__dirname, '../exported_all_db/product data');
    
    // Read all CSV files
    const [products, categories, variants, colors, sizes] = await Promise.all([
      readCSV(path.join(dataPath, 'products.csv')),
      readCSV(path.join(dataPath, 'categories.csv')),
      readCSV(path.join(dataPath, 'variants.csv')),
      readCSV(path.join(dataPath, 'colors.csv')),
      readCSV(path.join(dataPath, 'sizes.csv'))
    ]);

    console.log(`📊 Found ${products.length} products, ${categories.length} categories`);
    console.log(`📦 Found ${variants.length} variants, ${colors.length} colors, ${sizes.length} sizes`);

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
        id: `variant-${variant.product_id}-${variant.color_id}-${variant.size_id}`
      });
    });

    // Transform products to match new application structure
    const transformedProducts = products.map(product => {
      const productVariants = variantsByProduct[product.id] || [];
      
      return {
        id: `prod-${product.id}`,
        article: product.article,
        title: product.name,
        category: categoryMap[product.category_id] || 'Uncategorized',
        brand: 'greenhil', // Default brand - you can change this
        taxable: true,
        attributes: productVariants.length > 0 ? ['Size', 'Color'] : [],
        mediaMain: undefined,
        archived: false,
        wholesale: parseFloat(product.wholesale_price) || 0,
        retail: parseFloat(product.retail_price) || 0,
        club: parseFloat(product.retail_price) * 0.85 || 0, // 15% discount for club
        costBefore: parseFloat(product.cost_before) || 0,
        costAfter: parseFloat(product.cost_after) || 0,
        variants: productVariants,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    // Generate the data file
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

    // Write to JSON file for the application to use
    const outputPath = path.join(__dirname, '../src/lib/data/migrated-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

    console.log('✅ Migration completed successfully!');
    console.log(`📁 Data written to: ${outputPath}`);
    console.log(`📊 Migrated ${transformedProducts.length} products with ${variants.length} total variants`);

    // Generate summary
    const summary = {
      products: transformedProducts.length,
      categories: categories.length,
      totalVariants: variants.length,
      productsByCategory: {}
    };

    transformedProducts.forEach(product => {
      summary.productsByCategory[product.category] = (summary.productsByCategory[product.category] || 0) + 1;
    });

    console.log('\n📈 Migration Summary:');
    console.log(`Products: ${summary.products}`);
    console.log(`Categories: ${summary.categories}`);
    console.log(`Total Variants: ${summary.totalVariants}`);
    console.log('\nProducts by Category:');
    Object.entries(summary.productsByCategory).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };
