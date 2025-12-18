import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { MATERIAL_CATEGORIES, PURCHASE_UNITS, CASE_UNIT_CATEGORIES } from '@/lib/constants';
import { Material, MaterialFormData } from '@/hooks/useMaterials';
import { calculateCostPerUnit, getCostPerUnitLabel, formatCurrency } from '@/lib/calculations';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().min(1, 'Category is required'),
  purchase_cost: z.coerce.number().min(0.01, 'Cost must be greater than 0'),
  purchase_quantity: z.coerce.number().min(0.001, 'Quantity must be greater than 0'),
  purchase_unit: z.string().min(1, 'Unit is required'),
  units_per_case: z.coerce.number().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

interface MaterialFormProps {
  material?: Material;
  onSubmit: (data: MaterialFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function MaterialForm({ material, onSubmit, onCancel, isSubmitting }: MaterialFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: material?.name || '',
      category: material?.category || '',
      purchase_cost: material?.purchase_cost || 0,
      purchase_quantity: material?.purchase_quantity || 1,
      purchase_unit: material?.purchase_unit || 'each',
      units_per_case: material?.units_per_case || null,
      notes: material?.notes || '',
    },
  });

  const watchCategory = form.watch('category');
  const watchPurchaseUnit = form.watch('purchase_unit');
  const watchPurchaseCost = form.watch('purchase_cost');
  const watchPurchaseQuantity = form.watch('purchase_quantity');
  const watchUnitsPerCase = form.watch('units_per_case');

  const showUnitsPerCase = ['case', 'pack', 'bag', 'box'].includes(watchPurchaseUnit);

  const calculatedCostPerUnit = calculateCostPerUnit(
    watchPurchaseCost || 0,
    watchPurchaseQuantity || 1,
    watchPurchaseUnit || 'each',
    watchUnitsPerCase || null,
    watchCategory || ''
  );

  const costPerUnitLabel = getCostPerUnitLabel(watchPurchaseUnit || 'each', watchCategory || '');

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      notes: values.notes || null,
      units_per_case: showUnitsPerCase ? values.units_per_case || null : null,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MATERIAL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Coconut/Apricot Wax" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="purchase_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Cost ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormDescription>Total cost for purchase</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchase_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Quantity</FormLabel>
                <FormControl>
                  <Input type="number" step="0.001" min="0" {...field} />
                </FormControl>
                <FormDescription>Amount purchased</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchase_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PURCHASE_UNITS.map((unit) => (
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
        </div>

        {showUnitsPerCase && (
          <FormField
            control={form.control}
            name="units_per_case"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Units per {watchPurchaseUnit}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="1" 
                    min="1" 
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormDescription>
                  How many individual pieces come in one {watchPurchaseUnit}?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Calculated cost per unit display */}
        <div className="rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Calculated Cost Per Unit</span>
            <span className="font-display text-xl font-semibold text-primary">
              {formatCurrency(calculatedCostPerUnit, 4)} {costPerUnitLabel}
            </span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="e.g., Vendor name, reorder info..."
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : material ? 'Update Material' : 'Add Material'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
