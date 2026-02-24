import { UNIT_CONVERSIONS, CASE_UNIT_CATEGORIES } from './constants';

export interface Material {
  id: string;
  name: string;
  category: string;
  purchase_cost: number;
  purchase_quantity: number;
  purchase_unit: string;
  units_per_case: number | null;
  weight_per_case: number | null;
  weight_per_case_unit: string | null;
  cost_per_unit: number;
  notes: string | null;
}

export interface FormulaItem {
  id?: string;
  material_id: string;
  percentage: number;
  slot_type?: string;
  material?: Material;
  weightPerBatch?: number;
}

export interface ComponentItem {
  id?: string;
  material_id: string;
  quantity_per_unit: number;
  material?: Material;
}

export interface Product {
  id: string;
  name: string;
  product_type: string;
  units_per_batch: number;
  fill_weight_per_unit: number;
  fill_unit: string;
  labor_rate_per_hour: number;
  labor_hours_per_batch: number;
  shipping_overhead_per_batch: number;
  retail_markup: number;
  wholesale_markup: number;
  materials_cost_per_unit: number;
  packaging_cost_per_unit: number;
  labor_cost_per_unit: number;
  shipping_cost_per_unit: number;
  total_cogs_per_unit: number;
  wholesale_price: number;
  retail_price: number;
  formula_items?: FormulaItem[];
  component_items?: ComponentItem[];
}

/**
 * Calculate cost per usable unit based on purchase details
 * For weight-based case purchases (like wax), returns cost per oz
 */
export function calculateCostPerUnit(
  purchaseCost: number,
  purchaseQuantity: number,
  purchaseUnit: string,
  unitsPerCase: number | null,
  category: string,
  weightPerCase: number | null = null,
  weightPerCaseUnit: string | null = null
): number {
  // For case/pack/bag/jug/bottle/drum items with weight (e.g., wax sold as 45lb/case, fragrance oil as 30lb/jug)
  if (['case', 'pack', 'bag', 'box', 'jug', 'bottle', 'drum'].includes(purchaseUnit) && weightPerCase && weightPerCase > 0 && weightPerCaseUnit) {
    // Calculate cost per weight unit first
    const costPerWeightUnit = purchaseCost / weightPerCase;
    
    // Convert to cost per oz for consistency in formula calculations
    if (weightPerCaseUnit === 'lb') {
      return costPerWeightUnit / 16; // Convert $/lb to $/oz
    } else if (weightPerCaseUnit === 'grams') {
      return costPerWeightUnit / 28.3495; // Convert $/gram to $/oz
    }
    // Already in oz
    return costPerWeightUnit;
  }
  
  // For case/pack/bag/jug/bottle/drum items with piece count, divide by units per case
  if (['case', 'pack', 'bag', 'box', 'jug', 'bottle', 'drum'].includes(purchaseUnit) && unitsPerCase && unitsPerCase > 0) {
    return purchaseCost / unitsPerCase;
  }
  
  // For weight/volume items, calculate cost per single unit
  if (purchaseQuantity > 0) {
    return purchaseCost / purchaseQuantity;
  }
  
  return 0;
}

/**
 * Get the display unit for a material's cost per unit
 */
export function getCostPerUnitLabel(
  purchaseUnit: string, 
  category: string,
  weightPerCase: number | null = null,
  weightPerCaseUnit: string | null = null
): string {
  // For case/jug/bottle/drum with weight (like wax, fragrance oil), show per oz
  if (['case', 'pack', 'bag', 'box', 'jug', 'bottle', 'drum'].includes(purchaseUnit) && weightPerCase && weightPerCaseUnit) {
    return 'per oz';
  }
  
  // For case/pack/jug/bottle/drum with piece count
  if (['case', 'pack', 'bag', 'box', 'jug', 'bottle', 'drum'].includes(purchaseUnit)) {
    return 'per piece';
  }
  
  // For weight-based items, show cost per oz
  if (['lb'].includes(purchaseUnit)) {
    return 'per oz';
  }
  
  return `per ${purchaseUnit}`;
}

/**
 * Calculate formula costs for a product
 */
export function calculateFormulaCosts(
  formulaItems: FormulaItem[],
  totalBatchWeight: number,
  unitsPerBatch: number,
  materials: Material[]
): { 
  itemCosts: Array<{
    material: Material;
    percentage: number;
    amountPerBatch: number;
    costPerBatch: number;
    costPerUnit: number;
  }>;
  totalMaterialsCostPerUnit: number;
} {
  const itemCosts = formulaItems
    .filter(item => item.percentage > 0)
    .map(item => {
      const material = materials.find(m => m.id === item.material_id);
      if (!material) return null;

      // Use actual weight if provided (weight mode), otherwise derive from percentage
      const amountPerBatch = item.weightPerBatch != null ? item.weightPerBatch : (item.percentage / 100) * totalBatchWeight;
      
      // Get cost per oz (convert if needed)
      let costPerOz = material.cost_per_unit;
      if (material.purchase_unit === 'lb') {
        costPerOz = material.cost_per_unit / 16; // Convert $/lb to $/oz
      }
      
      // Cost per batch
      const costPerBatch = amountPerBatch * costPerOz;
      
      // Cost per unit
      const costPerUnit = unitsPerBatch > 0 ? costPerBatch / unitsPerBatch : 0;

      return {
        material,
        percentage: item.percentage,
        amountPerBatch,
        costPerBatch,
        costPerUnit
      };
    })
    .filter(Boolean) as Array<{
      material: Material;
      percentage: number;
      amountPerBatch: number;
      costPerBatch: number;
      costPerUnit: number;
    }>;

  const totalMaterialsCostPerUnit = itemCosts.reduce((sum, item) => sum + item.costPerUnit, 0);

  return { itemCosts, totalMaterialsCostPerUnit };
}

/**
 * Calculate component costs for a product
 */
export function calculateComponentCosts(
  componentItems: ComponentItem[],
  materials: Material[]
): {
  itemCosts: Array<{
    material: Material;
    quantityPerUnit: number;
    costPerUnit: number;
  }>;
  totalPackagingCostPerUnit: number;
} {
  const itemCosts = componentItems
    .filter(item => item.quantity_per_unit > 0)
    .map(item => {
      const material = materials.find(m => m.id === item.material_id);
      if (!material) return null;

      const costPerUnit = item.quantity_per_unit * material.cost_per_unit;

      return {
        material,
        quantityPerUnit: item.quantity_per_unit,
        costPerUnit
      };
    })
    .filter(Boolean) as Array<{
      material: Material;
      quantityPerUnit: number;
      costPerUnit: number;
    }>;

  const totalPackagingCostPerUnit = itemCosts.reduce((sum, item) => sum + item.costPerUnit, 0);

  return { itemCosts, totalPackagingCostPerUnit };
}

/**
 * Calculate labor cost per unit
 */
export function calculateLaborCostPerUnit(
  laborRatePerHour: number,
  laborHoursPerBatch: number,
  unitsPerBatch: number
): number {
  if (unitsPerBatch <= 0) return 0;
  const laborCostPerBatch = laborRatePerHour * laborHoursPerBatch;
  return laborCostPerBatch / unitsPerBatch;
}

/**
 * Calculate shipping/overhead cost per unit
 */
export function calculateShippingCostPerUnit(
  shippingOverheadPerBatch: number,
  unitsPerBatch: number
): number {
  if (unitsPerBatch <= 0) return 0;
  return shippingOverheadPerBatch / unitsPerBatch;
}

/**
 * Calculate total COGS per unit
 */
export function calculateTotalCOGS(
  materialsCostPerUnit: number,
  packagingCostPerUnit: number,
  laborCostPerUnit: number,
  shippingCostPerUnit: number
): number {
  return materialsCostPerUnit + packagingCostPerUnit + laborCostPerUnit + shippingCostPerUnit;
}

/**
 * Calculate wholesale price with markup
 */
export function calculateWholesalePrice(cogs: number, markupPercent: number): number {
  const price = cogs * (1 + markupPercent / 100);
  return roundToNearestHalf(price);
}

/**
 * Calculate retail price with markup
 */
export function calculateRetailPrice(cogs: number, markupPercent: number): number {
  const price = cogs * (1 + markupPercent / 100);
  return roundToNearestHalf(price);
}

/**
 * Round to nearest $0.50
 */
export function roundToNearestHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

/**
 * Format currency
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return `$${value.toFixed(decimals)}`;
}

/**
 * Calculate pack-level COGS
 */
export function calculatePackCOGS(cogsPerUnit: number, packSize: number): number {
  return cogsPerUnit * packSize;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Calculate profit margin percentage
 * Formula: ((sellingPrice - cogs) / sellingPrice) * 100
 */
export function calculateProfitMargin(sellingPrice: number, cogs: number): number {
  if (sellingPrice <= 0) return 0;
  return ((sellingPrice - cogs) / sellingPrice) * 100;
}

/**
 * Calculate the wholesale markup % needed for the maker to achieve a target margin
 * Maker margin = (wholesale - COGS) / wholesale
 * wholesale = COGS × (1 + markup/100)
 * So: margin = markup / (100 + markup)
 * Solving for markup: markup = 100 × targetMargin / (100 - targetMargin)
 */
export function calculateRetailReadyWholesaleMarkup(
  _retailMarkup: number,
  targetMargin: number = 70
): number {
  if (targetMargin >= 100) return Infinity;
  const result = 100 * targetMargin / (100 - targetMargin);
  return Math.max(0, Math.round(result * 10) / 10);
}

/**
 * Calculate the suggested retailer shelf price
 * Formula: wholesalePrice / (1 - retailerMargin / 100), rounded to nearest $0.50
 * Note: retailerMargin here is derived from the maker's target — retailers typically
 * mark up from wholesale. We estimate shelf price assuming a standard retailer margin.
 */
export function calculateRetailerShelfPrice(wholesalePrice: number, targetMargin: number = 70): number {
  if (wholesalePrice <= 0 || targetMargin >= 100) return 0;
  const price = wholesalePrice / (1 - targetMargin / 100);
  return roundToNearestHalf(price);
}

/**
 * Check if the maker's wholesale margin meets the target
 * Maker margin = (wholesalePrice - COGS) / wholesalePrice × 100
 */
export function isMakerMarginReady(
  wholesalePrice: number,
  cogs: number,
  targetMargin: number = 70
): { ready: boolean; makerMargin: number } {
  if (wholesalePrice <= 0) return { ready: false, makerMargin: 0 };
  const makerMargin = ((wholesalePrice - cogs) / wholesalePrice) * 100;
  return { ready: makerMargin >= targetMargin, makerMargin };
}

export function isRetailReady(
  wholesalePrice: number,
  retailPrice: number,
  threshold: number = 70
): { ready: boolean; retailerMargin: number } {
  if (retailPrice <= 0) return { ready: false, retailerMargin: 0 };
  const retailerMargin = ((retailPrice - wholesalePrice) / retailPrice) * 100;
  return { ready: retailerMargin >= threshold, retailerMargin };
}
