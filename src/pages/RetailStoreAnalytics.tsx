import { Layout } from '@/components/Layout';
import { useRetailStores } from '@/hooks/useRetailStores';
import { useProducts } from '@/hooks/useProducts';
import { useAllAssignments } from '@/hooks/useAllAssignments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/lib/calculations';
import { Store, DollarSign, TrendingUp, Package, Calendar } from 'lucide-react';

export default function RetailStoreAnalytics() {
  const { stores, isLoading: storesLoading } = useRetailStores();
  const { products, isLoading: productsLoading } = useProducts();
  const { assignments, isLoading: assignmentsLoading } = useAllAssignments();

  const isLoading = storesLoading || productsLoading || assignmentsLoading;

  // Group assignments by store_id
  const storeMetrics = stores.map((store) => {
    const storeAssignments = assignments.filter((a) => a.store_id === store.id);

    if (storeAssignments.length === 0) {
      return { store, productCount: 0, avgRetailPrice: 0, avgWholesaleMargin: 0, unitsPerMonth: 0, unitsPerYear: 0 };
    }

    let totalRetailPrice = 0;
    let totalMargin = 0;
    let validProducts = 0;
    let unitsPerMonth = 0;

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
      unitsPerMonth += assignment.estimated_monthly_units;
    }

    return {
      store,
      productCount: storeAssignments.length,
      avgRetailPrice: validProducts > 0 ? totalRetailPrice / validProducts : 0,
      avgWholesaleMargin: validProducts > 0 ? totalMargin / validProducts : 0,
      unitsPerMonth,
      unitsPerYear: unitsPerMonth * 12,
    };
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Retail Stores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Performance overview across your wholesale distribution partners.
          </p>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {storeMetrics.map(({ store, productCount, avgRetailPrice, avgWholesaleMargin, unitsPerMonth, unitsPerYear }) => {
              const marginColor =
                avgWholesaleMargin >= 50
                  ? 'text-green-600 dark:text-green-400'
                  : avgWholesaleMargin >= 30
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-destructive';

              return (
                <Card key={store.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Store className="h-5 w-5 text-muted-foreground" />
                      {store.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {productCount} {productCount === 1 ? 'product' : 'products'} assigned
                    </p>
                  </CardHeader>
                  <CardContent>
                    {productCount === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No products assigned yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <DollarSign className="h-3.5 w-3.5" />
                            Avg Retail Price
                          </div>
                          <p className="text-lg font-semibold text-foreground">{formatCurrency(avgRetailPrice)}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Wholesale Margin
                          </div>
                          <p className={`text-lg font-semibold ${marginColor}`}>{formatPercentage(avgWholesaleMargin)}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Package className="h-3.5 w-3.5" />
                            Units / Month
                          </div>
                          <p className="text-lg font-semibold text-foreground">{unitsPerMonth}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            Units / Year
                          </div>
                          <p className="text-lg font-semibold text-foreground">{unitsPerYear}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
