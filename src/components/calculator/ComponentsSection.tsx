import { UseFieldArrayReturn } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { COMPONENT_CATEGORIES } from '@/lib/constants';
import { Material } from '@/hooks/useMaterials';
import { formatCurrency } from '@/lib/calculations';
import { CalculatorFormProps, FormValues } from './types';

interface ComponentsSectionProps extends CalculatorFormProps {
  materials: Material[];
  componentFieldArray: UseFieldArrayReturn<FormValues, 'component_items', 'id'>;
  guidance: { formula: string; components: string; fillLabel: string };
}

export function ComponentsSection({
  form,
  calculations,
  materials,
  componentFieldArray,
  guidance,
}: ComponentsSectionProps) {
  const { fields: componentFields, append: appendComponent, remove: removeComponent } = componentFieldArray;

  const componentMaterials = materials.filter(m => COMPONENT_CATEGORIES.includes(m.category));

  return (
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
  );
}
