import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PRODUCT_TYPES, FILL_UNITS } from '@/lib/constants';
import { Material } from '@/hooks/useMaterials';
import { ProductWithItems, ProductFormData } from '@/hooks/useProducts';
import {
  calculateFormulaCosts,
  calculateComponentCosts,
  calculateLaborCostPerUnit,
  calculateShippingCostPerUnit,
  calculateTotalCOGS,
  calculateWholesalePrice,
  calculateRetailPrice,
  formatCurrency,
} from '@/lib/calculations';
import { formSchema, FormValues, Calculations } from './calculator';
import { FormulaSection, ComponentsSection, PricingSummary } from './calculator';

interface ProductCalculatorProps {
  product?: ProductWithItems | null;
  materials: Material[];
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// Helper to get product-specific guidance
function getProductGuidance(productType: string): { formula: string; components: string; fillLabel: string } {
  switch (productType) {
    case 'Candle':
      return {
        formula: 'Blend up to 3 waxes (totaling ~90-92%), then add fragrance oil (8-10% typical)',
        components: 'Typical components: vessel, lid, wick, labels',
        fillLabel: 'Fill Weight (oz/g)',
      };
    case 'Wax Melt':
      return {
        formula: 'Single wax (85-90%) + fragrance oil (10-15% typical)',
        components: 'Typical components: clamshell/mold, labels',
        fillLabel: 'Fill Weight (oz/g)',
      };
    case 'Reed Diffuser':
      return {
        formula: 'Base (75%) + fragrance oil (25% max per IFRA regulations)',
        components: 'Typical components: vessel, lid, reed sticks, labels',
        fillLabel: 'Fill Volume (oz/ml)',
      };
    case 'Room Spray':
      return {
        formula: 'Combine base, water, alcohol, and fragrance as needed (total 100%)',
        components: 'Typical components: spray bottle, cap, labels',
        fillLabel: 'Fill Volume (oz/ml)',
      };
    case 'Incense':
      return {
        formula: 'Base + fragrance for your incense',
        components: 'Typical components: product box, labels',
        fillLabel: 'Fill Weight',
      };
    case 'Body Butter':
      return {
        formula: 'Butters (50-70%) + carrier oils (20-40%) + essential oils/fragrance (1-3%)',
        components: 'Typical components: jar/tin, lid, labels',
        fillLabel: 'Fill Weight (oz/g)',
      };
    case 'Lotion':
      return {
        formula: 'Water phase (60-70%) + oil phase (20-30%) + emulsifier + preservative',
        components: 'Typical components: bottle/jar, pump/cap, labels',
        fillLabel: 'Fill Volume (oz/ml)',
      };
    case 'Body Oil':
      return {
        formula: 'Carrier oils (95-99%) + essential oils/fragrance (1-5%)',
        components: 'Typical components: bottle, dropper/cap, labels',
        fillLabel: 'Fill Volume (oz/ml)',
      };
    case 'Perfume':
      return {
        formula: 'Perfume base/alcohol (80-90%) + fragrance oils (10-20%)',
        components: 'Typical components: bottle, sprayer, cap, labels, box',
        fillLabel: 'Fill Volume (ml)',
      };
    case 'Cologne':
      return {
        formula: 'Alcohol (85-95%) + fragrance oils (5-15%) + water (optional)',
        components: 'Typical components: bottle, sprayer, cap, labels, box',
        fillLabel: 'Fill Volume (ml)',
      };
    case 'Soap':
      return {
        formula: 'Oils/butters (varies) + lye solution. Use a soap calculator for exact ratios.',
        components: 'Typical components: packaging, labels, shrink wrap',
        fillLabel: 'Bar Weight (oz/g)',
      };
    case 'Lip Balm':
      return {
        formula: 'Wax/butter (25-35%) + carrier oils (55-70%) + flavor/essential oil (1-5%)',
        components: 'Typical components: tube/tin, labels',
        fillLabel: 'Fill Weight (oz/g)',
      };
    default:
      return {
        formula: 'Define your recipe in percentages. Total should equal 100%.',
        components: 'Add per-piece items like vessels, packaging, labels, etc.',
        fillLabel: 'Fill Amount',
      };
  }
}

// Helper to get default fill units based on product type
function getDefaultFillUnits(productType: string): string[] {
  switch (productType) {
    case 'Candle':
    case 'Wax Melt':
    case 'Body Butter':
    case 'Soap':
    case 'Lip Balm':
      return ['oz', 'grams'];
    case 'Reed Diffuser':
    case 'Room Spray':
    case 'Lotion':
    case 'Body Oil':
      return ['oz', 'ml'];
    case 'Perfume':
    case 'Cologne':
      return ['ml', 'oz'];
    case 'Incense':
      return ['bundle'];
    default:
      return ['oz', 'ml', 'grams', 'bundle'];
  }
}

// Helper to get default formula items based on product type
function getDefaultFormulaItems(productType: string) {
  switch (productType) {
    case 'Candle':
      return [
        { material_id: '', percentage: 0, slot_type: 'wax1' },
        { material_id: '', percentage: 0, slot_type: 'wax2' },
        { material_id: '', percentage: 0, slot_type: 'wax3' },
        { material_id: '', percentage: 0, slot_type: 'fragrance' },
      ];
    case 'Wax Melt':
      return [
        { material_id: '', percentage: 0, slot_type: 'wax' },
        { material_id: '', percentage: 0, slot_type: 'fragrance' },
      ];
    case 'Body Butter':
      return [
        { material_id: '', percentage: 0, slot_type: 'butter1' },
        { material_id: '', percentage: 0, slot_type: 'butter2' },
        { material_id: '', percentage: 0, slot_type: 'carrier_oil' },
        { material_id: '', percentage: 0, slot_type: 'fragrance' },
      ];
    case 'Lotion':
      return [
        { material_id: '', percentage: 0, slot_type: 'water' },
        { material_id: '', percentage: 0, slot_type: 'oil' },
        { material_id: '', percentage: 0, slot_type: 'emulsifier' },
        { material_id: '', percentage: 0, slot_type: 'fragrance' },
      ];
    case 'Body Oil':
      return [
        { material_id: '', percentage: 0, slot_type: 'carrier_oil1' },
        { material_id: '', percentage: 0, slot_type: 'carrier_oil2' },
        { material_id: '', percentage: 0, slot_type: 'fragrance' },
      ];
    case 'Perfume':
    case 'Cologne':
      return [
        { material_id: '', percentage: 0, slot_type: 'base' },
        { material_id: '', percentage: 0, slot_type: 'fragrance' },
      ];
    case 'Lip Balm':
      return [
        { material_id: '', percentage: 0, slot_type: 'wax' },
        { material_id: '', percentage: 0, slot_type: 'butter' },
        { material_id: '', percentage: 0, slot_type: 'carrier_oil' },
        { material_id: '', percentage: 0, slot_type: 'flavor' },
      ];
    default:
      return [];
  }
}

export function ProductCalculator({
  product,
  materials,
  onSave,
  onCancel,
  isSubmitting,
}: ProductCalculatorProps) {
  const initialProductType = product?.product_type || 'Candle';
  const [formulaInputMode, setFormulaInputMode] = useState<'percentage' | 'weight'>('percentage');
  const [weights, setWeights] = useState<Record<number, number>>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      product_type: initialProductType,
      units_per_batch: product?.units_per_batch || 12,
      selling_pack_size: product?.selling_pack_size || 1,
      fill_weight_per_unit: product?.fill_weight_per_unit || 12,
      fill_unit: product?.fill_unit || 'oz',
      reed_stick_count: product?.reed_stick_count || undefined,
      labor_rate_per_hour: product?.labor_rate_per_hour || 15,
      labor_hours_per_batch: product?.labor_hours_per_batch || 2,
      shipping_overhead_per_batch: product?.shipping_overhead_per_batch || 0,
      retail_markup: product?.retail_markup || 300,
      wholesale_markup: product?.wholesale_markup || 100,
      retailer_margin_target: (product as any)?.retailer_margin_target || 70,
      retailer_margin_percent: (product as any)?.retailer_margin_percent || 50,
      formula_items: product?.formula_items?.map(item => ({
        material_id: item.material_id,
        percentage: item.percentage,
        slot_type: item.slot_type || undefined,
      })) || getDefaultFormulaItems(initialProductType),
      component_items: product?.component_items?.map(item => ({
        material_id: item.material_id,
        quantity_per_unit: item.quantity_per_unit,
        cost_basis: item.cost_basis || 'unit' as const,
      })) || [],
    },
  });

  const formulaFieldArray = useFieldArray({
    control: form.control,
    name: 'formula_items',
  });

  const componentFieldArray = useFieldArray({
    control: form.control,
    name: 'component_items',
  });

  const watchAll = form.watch();
  const productType = watchAll.product_type;
  const isCandle = productType === 'Candle';
  const isWaxMelt = productType === 'Wax Melt';
  const isReedDiffuser = productType === 'Reed Diffuser';
  const isIncense = productType === 'Incense';
  const isFlexibleFormula = !isCandle && !isWaxMelt;

  const unitName = isIncense ? 'stick' : 'unit';
  const unitNamePlural = isIncense ? 'sticks' : 'units';

  const guidance = getProductGuidance(productType);
  const availableFillUnits = getDefaultFillUnits(productType);

  // Handle product type change - reset formula items appropriately
  useEffect(() => {
    if (!product) {
      const newDefaults = getDefaultFormulaItems(productType);
      formulaFieldArray.replace(newDefaults);

      const defaultUnits = getDefaultFillUnits(productType);
      if (!defaultUnits.includes(watchAll.fill_unit)) {
        form.setValue('fill_unit', defaultUnits[0]);
      }

      if (productType === 'Incense') {
        form.setValue('fill_weight_per_unit', 1);
      }
    }
  }, [productType, product, formulaFieldArray.replace, form, watchAll.fill_unit]);

  // Sync weights to percentages when in weight mode
  useEffect(() => {
    if (formulaInputMode !== 'weight') return;
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + (w || 0), 0);
    if (totalWeight <= 0) return;

    formulaFieldArray.fields.forEach((_, index) => {
      const w = weights[index] || 0;
      const pct = (w / totalWeight) * 100;
      const currentPct = watchAll.formula_items[index]?.percentage;
      const roundedPct = Math.round(pct * 10) / 10;
      if (currentPct !== roundedPct) {
        form.setValue(`formula_items.${index}.percentage`, roundedPct, { shouldDirty: true });
      }
    });
  }, [weights, formulaInputMode, formulaFieldArray.fields.length]);

  const handleWeightChange = useCallback((index: number, value: number) => {
    setWeights(prev => ({ ...prev, [index]: value }));
  }, []);

  // Calculate totals
  const calculations: Calculations = useMemo(() => {
    const totalBatchWeight = watchAll.units_per_batch * watchAll.fill_weight_per_unit;

    const formulaItems = watchAll.formula_items.map((item, index) => ({
      material_id: item.material_id,
      percentage: item.percentage,
      slot_type: item.slot_type,
      weightPerBatch: formulaInputMode === 'weight' ? (weights[index] || 0) : undefined,
    }));

    const componentItems = watchAll.component_items.map(item => ({
      material_id: item.material_id,
      quantity_per_unit: item.quantity_per_unit,
      cost_basis: item.cost_basis || 'unit' as const,
    }));

    const { itemCosts: formulaCosts, totalMaterialsCostPerUnit } = calculateFormulaCosts(
      formulaItems,
      totalBatchWeight,
      watchAll.units_per_batch,
      materials
    );

    const { itemCosts: componentCosts, totalPackagingCostPerUnit } = calculateComponentCosts(
      componentItems,
      materials,
      watchAll.selling_pack_size || 1
    );

    const laborCostPerUnit = calculateLaborCostPerUnit(
      watchAll.labor_rate_per_hour,
      watchAll.labor_hours_per_batch,
      watchAll.units_per_batch
    );

    const shippingCostPerUnit = calculateShippingCostPerUnit(
      watchAll.shipping_overhead_per_batch,
      watchAll.units_per_batch
    );

    const totalCOGS = calculateTotalCOGS(
      totalMaterialsCostPerUnit,
      totalPackagingCostPerUnit,
      laborCostPerUnit,
      shippingCostPerUnit
    );

    const wholesalePrice = calculateWholesalePrice(totalCOGS * (watchAll.selling_pack_size || 1), watchAll.wholesale_markup);
    const retailPrice = calculateRetailPrice(totalCOGS * (watchAll.selling_pack_size || 1), watchAll.retail_markup);

    const totalPercentage = formulaItems.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0);

    const packCOGS = totalCOGS * (watchAll.selling_pack_size || 1);

    return {
      totalBatchWeight,
      formulaCosts,
      componentCosts,
      totalMaterialsCostPerUnit,
      totalPackagingCostPerUnit,
      laborCostPerUnit,
      shippingCostPerUnit,
      totalCOGS,
      packCOGS,
      wholesalePrice,
      retailPrice,
      totalPercentage,
    };
  }, [watchAll, materials, formulaInputMode, weights]);

  const handleSubmit = (values: FormValues) => {
    const formData: ProductFormData = {
      name: values.name,
      product_type: values.product_type,
      units_per_batch: values.units_per_batch,
      selling_pack_size: values.selling_pack_size || 1,
      fill_weight_per_unit: values.fill_weight_per_unit,
      fill_unit: values.fill_unit,
      reed_stick_count: values.product_type === 'Reed Diffuser' ? values.reed_stick_count : null,
      labor_rate_per_hour: values.labor_rate_per_hour,
      labor_hours_per_batch: values.labor_hours_per_batch,
      shipping_overhead_per_batch: values.shipping_overhead_per_batch,
      retail_markup: values.retail_markup,
      wholesale_markup: values.wholesale_markup,
      retailer_margin_target: values.retailer_margin_target,
      retailer_margin_percent: values.retailer_margin_percent,
      materials_cost_per_unit: calculations.totalMaterialsCostPerUnit,
      packaging_cost_per_unit: calculations.totalPackagingCostPerUnit,
      labor_cost_per_unit: calculations.laborCostPerUnit,
      shipping_cost_per_unit: calculations.shippingCostPerUnit,
      total_cogs_per_unit: calculations.totalCOGS,
      wholesale_price: calculations.wholesalePrice,
      retail_price: calculations.retailPrice,
      formula_items: values.formula_items
        .filter(item => item.material_id && item.percentage > 0)
        .map(item => ({
          material_id: item.material_id!,
          percentage: item.percentage!,
          slot_type: item.slot_type,
        })),
      component_items: values.component_items
        .filter(item => item.material_id && item.quantity_per_unit > 0)
        .map(item => ({
          material_id: item.material_id!,
          quantity_per_unit: item.quantity_per_unit!,
          cost_basis: item.cost_basis || 'unit' as const,
        })),
    };
    onSave(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Basic information about your product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 12 oz Signature Candle – Pistachio Reverie" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRODUCT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="units_per_batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isIncense ? 'Sticks per Batch' : 'Units per Batch'}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      {isIncense ? 'How many individual sticks you make in one batch' : 'How many finished products per batch'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="selling_pack_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isIncense ? 'Sticks per Pack' : 'Units per Selling Pack'}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      {isIncense
                        ? 'How many sticks go into one sellable pack'
                        : 'How many units in one sellable pack (e.g., 10 sticks per pack). Use 1 if sold individually.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isIncense && (
                <FormField
                  control={form.control}
                  name="fill_weight_per_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{guidance.fillLabel}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormDescription>Amount that goes into ONE finished product</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {!isIncense && (
                <FormField
                  control={form.control}
                  name="fill_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fill Unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FILL_UNITS.filter(u => availableFillUnits.includes(u)).map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isReedDiffuser && (
                <FormField
                  control={form.control}
                  name="reed_stick_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reed Sticks per Unit</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>Number of reed sticks included</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="rounded-lg bg-secondary/50 p-4 space-y-1">
              {isIncense ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Sticks per batch:</span>{' '}
                    <span className="text-foreground font-semibold">{watchAll.units_per_batch}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Sticks per pack:</span>{' '}
                    <span className="text-foreground font-semibold">{watchAll.selling_pack_size || 1}</span>
                  </p>
                  {(watchAll.selling_pack_size || 1) > 1 && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Packs per batch:</span>{' '}
                      <span className="text-foreground font-semibold">
                        {Math.floor(watchAll.units_per_batch / watchAll.selling_pack_size)}
                      </span>
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Total batch size:</span>{' '}
                    <span className="text-foreground font-semibold">
                      {calculations.totalBatchWeight.toFixed(2)} {watchAll.fill_unit}
                    </span>
                  </p>
                  {(watchAll.selling_pack_size || 1) > 1 && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Packs per batch:</span>{' '}
                      <span className="text-foreground font-semibold">
                        {Math.floor(watchAll.units_per_batch / watchAll.selling_pack_size)}
                      </span>
                    </p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Formula Section */}
        <FormulaSection
          form={form}
          calculations={calculations}
          watchAll={watchAll}
          materials={materials}
          formulaFieldArray={formulaFieldArray}
          guidance={guidance}
          productType={productType}
          isCandle={isCandle}
          isWaxMelt={isWaxMelt}
          isFlexibleFormula={isFlexibleFormula}
          formulaInputMode={formulaInputMode}
          setFormulaInputMode={setFormulaInputMode}
          weights={weights}
          onWeightChange={handleWeightChange}
        />

        {/* Components Section */}
        <ComponentsSection
          form={form}
          calculations={calculations}
          watchAll={watchAll}
          materials={materials}
          componentFieldArray={componentFieldArray}
          guidance={guidance}
          unitName={unitName}
        />

        {/* Labor & Overhead */}
        <Card>
          <CardHeader>
            <CardTitle>Labor & Overhead</CardTitle>
            <CardDescription>
              Add labor costs and shipping/overhead allocations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="labor_rate_per_hour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labor Rate ($/hour)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="labor_hours_per_batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labor Hours per Batch</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.25" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Labor cost per batch</span>
                <span>{formatCurrency(watchAll.labor_rate_per_hour * watchAll.labor_hours_per_batch)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium mt-1">
                <span>Labor cost per unit</span>
                <span className="text-primary">{formatCurrency(calculations.laborCostPerUnit, 4)}</span>
              </div>
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="shipping_overhead_per_batch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping & Overhead per Batch ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Allocate average shipping boxes, filler, tape, platform fees, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between text-sm font-medium">
                <span>Shipping/overhead per unit</span>
                <span className="text-primary">{formatCurrency(calculations.shippingCostPerUnit, 4)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Summary */}
        <PricingSummary
          form={form}
          calculations={calculations}
          watchAll={watchAll}
          unitName={unitName}
          unitNamePlural={unitNamePlural}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
