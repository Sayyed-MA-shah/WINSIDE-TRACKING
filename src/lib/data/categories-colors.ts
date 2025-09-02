import { Brand } from '../types';

// All categories from legacy database
export const allCategories = [
  'Boxing Gloves',
  'HEAD GUARD', 
  'Groin Guards',
  'Shininsteps',
  'Coaching & Focus Mitts',
  'Punching Bags & Wall Pads Mounts',
  'Speed Balls / Platforms',
  'Clothing',
  'accessories',
  'Coaching',
  'Protection',
  'MMA',
  'Head Guard'
];

// All colors from legacy database
export const allColors = [
  'Black',
  'WHITE',
  'RED', 
  'GOLDEN',
  'Black & Red',
  'Red & Golden',
  'MAROON',
  'PURPLE',
  'GREEN',
  'WHITE & GOLD',
  'BLACK & GOLD',
  'PINK',
  'Blue',
  'Golden & Black',
  'Black & White',
  'Natural',
  'Grey',
  'Yellow',
  'Navy',
  'Assorted',
  'WHITE & RED',
  'WHITE & BLUE'
];

// Category mapping from ID to name
export const categoryMap: Record<string, string> = {
  '1': 'Boxing Gloves',
  '2': 'HEAD GUARD',
  '3': 'Groin Guards', 
  '4': 'Shininsteps',
  '5': 'Coaching & Focus Mitts',
  '6': 'Punching Bags & Wall Pads Mounts',
  '7': 'Speed Balls / Platforms',
  '8': 'Clothing',
  '9': 'accessories',
  '10': 'Coaching',
  '11': 'Protection',
  '12': 'MMA',
  '13': 'Head Guard'
};

// Color mapping from ID to name
export const colorMap: Record<string, string> = {
  '1': 'Black',
  '2': 'WHITE',
  '3': 'RED',
  '4': 'GOLDEN',
  '5': 'Black & Red',
  '6': 'Red & Golden',
  '7': 'MAROON',
  '8': 'PURPLE',
  '9': 'GREEN',
  '10': 'WHITE & GOLD',
  '11': 'BLACK & GOLD',
  '12': 'PINK',
  '13': 'Blue',
  '14': 'Golden & Black',
  '16': 'Black & White',
  '18': 'Natural',
  '19': 'Grey',
  '20': 'Yellow',
  '21': 'Navy',
  '22': 'Assorted',
  '23': 'WHITE & RED',
  '24': 'WHITE & BLUE'
};

// Helper function to assign brands in a distributed way
export function assignBrand(productId: number): Brand {
  // Distribute products across brands based on ID
  const remainder = productId % 3;
  switch (remainder) {
    case 0: return 'greenhil';
    case 1: return 'harican';
    case 2: return 'byko';
    default: return 'greenhil';
  }
}

// Migration metadata
export const fullMigrationMetadata = {
  totalCategories: allCategories.length,
  totalColors: allColors.length,
  migrationDate: new Date().toISOString(),
  source: 'Legacy SQLite Database - Full Import',
  status: 'Categories and Colors Ready - Awaiting Products Data'
};
