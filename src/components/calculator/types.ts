import { z } from 'zod';
import { UseFormReturn } from 'react-hook-form';
import { Material } from '@/hooks/useMaterials';

// --- Zod Schemas ---

export const formulaItemSchema = z.object({
  material_id: z.string(),
  percentage: z.coerce.number().min(0).max(100),
  slot_type: z.string().optional(),
});

export const componentItemSchema = z.object({
  material_id: z.string(),
  quantity_per_unit: z.coerce.number().min(0),
});

export const formSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  product_type: z.string().min(1, 'Product type is required'),
  units_per_batch: z.coerce.number().min(1, 'Must produce at least 1 unit'),
  selling_pack_size: z.coerce.number().min(1, 'Pack size must be at least 1'),
  fill_weight_per_unit: z.coerce.number().min(0.001, 'Fill weight must be greater than 0'),
  fill_unit: z.string().min(1, 'Fill unit is required'),
  reed_stick_count: z.coerce.number().min(0).optional(),
  labor_rate_per_hour: z.coerce.number().min(0),
  labor_hours_per_batch: z.coerce.number().min(0),
  shipping_overhead_per_batch: z.coerce.number().min(0),
  retail_markup: z.coerce.number().min(0),
  wholesale_markup: z.coerce.number().min(0),
  retailer_margin_target: z.coerce.number().min(30).max(90),
  retailer_margin_percent: z.coerce.number().min(10).max(80),
  formula_items: z.array(formulaItemSchema),
  component_items: z.array(componentItemSchema),
});

export type FormValues = z.infer<typeof formSchema>;

// --- Shared Calculated Values ---

export interface FormulaItemCost {
  material: Material;
  percentage: number;
  amountPerBatch: number;
  costPerBatch: number;
  costPerUnit: number;
}

export interface ComponentItemCost {
  material: Material;
  quantityPerUnit: number;
  costPerUnit: number;
}

export interface Calculations {
  totalBatchWeight: number;
  formulaCosts: FormulaItemCost[];
  componentCosts: ComponentItemCost[];
  totalMaterialsCostPerUnit: number;
  totalPackagingCostPerUnit: number;
  laborCostPerUnit: number;
  shippingCostPerUnit: number;
  totalCOGS: number;
  wholesalePrice: number;
  retailPrice: number;
  totalPercentage: number;
}

// --- Common Props ---

export interface CalculatorFormProps {
  form: UseFormReturn<FormValues>;
  calculations: Calculations;
  watchAll: FormValues;
}
