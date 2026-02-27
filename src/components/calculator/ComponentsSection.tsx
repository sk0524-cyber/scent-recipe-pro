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
  unitName: string;
}

export function ComponentsSection({
  form,
  calculations,
  watchAll,
  materials,
  componentFieldArray,
  guidance,
  unitName,
}: ComponentsSectionProps) {
  const { fields: componentFields, append: appendComponent, remove: removeComponent } = componentFieldArray;

  const componentMaterials = materials.filter(m => COMPONENT_CATEGORIES.includes(m.category));
  const packSize = watchAll.selling_pack_size || 1;
  const showPackToggle = packSize > 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Packaging & Components</CardTitle>
        <CardDescription>{guidance.components}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {componentFields.map((field, index) => (
          <div key={field.id} className="space-y-2">
            <div className={`grid gap-4 ${showPackToggle ? 'sm:grid-cols-[1fr,80px,120px,auto]' : 'sm:grid-cols-[1fr,100px,auto]'}`}>
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
              {showPackToggle && (
                <FormField
                  control={form.control}
                  name={`component_items.${index}.cost_basis`}
                  render={({ field: basisField }) => (
                    <FormItem>
                      <FormLabel className={index > 0 ? 'sr-only' : ''}>Per</FormLabel>
                      <Select onValueChange={basisField.onChange} value={basisField.value || 'unit'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unit">Per {unitName}</SelectItem>
                          <SelectItem value="pack">Per pack</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
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
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendComponent({ material_id: '', quantity_per_unit: 1, cost_basis: packSize > 1 ? 'pack' : 'unit' })}
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
                    {item.costBasis === 'pack' && (
                      <span className="text-xs ml-1 text-primary">(per pack)</span>
                    )}
                  </span>
                  <span>{formatCurrency(item.costPerUnit, 4)}/{unitName}</span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total Packaging</span>
                <span className="text-primary">{formatCurrency(calculations.totalPackagingCostPerUnit, 4)}/{unitName}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
