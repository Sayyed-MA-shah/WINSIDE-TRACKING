import { Product, Brand } from '../types';

// Migrated product data from legacy database
export const migratedProducts: Product[] = [
  {
    id: 'prod-6',
    article: 'BGA-1012',
    title: 'Boxing gloves amok',
    category: 'Boxing Gloves',
    brand: 'greenhil' as Brand,
    taxable: true,
    attributes: ['Size', 'Color'],
    mediaMain: undefined,
    archived: false,
    wholesale: 35,
    retail: 49.99,
    club: 42.49,
    costBefore: 12,
    costAfter: 16,
    variants: [
      { 
        id: 'variant-6-1-1', 
        productId: 'prod-6',
        sku: 'BGA-1012-10oz-Black',
        attributes: { Size: '10oz', Color: 'Black' }, 
        qty: 9
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prod-7',
    article: 'BGC-1011',
    title: 'Boxing gloves ClassX',
    category: 'Boxing Gloves',
    brand: 'greenhil' as Brand,
    taxable: true,
    attributes: ['Size', 'Color'],
    mediaMain: undefined,
    archived: false,
    wholesale: 41,
    retail: 69.99,
    club: 59.49,
    costBefore: 14,
    costAfter: 18,
    variants: [
      { 
        id: 'variant-7-1-1', 
        productId: 'prod-7',
        sku: 'BGC-1011-12oz-Red',
        attributes: { Size: '12oz', Color: 'Red' }, 
        qty: 15
      },
      { 
        id: 'variant-7-1-2', 
        productId: 'prod-7',
        sku: 'BGC-1011-14oz-Blue',
        attributes: { Size: '14oz', Color: 'Blue' }, 
        qty: 8
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prod-8',
    article: 'BGE-1013',
    title: 'Boxing Gloves Endoor',
    category: 'Boxing Gloves',
    brand: 'harican' as Brand,
    taxable: true,
    attributes: ['Size', 'Color'],
    mediaMain: undefined,
    archived: false,
    wholesale: 49,
    retail: 89.99,
    club: 76.49,
    costBefore: 18,
    costAfter: 23,
    variants: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prod-13',
    article: 'HGB-2011',
    title: 'Head Guard Brag',
    category: 'Head Guard',
    brand: 'byko' as Brand,
    taxable: true,
    attributes: ['Size', 'Color'],
    mediaMain: undefined,
    archived: false,
    wholesale: 69,
    retail: 110,
    club: 93.50,
    costBefore: 18,
    costAfter: 24,
    variants: [
      { 
        id: 'variant-13-1-1', 
        productId: 'prod-13',
        sku: 'HGB-2011-M-Black',
        attributes: { Size: 'M', Color: 'Black' }, 
        qty: 5
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prod-23',
    article: 'AMR-8011',
    title: 'Focus Mitt React',
    category: 'Coaching & Focus Mitts',
    brand: 'harican' as Brand,
    taxable: true,
    attributes: ['Size', 'Color'],
    mediaMain: undefined,
    archived: false,
    wholesale: 49.99,
    retail: 139.99,
    club: 118.99,
    costBefore: 18,
    costAfter: 24.99,
    variants: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prod-40',
    article: 'SB-9061',
    title: 'Speed Ball',
    category: 'Speed Balls / Platforms',
    brand: 'greenhil' as Brand,
    taxable: true,
    attributes: ['Size', 'Color'],
    mediaMain: undefined,
    archived: false,
    wholesale: 19.99,
    retail: 39.99,
    club: 33.99,
    costBefore: 7,
    costAfter: 9,
    variants: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'prod-66',
    article: 'MG-501',
    title: 'MMA Gloves',
    category: 'MMA',
    brand: 'byko' as Brand,
    taxable: true,
    attributes: ['Size', 'Color'],
    mediaMain: undefined,
    archived: false,
    wholesale: 19,
    retail: 34.99,
    club: 29.74,
    costBefore: 7,
    costAfter: 12,
    variants: [
      { 
        id: 'variant-66-1-1', 
        productId: 'prod-66',
        sku: 'MG-501-L-Black',
        attributes: { Size: 'L', Color: 'Black' }, 
        qty: 12
      },
      { 
        id: 'variant-66-1-2', 
        productId: 'prod-66',
        sku: 'MG-501-XL-Red',
        attributes: { Size: 'XL', Color: 'Red' }, 
        qty: 6
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const migratedCategories = [
  'Boxing Gloves',
  'Head Guard',
  'Groin Guards',
  'Shininsteps',
  'Coaching & Focus Mitts',
  'Punching Bags & Wall Pads Mounts',
  'Speed Balls / Platforms',
  'Clothing',
  'Accessories',
  'Coaching',
  'Protection',
  'MMA'
];

export const migrationMetadata = {
  totalProducts: migratedProducts.length,
  migrationDate: new Date().toISOString(),
  source: 'Legacy SQLite Database',
  brands: {
    greenhil: migratedProducts.filter(p => p.brand === 'greenhil').length,
    harican: migratedProducts.filter(p => p.brand === 'harican').length,
    byko: migratedProducts.filter(p => p.brand === 'byko').length,
  }
};
