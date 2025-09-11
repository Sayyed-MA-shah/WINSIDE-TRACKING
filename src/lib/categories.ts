// Predefined product categories for consistent categorization
export const PRODUCT_CATEGORIES = [
  'Boxing Gloves',
  'Boxing Equipment', 
  'MMA Gear',
  'Fitness Equipment',
  'Apparel',
  'Accessories',
  'Training Equipment',
  'Protective Gear',
  'Electronics',
  'Clothing',
  'Sports Equipment',
  'Health & Wellness',
  'Home & Garden',
  'Books & Media',
  'Tools & Hardware',
  'Beauty & Personal Care',
  'Automotive',
  'Office Supplies',
  'Toys & Games',
  'Food & Beverages',
  'Other'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// Function to normalize category names to match predefined categories
export const normalizeCategory = (inputCategory: string): string => {
  if (!inputCategory) return 'Other';
  
  const input = inputCategory.trim().toLowerCase();
  
  // Mapping of common variations to standard categories
  const categoryMappings: Record<string, string> = {
    'boxing gloves': 'Boxing Gloves',
    'boxing glove': 'Boxing Gloves',
    'gloves': 'Boxing Gloves',
    'boxing': 'Boxing Equipment',
    'mma': 'MMA Gear',
    'mixed martial arts': 'MMA Gear',
    'fitness': 'Fitness Equipment',
    'workout': 'Fitness Equipment',
    'gym': 'Fitness Equipment',
    'clothes': 'Clothing',
    'clothing': 'Clothing',
    'apparel': 'Apparel',
    'shirt': 'Clothing',
    'shirts': 'Clothing',
    't-shirt': 'Clothing',
    't-shirts': 'Clothing',
    'pants': 'Clothing',
    'shorts': 'Clothing',
    'electronics': 'Electronics',
    'electronic': 'Electronics',
    'tech': 'Electronics',
    'sports': 'Sports Equipment',
    'sport': 'Sports Equipment',
    'training': 'Training Equipment',
    'protective': 'Protective Gear',
    'protection': 'Protective Gear',
    'safety': 'Protective Gear',
    'accessories': 'Accessories',
    'accessory': 'Accessories'
  };

  // Check for exact match in mappings
  if (categoryMappings[input]) {
    return categoryMappings[input];
  }

  // Check if input contains any of the mapping keys
  for (const [key, value] of Object.entries(categoryMappings)) {
    if (input.includes(key)) {
      return value;
    }
  }

  // Check for exact match in predefined categories (case insensitive)
  const exactMatch = PRODUCT_CATEGORIES.find(
    cat => cat.toLowerCase() === input
  );
  if (exactMatch) {
    return exactMatch;
  }

  // If no match found, capitalize the input properly
  return inputCategory
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Function to get all categories (predefined + existing custom ones)
export const getAllCategories = (existingCategories: string[] = []): string[] => {
  const allCategories = new Set<string>([...PRODUCT_CATEGORIES]);
  
  // Add any existing categories that aren't in predefined list
  existingCategories.forEach(cat => {
    if (cat && cat.trim()) {
      allCategories.add(normalizeCategory(cat));
    }
  });
  
  return Array.from(allCategories).sort();
};
