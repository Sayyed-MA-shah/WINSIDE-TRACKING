import { createClient } from '@supabase/supabase-js';

// Simple sample products for initial database population
const sampleProducts = [
  {
    id: 'prod-1',
    article: 'BGA-1012',
    title: 'Boxing Gloves Amok',
    category: 'Boxing Gloves',
    brand: 'WINSIDE',
    taxable: true,
    attributes: ['Size', 'Color'],
    cost_before: 12.00,
    cost_after: 16.00,
    wholesale: 35.00,
    retail: 49.99,
    club: 42.49,
    archived: false,
    variants: [
      {
        id: 'variant-1',
        product_id: 'prod-1',
        sku: 'BGA-1012-BLACK-10OZ',
        attributes: { Size: '10oz', Color: 'Black' },
        qty: 9,
        wholesale: null,
        retail: null,
        cost_after: null
      },
      {
        id: 'variant-2',
        product_id: 'prod-1', 
        sku: 'BGA-1012-BLACK-12OZ',
        attributes: { Size: '12oz', Color: 'Black' },
        qty: 10,
        wholesale: null,
        retail: null,
        cost_after: null
      }
    ]
  },
  {
    id: 'prod-2',
    article: 'BGC-1011', 
    title: 'Boxing Gloves ClassX',
    category: 'Boxing Gloves',
    brand: 'WINSIDE',
    taxable: true,
    attributes: ['Size', 'Color'],
    cost_before: 14.00,
    cost_after: 18.00,
    wholesale: 41.00,
    retail: 69.99,
    club: 59.49,
    archived: false,
    variants: [
      {
        id: 'variant-3',
        product_id: 'prod-2',
        sku: 'BGC-1011-BLACK-10OZ',
        attributes: { Size: '10oz', Color: 'Black' },
        qty: 4,
        wholesale: null,
        retail: null,
        cost_after: null
      },
      {
        id: 'variant-4',
        product_id: 'prod-2',
        sku: 'BGC-1011-BLACK-12OZ', 
        attributes: { Size: '12oz', Color: 'Black' },
        qty: 4,
        wholesale: null,
        retail: null,
        cost_after: null
      }
    ]
  }
];

export async function migrateProductsToSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('Starting product migration to Supabase...');

  try {
    // Clear existing data (optional - remove if you want to keep existing data)
    console.log('Clearing existing data...');
    await supabase.from('product_variants').delete().neq('id', '');
    await supabase.from('products').delete().neq('id', '');

    // Insert products
    for (const product of sampleProducts) {
      const { variants, ...productData } = product;
      
      console.log(`Inserting product: ${product.title}`);
      
      // Insert product
      const { error: productError } = await supabase
        .from('products')
        .insert([{
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (productError) {
        console.error(`Error inserting product ${product.title}:`, productError);
        continue;
      }

      // Insert variants
      if (variants && variants.length > 0) {
        console.log(`Inserting ${variants.length} variants for ${product.title}`);
        
        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variants.map(variant => ({
            ...variant,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })));

        if (variantsError) {
          console.error(`Error inserting variants for ${product.title}:`, variantsError);
        }
      }
    }

    console.log('Migration completed successfully!');
    
    // Verify the migration
    const { data: products, error: countError } = await supabase
      .from('products')
      .select('id, title');
    
    if (countError) {
      console.error('Error verifying migration:', countError);
    } else {
      console.log(`Verified: ${products?.length || 0} products migrated`);
      products?.forEach(p => console.log(`- ${p.title} (${p.id})`));
    }

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Export for use in API route
export { sampleProducts };
