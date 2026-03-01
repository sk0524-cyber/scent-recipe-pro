import { useState, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { useRetailStores } from '@/hooks/useRetailStores';
import { useProducts } from '@/hooks/useProducts';
import { useAllAssignments } from '@/hooks/useAllAssignments';
import {
  useStoreSalesRecords,
  useUpsertSalesRecord,
  getPeriodMonth,
  getUnitsSoldForMonth,
  getUnitsLast12Months,
} from '@/hooks/useStoreSalesRecords';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatCurrency, formatPercentage } from '@/lib/calculations';
import {
  Store,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';
import { toast } from 'sonner';
import { HelpSection } from '@/components/HelpSection';

const retailStoresHelp = [
  {
    title: 'How do I add a retail store?',
    content:
      'Go to the Settings page (click "Settings" in the top navigation). Scroll to the "Retail Store Directory" section and click "Add Store". Enter the store name, default commission percentage, monthly fee, and per-unit fee. Once saved, the store will appear here automatically.',
  },
  {
    title: 'How do I assign products to a store?',
    content:
      'Open any product in the Calculator page. Scroll down to the "Wholesale Channels" section where you can assign the product to one or more retail stores and set estimated monthly units.',
  },
  {
    title: 'How do I log actual units sold?',
    content:
      'Click on any store card to expand it. You\'ll see a table of all assigned products. In the "Units Sold" column, click the number and type the actual units sold for that month. It saves automatically when you click away or press Enter. Use the month picker at the top to switch between months.',
  },
  {
    title: 'How are the metrics calculated?',
    content:
      'Units/Month shows actual sales data for the selected month (or falls back to your estimated monthly units if no sales have been logged).\n\nUnits/Year sums actual sales across the last 12 months.\n\nAvg Retail Price is the average retail price across all products assigned to the store.\n\nWholesale Margin is the average margin percentage across assigned products.\n\nStores are sorted by profitability (highest margin first).',
  },
];

export default function RetailStoreAnalytics() {
  const { stores, isLoading: storesLoading } = useRetailStores();
  const { products, isLoading: productsLoading } = useProducts();
  const { assignments, isLoading: assignmentsLoading } = useAllAssignments();
  const { salesRecords, isLoading: salesLoading } = useStoreSalesRecords();
  const upsertMutation = useUpsertSalesRecord();

  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const [openStores, setOpenStores] = useState<Set<string>>(new Set());
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});

  const isLoading = storesLoading || productsLoading || assignmentsLoading || salesLoading;
  const periodMonth = getPeriodMonth(selectedMonth);

  const toggleStore = useCallback((storeId: string) => {
    setOpenStores((prev) => {
      const next = new Set(prev);
      if (next.has(storeId)) next.delete(storeId);
      else next.add(storeId);
      return next;
    });
  }, []);

  const handleUnitsSave = useCallback(
    (assignmentId: string, value: string) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return;
      upsertMutation.mutate(
        { assignmentId, periodMonth, unitsSold: numValue },
        {
          onSuccess: () => toast.success('Units updated'),
          onError: () => toast.error('Failed to update units'),
        }
      );
    },
    [periodMonth, upsertMutation]
  );

  // Compute store metrics with actual sales data
  const storeMetrics = stores.map((store) => {
    const storeAssignments = assignments.filter((a) => a.store_id === store.id);

    if (storeAssignments.length === 0) {
      return {
        store,
        productCount: 0,
        avgRetailPrice: 0,
        avgWholesaleMargin: 0,
        unitsPerMonth: 0,
        unitsPerYear: 0,
      };
    }

    let totalRetailPrice = 0;
    let totalMargin = 0;
    let validProducts = 0;
    let unitsPerMonth = 0;
    let unitsPerYear = 0;

    for (const assignment of storeAssignments) {
      const product = products.find((p) => p.id === assignment.product_id);
      if (!product) continue;

      const packCOGS = product.total_cogs_per_unit * product.selling_pack_size;
      const wholesalePrice = product.wholesale_price;

      totalRetailPrice += product.retail_price;
      if (wholesalePrice > 0) {
        totalMargin += ((wholesalePrice - packCOGS) / wholesalePrice) * 100;
      }
      validProducts++;

      // Use actual sales data, fall back to estimated
      const monthUnits = getUnitsSoldForMonth(salesRecords, assignment.id, periodMonth);
      const yearUnits = getUnitsLast12Months(salesRecords, assignment.id, selectedMonth);

      if (yearUnits > 0) {
        unitsPerMonth += monthUnits;
        unitsPerYear += yearUnits;
      } else {
        unitsPerMonth += assignment.estimated_monthly_units;
        unitsPerYear += assignment.estimated_monthly_units * 12;
      }
    }

    return {
      store,
      productCount: storeAssignments.length,
      avgRetailPrice: validProducts > 0 ? totalRetailPrice / validProducts : 0,
      avgWholesaleMargin: validProducts > 0 ? totalMargin / validProducts : 0,
      unitsPerMonth,
      unitsPerYear,
    };
  });

  // Sort by wholesale margin (most profitable first)
  storeMetrics.sort((a, b) => b.avgWholesaleMargin - a.avgWholesaleMargin);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Retail Stores</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Performance overview ranked by profitability. Click a store to log sales.
            </p>
          </div>
        </div>

        <HelpSection title="Help & Instructions" items={retailStoresHelp} />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Viewing:</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(selectedMonth, 'MMMM yyyy')}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : stores.length === 0 ? (
          <Card variant="subtle">
            <CardContent className="py-12 text-center">
              <Store className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No retail stores set up yet.{' '}
                <a href="/settings" className="text-primary underline underline-offset-2">
                  Visit Settings
                </a>{' '}
                to add your retail partners.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {storeMetrics.map(
              ({
                store,
                productCount,
                avgRetailPrice,
                avgWholesaleMargin,
                unitsPerMonth,
                unitsPerYear,
              }) => {
                const marginColor =
                  avgWholesaleMargin >= 50
                    ? 'text-green-600 dark:text-green-400'
                    : avgWholesaleMargin >= 30
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-destructive';

                const isOpen = openStores.has(store.id);
                const storeAssignments = assignments.filter((a) => a.store_id === store.id);

                return (
                  <Collapsible
                    key={store.id}
                    open={isOpen}
                    onOpenChange={() => toggleStore(store.id)}
                  >
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2 text-lg">
                                <Store className="h-5 w-5 text-muted-foreground" />
                                {store.name}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground mt-1">
                                {productCount} {productCount === 1 ? 'product' : 'products'}{' '}
                                assigned
                              </p>
                            </div>
                            <ChevronDown
                              className={`h-5 w-5 text-muted-foreground transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CardContent>
                        {productCount === 0 ? (
                          <p className="text-sm text-muted-foreground italic">
                            No products assigned yet.
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <DollarSign className="h-3.5 w-3.5" />
                                Avg Retail Price
                              </div>
                              <p className="text-lg font-semibold text-foreground">
                                {formatCurrency(avgRetailPrice)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <TrendingUp className="h-3.5 w-3.5" />
                                Wholesale Margin
                              </div>
                              <p className={`text-lg font-semibold ${marginColor}`}>
                                {formatPercentage(avgWholesaleMargin)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Package className="h-3.5 w-3.5" />
                                Units / Month
                              </div>
                              <p className="text-lg font-semibold text-foreground">
                                {unitsPerMonth}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                Units / Year
                              </div>
                              <p className="text-lg font-semibold text-foreground">
                                {unitsPerYear}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>

                      <CollapsibleContent>
                        {storeAssignments.length > 0 && (
                          <div className="px-6 pb-6 pt-2 border-t">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">
                              Product Breakdown — {format(selectedMonth, 'MMMM yyyy')}
                            </h4>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Retail Price</TableHead>
                                    <TableHead className="text-right">Wholesale Price</TableHead>
                                    <TableHead className="text-right">
                                      Units Sold (this month)
                                    </TableHead>
                                    <TableHead className="text-right">Units / Year</TableHead>
                                    <TableHead className="text-right">Margin %</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {storeAssignments.map((assignment) => {
                                    const product = products.find(
                                      (p) => p.id === assignment.product_id
                                    );
                                    if (!product) return null;

                                    const packCOGS =
                                      product.total_cogs_per_unit * product.selling_pack_size;
                                    const wholesalePrice = product.wholesale_price;
                                    const margin =
                                      wholesalePrice > 0
                                        ? ((wholesalePrice - packCOGS) / wholesalePrice) * 100
                                        : 0;

                                    const currentUnits = getUnitsSoldForMonth(
                                      salesRecords,
                                      assignment.id,
                                      periodMonth
                                    );
                                    const yearUnits = getUnitsLast12Months(
                                      salesRecords,
                                      assignment.id,
                                      selectedMonth
                                    );

                                    const editKey = `${assignment.id}-${periodMonth}`;
                                    const editValue = editingValues[editKey];

                                    return (
                                      <TableRow key={assignment.id}>
                                        <TableCell className="font-medium">
                                          {product.name}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {formatCurrency(product.retail_price)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {formatCurrency(wholesalePrice)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Input
                                            type="number"
                                            min={0}
                                            className="w-20 ml-auto h-8 text-right"
                                            value={
                                              editValue !== undefined
                                                ? editValue
                                                : currentUnits.toString()
                                            }
                                            onChange={(e) =>
                                              setEditingValues((prev) => ({
                                                ...prev,
                                                [editKey]: e.target.value,
                                              }))
                                            }
                                            onBlur={(e) => {
                                              handleUnitsSave(assignment.id, e.target.value);
                                              setEditingValues((prev) => {
                                                const next = { ...prev };
                                                delete next[editKey];
                                                return next;
                                              });
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                (e.target as HTMLInputElement).blur();
                                              }
                                            }}
                                          />
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {yearUnits || assignment.estimated_monthly_units * 12}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <span
                                            className={
                                              margin >= 50
                                                ? 'text-green-600 dark:text-green-400'
                                                : margin >= 30
                                                ? 'text-amber-600 dark:text-amber-400'
                                                : 'text-destructive'
                                            }
                                          >
                                            {formatPercentage(margin)}
                                          </span>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              }
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
