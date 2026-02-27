import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import {
  formatCurrency,
  isMakerMarginReady,
  calculateRetailReadyWholesaleMarkup,
  calculateRetailerShelfPrice,
} from '@/lib/calculations';
import { CalculatorFormProps } from './types';

interface PricingSummaryProps extends CalculatorFormProps {
  unitName: string;
  unitNamePlural: string;
}

export function PricingSummary({
  form,
  calculations,
  watchAll,
  unitName,
  unitNamePlural,
}: PricingSummaryProps) {
  return (
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
            <span className="text-muted-foreground">Materials cost per {unitName}</span>
            <span>{formatCurrency(calculations.totalMaterialsCostPerUnit, 4)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Packaging & components per {unitName}</span>
            <span>{formatCurrency(calculations.totalPackagingCostPerUnit, 4)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Labor per {unitName}</span>
            <span>{formatCurrency(calculations.laborCostPerUnit, 4)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Shipping/overhead per {unitName}</span>
            <span>{formatCurrency(calculations.shippingCostPerUnit, 4)}</span>
          </div>
          <div className="flex justify-between py-3 bg-primary/5 rounded-lg px-4 -mx-4">
            <span className="font-display text-lg font-semibold">COGS per {unitName}</span>
            <span className="font-display text-xl font-bold text-primary">
              {formatCurrency(calculations.totalCOGS)}
            </span>
          </div>
          {(watchAll.selling_pack_size || 1) > 1 && (
            <div className="flex justify-between py-3 bg-accent/50 rounded-lg px-4 -mx-4">
              <span className="font-display text-lg font-semibold">
                COGS per pack ({watchAll.selling_pack_size} {unitNamePlural})
              </span>
              <span className="font-display text-xl font-bold text-primary">
                {formatCurrency(calculations.packCOGS)}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Markup inputs */}
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="wholesale_markup"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Wholesale Markup (%)</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1"
                          onClick={() => {
                            const targetMargin = watchAll.retailer_margin_target || 70;
                            const suggestedMarkup = calculateRetailReadyWholesaleMarkup(0, targetMargin);
                            form.setValue('wholesale_markup', suggestedMarkup, { shouldDirty: true });
                          }}
                        >
                          <Sparkles className="h-3 w-3" />
                          Target Margin
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sets wholesale markup so you keep {watchAll.retailer_margin_target || 70}% margin on wholesale sales</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <FormControl>
                  <Input type="number" step="1" min="0" {...field} />
                </FormControl>
                <FormDescription>{watchAll.wholesale_markup}% = {((watchAll.wholesale_markup || 0) / 100 + 1).toFixed(1)}× COGS</FormDescription>
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
                <FormDescription>{watchAll.retail_markup}% = {((watchAll.retail_markup || 0) / 100 + 1).toFixed(1)}× COGS</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Target Maker Margin & Retailer Margin */}
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="retailer_margin_target"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Wholesale Margin (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="30" max="90" {...field} />
                </FormControl>
                <FormDescription>
                  Your profit goal. Click "Target Margin" above to auto-set the wholesale markup.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="retailer_margin_percent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retailer Margin (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" min="10" max="80" {...field} />
                </FormControl>
                <FormDescription>
                  The margin a retailer takes on your wholesale price to set the shelf price.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Final prices */}
        <div className="grid gap-4 sm:grid-cols-3 mt-6">
          <div className="rounded-xl bg-secondary p-6 text-center">
            <p className="text-sm text-secondary-foreground/70 mb-2">
              Wholesale Price{(watchAll.selling_pack_size || 1) > 1 ? ` (pack of ${watchAll.selling_pack_size})` : ''}
            </p>
            <p className="font-display text-3xl font-bold text-secondary-foreground">
              {formatCurrency(calculations.wholesalePrice)}
            </p>
            <p className="text-xs text-secondary-foreground/60 mt-1">
              Rounded to nearest $0.50
            </p>
          </div>
          <div className="rounded-xl bg-primary p-6 text-center">
            <p className="text-sm text-primary-foreground/70 mb-2">
              DTC Retail Price{(watchAll.selling_pack_size || 1) > 1 ? ` (pack of ${watchAll.selling_pack_size})` : ''}
            </p>
            <p className="font-display text-3xl font-bold text-primary-foreground">
              {formatCurrency(calculations.retailPrice)}
            </p>
            <p className="text-xs text-primary-foreground/60 mt-1">
              Rounded to nearest $0.50
            </p>
          </div>
          <div className="rounded-xl bg-accent p-6 text-center">
            <p className="text-sm text-accent-foreground/70 mb-2">
              Retailer Shelf Price{(watchAll.selling_pack_size || 1) > 1 ? ` (pack of ${watchAll.selling_pack_size})` : ''}
            </p>
            <p className="font-display text-3xl font-bold text-accent-foreground">
              {formatCurrency(calculateRetailerShelfPrice(calculations.wholesalePrice, watchAll.retailer_margin_percent || 50))}
            </p>
            <p className="text-xs text-accent-foreground/60 mt-1">
              Based on {watchAll.retailer_margin_percent || 50}% retailer margin
            </p>
          </div>
        </div>
        {(watchAll.selling_pack_size || 1) > 1 && (
          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Packs per batch:</span> {Math.floor(watchAll.units_per_batch / watchAll.selling_pack_size)}</p>
          </div>
        )}

        {/* Maker Margin Indicator */}
        {calculations.wholesalePrice > 0 && (() => {
          const targetMargin = watchAll.retailer_margin_target || 70;
          const packCOGS = calculations.packCOGS;
          const { ready, makerMargin } = isMakerMarginReady(calculations.wholesalePrice, packCOGS, targetMargin);
          return (
            <Alert className={ready
              ? 'border-green-500/50 bg-green-50 dark:bg-green-950/30 [&>svg]:text-green-600 dark:[&>svg]:text-green-400'
              : 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400'
            }>
              {ready ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertDescription className={ready ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'}>
                {ready
                  ? `On Target — You keep ${makerMargin.toFixed(1)}% margin on wholesale sales`
                  : `Below Target — You only keep ${makerMargin.toFixed(1)}% margin on wholesale (${targetMargin}%+ target)`
                }
              </AlertDescription>
            </Alert>
          );
        })()}
      </CardContent>
    </Card>
  );
}
