import { useMemo } from 'react';
import { UseFieldArrayReturn } from 'react-hook-form';
import { Plus, Trash2, AlertTriangle, CheckCircle2, Scale, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { FORMULA_CATEGORIES } from '@/lib/constants';
import { Material } from '@/hooks/useMaterials';
import { formatCurrency } from '@/lib/calculations';
import { CalculatorFormProps, FormValues } from './types';

interface FormulaSectionProps extends CalculatorFormProps {
  materials: Material[];
  formulaFieldArray: UseFieldArrayReturn<FormValues, 'formula_items', 'id'>;
  guidance: { formula: string; components: string; fillLabel: string };
  productType: string;
  isCandle: boolean;
  isWaxMelt: boolean;
  isFlexibleFormula: boolean;
  formulaInputMode: 'percentage' | 'weight';
  setFormulaInputMode: (mode: 'percentage' | 'weight') => void;
  weights: Record<number, number>;
  onWeightChange: (index: number, value: number) => void;
}

export function FormulaSection({
  form,
  calculations,
  watchAll,
  materials,
  formulaFieldArray,
  guidance,
  productType,
  isCandle,
  isWaxMelt,
  isFlexibleFormula,
  formulaInputMode,
  setFormulaInputMode,
  weights,
  onWeightChange,
}: FormulaSectionProps) {
  const { fields: formulaFields, append: appendFormula, remove: removeFormula } = formulaFieldArray;

  const totalWeight = useMemo(() =>
    Object.values(weights).reduce((sum, w) => sum + (w || 0), 0),
    [weights]
  );

  // Material filters
  const waxMaterials = materials.filter(m => m.category === 'Wax');
  const fragranceMaterials = materials.filter(m => m.category === 'Fragrance Oil');
  const formulaMaterials = materials.filter(m => FORMULA_CATEGORIES.includes(m.category));

  // --- Render Helpers ---

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

  const renderFormulaInput = (index: number, label: string = '%', hideLabel: boolean = false) => {
    if (formulaInputMode === 'weight') {
      const pct = watchAll.formula_items[index]?.percentage || 0;
      return (
        <FormItem>
          <FormLabel className={hideLabel ? 'sr-only' : ''}>oz</FormLabel>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={weights[index] || ''}
              onChange={(e) => onWeightChange(index, parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
            <Badge variant="secondary" className="whitespace-nowrap text-xs">
              {pct.toFixed(1)}%
            </Badge>
          </div>
        </FormItem>
      );
    }

    return (
      <FormField
        control={form.control}
        name={`formula_items.${index}.percentage`}
        render={({ field: inputField }) => (
          <FormItem>
            <FormLabel className={hideLabel ? 'sr-only' : ''}>{label}</FormLabel>
            <FormControl>
              <Input type="number" step="0.1" min="0" max="100" {...inputField} />
            </FormControl>
          </FormItem>
        )}
      />
    );
  };

  const renderCandleFormula = () => (
    <div className="space-y-4">
      {formulaFields.slice(0, 3).map((field, index) => (
        <div key={field.id} className="grid gap-4 sm:grid-cols-[1fr,auto]">
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
          {renderFormulaInput(index)}
        </div>
      ))}
      <Separator />
      {formulaFields.length >= 4 && (
        <div className="grid gap-4 sm:grid-cols-[1fr,auto]">
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
          {renderFormulaInput(3)}
        </div>
      )}
    </div>
  );

  const renderWaxMeltFormula = () => (
    <div className="space-y-4">
      {formulaFields.length >= 1 && (
        <div className="grid gap-4 sm:grid-cols-[1fr,auto]">
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
          {renderFormulaInput(0)}
        </div>
      )}
      <Separator />
      {formulaFields.length >= 2 && (
        <div className="grid gap-4 sm:grid-cols-[1fr,auto]">
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
          {renderFormulaInput(1)}
        </div>
      )}
    </div>
  );

  const renderFlexibleFormula = () => (
    <div className="space-y-4">
      {formulaFields.map((field, index) => (
        <div key={field.id} className="grid gap-4 sm:grid-cols-[1fr,auto,auto]">
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
          {renderFormulaInput(index, '%', index > 0)}
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
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Formula {formulaInputMode === 'weight' ? '(Weight → %)' : '(Percentages)'}</CardTitle>
            <CardDescription>{guidance.formula}</CardDescription>
          </div>
          <ToggleGroup
            type="single"
            value={formulaInputMode}
            onValueChange={(val) => {
              if (val) setFormulaInputMode(val as 'percentage' | 'weight');
            }}
            size="sm"
            className="border rounded-lg p-1"
          >
            <ToggleGroupItem value="percentage" aria-label="Percentage mode" className="text-xs gap-1 px-3">
              <Percent className="h-3 w-3" />
              Percentage
            </ToggleGroupItem>
            <ToggleGroupItem value="weight" aria-label="Weight mode" className="text-xs gap-1 px-3">
              <Scale className="h-3 w-3" />
              Weight (oz)
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        {formulaInputMode === 'weight' && totalWeight > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            Total weight: <span className="font-medium text-foreground">{totalWeight.toFixed(2)} oz</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {renderFormulaProgress()}

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
  );
}
