import { connectToDatabase } from '../src/lib/db/connection';
import { getFullCsvMigratedProducts } from '../src/lib/data/complete-csv-migration';

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');
    
    const connection = await connectToDatabase();
    console.log('✅ Database connected successfully');

    // Begin transaction
    await connection.beginTransaction();
    console.log('📋 Transaction started');

    try {
      // Get your real products from CSV data
      const products = getFullCsvMigratedProducts();
      console.log(`📦 Found ${products.length} products to insert`);

      // Insert all products
      for (const product of products) {
        console.log(`📝 Inserting product: ${product.title} (${product.article})`);
        
        // Insert product
        const [result] = await connection.execute(
          `INSERT INTO products (
            id, article, title, category, brand, taxable, attributes, media_main, archived,
            wholesale, retail, club, cost_before, cost_after, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.id,
            product.article,
            product.title,
            product.category,
            product.brand,
            product.taxable,
            JSON.stringify(product.attributes),
            product.mediaMain || null,
            product.archived,
            product.wholesale,
            product.retail,
            product.club,
            product.costBefore,
            product.costAfter,
            product.createdAt,
            product.updatedAt
          ]
        );

        // Insert variants
        for (const variant of product.variants) {
          console.log(`  └── Variant: ${variant.sku} (Qty: ${variant.qty})`);
          
          await connection.execute(
            `INSERT INTO product_variants (
              id, product_id, sku, attributes, qty, wholesale, retail, club, cost_before, cost_after
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              variant.id,
              product.id,
              variant.sku,
              JSON.stringify(variant.attributes),
              variant.qty,
              variant.wholesale || product.wholesale,
              variant.retail || product.retail,
              variant.club || product.club,
              variant.costBefore || product.costBefore,
              variant.costAfter || product.costAfter
            ]
          );
        }
      }

      // Commit transaction
      await connection.commit();
      console.log('✅ All products inserted successfully');
      
      // Summary
      const totalVariants = products.reduce((sum, p) => sum + p.variants.length, 0);
      console.log(`\n🎉 Database initialization complete!`);
      console.log(`📊 Summary:`);
      console.log(`   • ${products.length} products inserted`);
      console.log(`   • ${totalVariants} variants inserted`);
      console.log(`   • All products are Byko brand`);
      console.log(`   • Ready for production deployment`);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
