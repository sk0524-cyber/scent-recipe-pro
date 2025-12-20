import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PRODUCT_TYPES, FILL_UNITS, FORMULA_CATEGORIES, COMPONENT_CATEGORIES } from '@/lib/constants';
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

const formulaItemSchema = z.object({
  material_id: z.string(),
  percentage: z.coerce.number().min(0).max(100),
  slot_type: z.string().optional(),
});

const componentItemSchema = z.object({
  material_id: z.string(),
  quantity_per_unit: z.coerce.number().min(0),
});

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  product_type: z.string().min(1, 'Product type is required'),
  units_per_batch: z.coerce.number().min(1, 'Must produce at least 1 unit'),
  fill_weight_per_unit: z.coerce.number().min(0.001, 'Fill weight must be greater than 0'),
  fill_unit: z.string().min(1, 'Fill unit is required'),
  reed_stick_count: z.coerce.number().min(0).optional(),
  labor_rate_per_hour: z.coerce.number().min(0),
  labor_hours_per_batch: z.coerce.number().min(0),
  shipping_overhead_per_batch: z.coerce.number().min(0),
  retail_markup: z.coerce.number().min(0),
  wholesale_markup: z.coerce.number().min(0),
  formula_items: z.array(formulaItemSchema),
  component_items: z.array(componentItemSchema),
});

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
        formula: 'Base + fragrance for your bundle',
        components: 'Typical components: product box, labels',
        fillLabel: 'Units per Bundle',
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
      return ['oz', 'grams'];
    case 'Reed Diffuser':
    case 'Room Spray':
      return ['oz', 'ml'];
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
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      product_type: initialProductType,
      units_per_batch: product?.units_per_batch || 12,
      fill_weight_per_unit: product?.fill_weight_per_unit || 12,
      fill_unit: product?.fill_unit || 'oz',
      reed_stick_count: product?.reed_stick_count || undefined,
      labor_rate_per_hour: product?.labor_rate_per_hour || 15,
      labor_hours_per_batch: product?.labor_hours_per_batch || 2,
      shipping_overhead_per_batch: product?.shipping_overhead_per_batch || 0,
      retail_markup: product?.retail_markup || 300,
      wholesale_markup: product?.wholesale_markup || 100,
      formula_items: product?.formula_items?.map(item => ({
        material_id: item.material_id,
        percentage: item.percentage,
        slot_type: item.slot_type || undefined,
      })) || getDefaultFormulaItems(initialProductType),
      component_items: product?.component_items?.map(item => ({
        material_id: item.material_id,
        quantity_per_unit: item.quantity_per_unit,
      })) || [],
    },
  });

  const {
    fields: formulaFields,
    append: appendFormula,
    remove: removeFormula,
    replace: replaceFormula,
  } = useFieldArray({
    control: form.control,
    name: 'formula_items',
  });

  const {
    fields: componentFields,
    append: appendComponent,
    remove: removeComponent,
  } = useFieldArray({
    control: form.control,
    name: 'component_items',
  });

  const watchAll = form.watch();
  const productType = watchAll.product_type;
  const isCandle = productType === 'Candle';
  const isWaxMelt = productType === 'Wax Melt';
  const isReedDiffuser = productType === 'Reed Diffuser';
  const isFlexibleFormula = !isCandle && !isWaxMelt;
  
  const guidance = getProductGuidance(productType);
  const availableFillUnits = getDefaultFillUnits(productType);

  // Handle product type change - reset formula items appropriately
  useEffect(() => {
    if (!product) {
      const newDefaults = getDefaultFormulaItems(productType);
      replaceFormula(newDefaults);
      
      // Set appropriate default fill unit
      const defaultUnits = getDefaultFillUnits(productType);
      if (!defaultUnits.includes(watchAll.fill_unit)) {
        form.setValue('fill_unit', defaultUnits[0]);
      }
    }
  }, [productType, product, replaceFormula, form, watchAll.fill_unit]);

  // Filter materials by category for dropdowns
  const waxMaterials = materials.filter(m => m.category === 'Wax');
  const fragranceMaterials = materials.filter(m => m.category === 'Fragrance Oil');
  const formulaMaterials = materials.filter(m => FORMULA_CATEGORIES.includes(m.category));
  const componentMaterials = materials.filter(m => COMPONENT_CATEGORIES.includes(m.category));

  // Calculate totals
  const calculations = useMemo(() => {
    const totalBatchWeight = watchAll.units_per_batch * watchAll.fill_weight_per_unit;
    
    const formulaItems = watchAll.formula_items.map(item => ({
      material_id: item.material_id,
      percentage: item.percentage,
      slot_type: item.slot_type,
    }));

    const componentItems = watchAll.component_items.map(item => ({
      material_id: item.material_id,
      quantity_per_unit: item.quantity_per_unit,
    }));

    const { itemCosts: formulaCosts, totalMaterialsCostPerUnit } = calculateFormulaCosts(
      formulaItems,
      totalBatchWeight,
      watchAll.units_per_batch,
      materials
    );

    const { itemCosts: componentCosts, totalPackagingCostPerUnit } = calculateComponentCosts(
      componentItems,
      materials
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

    const wholesalePrice = calculateWholesalePrice(totalCOGS, watchAll.wholesale_markup);
    const retailPrice = calculateRetailPrice(totalCOGS, watchAll.retail_markup);

    const totalPercentage = formulaItems.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0);

    return {
      totalBatchWeight,
      formulaCosts,
      componentCosts,
      totalMaterialsCostPerUnit,
      totalPackagingCostPerUnit,
      laborCostPerUnit,
      shippingCostPerUnit,
      totalCOGS,
      wholesalePrice,
      retailPrice,
      totalPercentage,
    };
  }, [watchAll, materials]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const formData: ProductFormData = {
      name: values.name,
      product_type: values.product_type,
      units_per_batch: values.units_per_batch,
      fill_weight_per_unit: values.fill_weight_per_unit,
      fill_unit: values.fill_unit,
      reed_stick_count: values.product_type === 'Reed Diffuser' ? values.reed_stick_count : null,
      labor_rate_per_hour: values.labor_rate_per_hour,
      labor_hours_per_batch: values.labor_hours_per_batch,
      shipping_overhead_per_batch: values.shipping_overhead_per_batch,
      retail_markup: values.retail_markup,
      wholesale_markup: values.wholesale_markup,
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
        })),
    };
    onSave(formData);
  };

  // Render formula percentage progress
  const renderFormulaProgress = () => {
    if (calculations.totalPercentage === 0) return null;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Formula Total</span>
          <span className={`font-medium ${
            calculations.totalPercentage === 100 
              ? 'text-green-600 dark:text-green-400' 
              : calculations.totalPercentage > 100 
                ? 'text-orange-600 dark:text-orange-400' 
                : 'text-destructive'
          }`}>
            {calculations.totalPercentage.toFixed(1)}%
            {calculations.totalPercentage !== 100 && (
              <span className="ml-1 text-xs font-normal">
                ({calculations.totalPercentage < 100 ? `${(100 - calculations.totalPercentage).toFixed(1)}% remaining` : `${(calculations.totalPercentage - 100).toFixed(1)}% over`})
              </span>
            )}
          </span>
        </div>
        <div className="relative">
          <Progress 
            value={Math.min(calculations.totalPercentage, 100)} 
            className={`h-2 ${
              calculations.totalPercentage === 100 
                ? '[&>div]:bg-green-500' 
                : calculations.totalPercentage > 100 
                  ? '[&>div]:bg-orange-500' 
                  : '[&>div]:bg-destructive'
            }`}
          />
        </div>
        {calculations.totalPercentage !== 100 && (
          <div className={`flex items-center gap-2 text-xs ${
            calculations.totalPercentage > 100 
              ? 'text-orange-600 dark:text-orange-400' 
              : 'text-destructive'
          }`}>
            <AlertTriangle className="h-3 w-3" />
            <span>
              {calculations.totalPercentage < 100 
                ? 'Add more ingredients to reach 100%' 
                : 'Reduce percentages to equal 100%'}
            </span>
          </div>
        )}
        {calculations.totalPercentage === 100 && (
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Formula is complete</span>
          </div>
        )}
      </div>
    );
  };

  // Render candle formula (3 wax slots + 1 fragrance)
  const renderCandleFormula = () => (
    <div className="space-y-4">
      {/* Wax slots */}
      {formulaFields.slice(0, 3).map((field, index) => (
        <div key={field.id} className="grid gap-4 sm:grid-cols-[1fr,100px]">
          <FormField
            control={form.control}
            name={`formula_items.${index}.material_id`}
            render={({ field: selectField }) => (
              <FormItem>
                <FormLabel>Wax {index + 1} {index > 0 && '(optional)'}</FormLabel>
                <Select onValueChange={(val) => selectField.onChange(val === "__none__" ? "" : val)} value={selectField.value || "__none__"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wax" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {waxMaterials.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`formula_items.${index}.percentage`}
            render={({ field: inputField }) => (
              <FormItem>
                <FormLabel>%</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" max="100" {...inputField} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      ))}

      <Separator />

      {/* Fragrance slot */}
      {formulaFields.length >= 4 && (
        <div className="grid gap-4 sm:grid-cols-[1fr,100px]">
          <FormField
            control={form.control}
            name={`formula_items.3.material_id`}
            render={({ field: selectField }) => (
              <FormItem>
                <FormLabel>Fragrance Oil</FormLabel>
                <Select onValueChange={(val) => selectField.onChange(val === "__none__" ? "" : val)} value={selectField.value || "__none__"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fragrance" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {fragranceMaterials.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`formula_items.3.percentage`}
            render={({ field: inputField }) => (
              <FormItem>
                <FormLabel>%</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" max="100" {...inputField} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );

  // Render wax melt formula (1 wax + 1 fragrance)
  const renderWaxMeltFormula = () => (
    <div className="space-y-4">
      {/* Single wax slot */}
      {formulaFields.length >= 1 && (
        <div className="grid gap-4 sm:grid-cols-[1fr,100px]">
          <FormField
            control={form.control}
            name={`formula_items.0.material_id`}
            render={({ field: selectField }) => (
              <FormItem>
                <FormLabel>Wax</FormLabel>
                <Select onValueChange={(val) => selectField.onChange(val === "__none__" ? "" : val)} value={selectField.value || "__none__"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wax" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {waxMaterials.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`formula_items.0.percentage`}
            render={({ field: inputField }) => (
              <FormItem>
                <FormLabel>%</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" max="100" {...inputField} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}

      <Separator />

      {/* Fragrance slot */}
      {formulaFields.length >= 2 && (
        <div className="grid gap-4 sm:grid-cols-[1fr,100px]">
          <FormField
            control={form.control}
            name={`formula_items.1.material_id`}
            render={({ field: selectField }) => (
              <FormItem>
                <FormLabel>Fragrance Oil</FormLabel>
                <Select onValueChange={(val) => selectField.onChange(val === "__none__" ? "" : val)} value={selectField.value || "__none__"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fragrance" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {fragranceMaterials.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`formula_items.1.percentage`}
            render={({ field: inputField }) => (
              <FormItem>
                <FormLabel>%</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" max="100" {...inputField} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );

  // Render flexible formula (add/remove any materials)
  const renderFlexibleFormula = () => (
    <div className="space-y-4">
      {formulaFields.map((field, index) => (
        <div key={field.id} className="grid gap-4 sm:grid-cols-[1fr,100px,auto]">
          <FormField
            control={form.control}
            name={`formula_items.${index}.material_id`}
            render={({ field: selectField }) => (
              <FormItem>
                <FormLabel className={index > 0 ? 'sr-only' : ''}>Material</FormLabel>
                <Select onValueChange={selectField.onChange} value={selectField.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {formulaMaterials.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({m.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`formula_items.${index}.percentage`}
            render={({ field: inputField }) => (
              <FormItem>
                <FormLabel className={index > 0 ? 'sr-only' : ''}>%</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" min="0" max="100" {...inputField} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-8"
            onClick={() => removeFormula(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => appendFormula({ material_id: '', percentage: 0, slot_type: 'custom' })}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Formula Item
      </Button>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Basic Info */}
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
                    <FormLabel>Units per Batch</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>How many finished products per batch</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Reed Stick Count - only for Reed Diffusers */}
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

            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Total batch size:</span>{' '}
                <span className="text-foreground font-semibold">
                  {calculations.totalBatchWeight.toFixed(2)} {watchAll.fill_unit}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Formula Section */}
        <Card>
          <CardHeader>
            <CardTitle>Formula (Percentages)</CardTitle>
            <CardDescription>{guidance.formula}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formula percentage progress bar */}
            {renderFormulaProgress()}

            {/* Render appropriate formula UI based on product type */}
            {isCandle && renderCandleFormula()}
            {isWaxMelt && renderWaxMeltFormula()}
            {isFlexibleFormula && renderFlexibleFormula()}

            {/* Formula cost breakdown */}
            {calculations.formulaCosts.length > 0 && (
              <div className="mt-6 rounded-lg bg-muted/50 p-4">
                <h4 className="text-sm font-medium mb-3">Formula Cost Breakdown</h4>
                <div className="space-y-2 text-sm">
                  {calculations.formulaCosts.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {item.material.name} ({item.percentage}% = {item.amountPerBatch.toFixed(2)} {watchAll.fill_unit})
                      </span>
                      <span>{formatCurrency(item.costPerUnit, 4)}/unit</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total Materials</span>
                    <span className="text-primary">{formatCurrency(calculations.totalMaterialsCostPerUnit, 4)}/unit</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Components Section */}
        <Card>
          <CardHeader>
            <CardTitle>Packaging & Components</CardTitle>
            <CardDescription>{guidance.components}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {componentFields.map((field, index) => (
              <div key={field.id} className="grid gap-4 sm:grid-cols-[1fr,100px,auto]">
                <FormField
                  control={form.control}
                  name={`component_items.${index}.material_id`}
                  render={({ field: selectField }) => (
                    <FormItem>
                      <FormLabel className={index > 0 ? 'sr-only' : ''}>Component</FormLabel>
                      <Select onValueChange={selectField.onChange} value={selectField.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select component" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {componentMaterials.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name} ({formatCurrency(m.cost_per_unit, 4)}/ea)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`component_items.${index}.quantity_per_unit`}
                  render={({ field: inputField }) => (
                    <FormItem>
                      <FormLabel className={index > 0 ? 'sr-only' : ''}>Qty</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="0" {...inputField} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={index === 0 ? 'mt-8' : 'mt-0'}
                  onClick={() => removeComponent(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendComponent({ material_id: '', quantity_per_unit: 1 })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Component
            </Button>

            {/* Component cost breakdown */}
            {calculations.componentCosts.length > 0 && (
              <div className="mt-6 rounded-lg bg-muted/50 p-4">
                <h4 className="text-sm font-medium mb-3">Component Cost Breakdown</h4>
                <div className="space-y-2 text-sm">
                  {calculations.componentCosts.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {item.material.name} × {item.quantityPerUnit}
                      </span>
                      <span>{formatCurrency(item.costPerUnit, 4)}/unit</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total Packaging</span>
                    <span className="text-primary">{formatCurrency(calculations.totalPackagingCostPerUnit, 4)}/unit</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Labor & Overhead Section */}
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

        {/* Pricing Section */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>COGS & Pricing Summary</CardTitle>
            <CardDescription>
              Your calculated costs and suggested prices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cost breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Materials cost per unit</span>
                <span>{formatCurrency(calculations.totalMaterialsCostPerUnit, 4)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Packaging & components per unit</span>
                <span>{formatCurrency(calculations.totalPackagingCostPerUnit, 4)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Labor per unit</span>
                <span>{formatCurrency(calculations.laborCostPerUnit, 4)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Shipping/overhead per unit</span>
                <span>{formatCurrency(calculations.shippingCostPerUnit, 4)}</span>
              </div>
              <div className="flex justify-between py-3 bg-primary/5 rounded-lg px-4 -mx-4">
                <span className="font-display text-lg font-semibold">Total COGS per unit</span>
                <span className="font-display text-xl font-bold text-primary">
                  {formatCurrency(calculations.totalCOGS)}
                </span>
              </div>
            </div>

            <Separator />

            {/* Markup inputs */}
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="wholesale_markup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wholesale Markup (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" {...field} />
                    </FormControl>
                    <FormDescription>100% = 2× COGS</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="retail_markup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retail Markup (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" {...field} />
                    </FormControl>
                    <FormDescription>300% = 4× COGS</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Final prices */}
            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              <div className="rounded-xl bg-secondary p-6 text-center">
                <p className="text-sm text-secondary-foreground/70 mb-2">Wholesale Price</p>
                <p className="font-display text-3xl font-bold text-secondary-foreground">
                  {formatCurrency(calculations.wholesalePrice)}
                </p>
                <p className="text-xs text-secondary-foreground/60 mt-1">
                  Rounded to nearest $0.50
                </p>
              </div>
              <div className="rounded-xl bg-primary p-6 text-center">
                <p className="text-sm text-primary-foreground/70 mb-2">Retail Price</p>
                <p className="font-display text-3xl font-bold text-primary-foreground">
                  {formatCurrency(calculations.retailPrice)}
                </p>
                <p className="text-xs text-primary-foreground/60 mt-1">
                  Rounded to nearest $0.50
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
