export const MATERIAL_CATEGORIES = [
  'Wax',
  'Fragrance Oil',
  'Essential Oil',
  'Carrier Oil',
  'Butter',
  'Solid Oil',
  'Perfume Base',
  'Reed Diffuser Base',
  'Room Spray Base',
  'Incense Base',
  'Stabilizer',
  'Alcohol',
  'Water',
  'Candle Vessel',
  'Wax Melt Vessel',
  'Diffuser Vessel',
  'Spray Bottle',
  'Spray Cap',
  'Candle Vessel Lid',
  'Diffuser Vessel Lid',
  'Cotton Wick',
  'Wooden Wick',
  'Reed Stick',
  'Incense Stick',
  'Product Box',
  'Packaging',
  'Labeling',
  'Other'
] as const;

export const PURCHASE_UNITS = [
  'lb',
  'oz',
  'grams',
  'ml',
  'each',
  'case',
  'pack',
  'bag',
  'box',
  'jug',
  'bottle',
  'drum'
] as const;

export const PRODUCT_TYPES = [
  'Candle',
  'Wax Melt',
  'Reed Diffuser',
  'Room Spray',
  'Incense',
  'Body Butter',
  'Lotion',
  'Body Oil',
  'Perfume',
  'Cologne',
  'Soap',
  'Lip Balm',
  'Other'
] as const;

export const FILL_UNITS = ['oz', 'ml', 'grams', 'bundle'] as const;

export type MaterialCategory = typeof MATERIAL_CATEGORIES[number];
export type PurchaseUnit = typeof PURCHASE_UNITS[number];
export type ProductType = typeof PRODUCT_TYPES[number];
export type FillUnit = typeof FILL_UNITS[number];

// Unit conversion helpers
export const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  lb: { oz: 16, grams: 453.592 },
  oz: { lb: 1/16, grams: 28.3495, ml: 29.5735 },
  grams: { oz: 1/28.3495, lb: 1/453.592, ml: 1 },
  ml: { oz: 1/29.5735, grams: 1 }
};

// Weight units for case purchases
export const WEIGHT_UNITS = ['lb', 'oz', 'grams'] as const;
export type WeightUnit = typeof WEIGHT_UNITS[number];

// Categories that can have weight-based case pricing (e.g., wax sold by lb per case)
export const WEIGHT_BASED_CATEGORIES = [
  'Wax',
  'Fragrance Oil',
  'Essential Oil',
  'Carrier Oil',
  'Butter',
  'Solid Oil',
  'Perfume Base',
  'Reed Diffuser Base',
  'Room Spray Base',
  'Incense Base',
  'Stabilizer'
];

// Categories that typically use "per case/pack" pricing
export const CASE_UNIT_CATEGORIES = [
  'Candle Vessel',
  'Diffuser Vessel', 
  'Candle Vessel Lid',
  'Wooden Wick',
  'Reed Stick',
  'Incense Stick',
  'Packaging',
  'Labeling'
];

// Categories available for formula percentages (waxes/bases/oils)
export const FORMULA_CATEGORIES = [
  'Wax',
  'Fragrance Oil',
  'Essential Oil',
  'Carrier Oil',
  'Butter',
  'Solid Oil',
  'Perfume Base',
  'Reed Diffuser Base',
  'Room Spray Base',
  'Incense Base',
  'Stabilizer',
  'Alcohol',
  'Water'
];

// Categories available for per-piece components
export const COMPONENT_CATEGORIES = [
  'Candle Vessel',
  'Wax Melt Vessel',
  'Diffuser Vessel',
  'Spray Bottle',
  'Spray Cap',
  'Candle Vessel Lid',
  'Diffuser Vessel Lid',
  'Cotton Wick',
  'Wooden Wick',
  'Reed Stick',
  'Incense Stick',
  'Product Box',
  'Packaging',
  'Labeling',
  'Other'
];
