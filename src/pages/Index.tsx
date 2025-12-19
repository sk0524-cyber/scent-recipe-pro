import { Link, useNavigate } from 'react-router-dom';
import { Package, Calculator, ArrowRight, TrendingUp, DollarSign, Layers } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMaterials } from '@/hooks/useMaterials';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { formatCurrency } from '@/lib/calculations';

const Index = () => {
  const navigate = useNavigate();
  const { materials, isLoading: materialsLoading } = useMaterials();
  const { products, isLoading: productsLoading, duplicateProduct, deleteProduct } = useProducts();

  const isLoading = materialsLoading || productsLoading;

  // Calculate summary stats
  const avgCOGS = products.length > 0 
    ? products.reduce((sum, p) => sum + p.total_cogs_per_unit, 0) / products.length 
    : 0;
  const avgRetail = products.length > 0 
    ? products.reduce((sum, p) => sum + p.retail_price, 0) / products.length 
    : 0;
  const avgMargin = avgRetail > 0 ? ((avgRetail - avgCOGS) / avgRetail) * 100 : 0;

  return (
    <Layout>
      {/* Hero section */}
      <div className="mb-12 animate-fade-in">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Home Fragrance
          <span className="block text-primary">COGS Calculator</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Calculate your cost of goods sold and set profitable wholesale and retail prices 
          for candles, diffusers, room sprays, and more.
        </p>
      </div>

      {/* Quick action cards */}
      <div className="grid gap-6 sm:grid-cols-2 mb-12">
        <Card className="group transition-smooth hover:shadow-elevated animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Package className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  Materials & Components
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set up your waxes, fragrance oils, vessels, wicks, and packaging. 
                  Define costs once and reuse across all products.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {materials.length} materials saved
                  </span>
                  <Button asChild variant="ghost" size="sm" className="group-hover:text-primary">
                    <Link to="/materials">
                      Manage Materials
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group transition-smooth hover:shadow-elevated animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Calculator className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  Product Calculator
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Build product formulas with percentages, add components, 
                  and calculate COGS with suggested retail and wholesale prices.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {products.length} products saved
                  </span>
                  <Button asChild variant="ghost" size="sm" className="group-hover:text-primary">
                    <Link to="/calculator">
                      Open Calculator
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats overview */}
      {products.length > 0 && (
        <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
            Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card variant="subtle">
              <CardContent className="p-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-3">
                  <DollarSign className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Avg COGS/Unit</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatCurrency(avgCOGS)}
                </p>
              </CardContent>
            </Card>
            <Card variant="subtle">
              <CardContent className="p-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent mx-auto mb-3">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Avg Retail Price</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatCurrency(avgRetail)}
                </p>
              </CardContent>
            </Card>
            <Card variant="subtle">
              <CardContent className="p-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground mx-auto mb-3">
                  <Layers className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Avg Margin</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {avgMargin.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Recent products */}
      {products.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Recent Products
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/calculator">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => navigate(`/calculator?edit=${product.id}`)}
                onDuplicate={(id) => duplicateProduct.mutate(id)}
                onDelete={(id) => deleteProduct.mutate(id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && products.length === 0 && materials.length === 0 && (
        <Card className="text-center py-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardContent>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-6">
              <Calculator className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Get Started
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by adding your materials and components, then create your first product 
              to calculate COGS and pricing.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/materials">
                  <Package className="mr-2 h-4 w-4" />
                  Add Materials
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/calculator">
                  <Calculator className="mr-2 h-4 w-4" />
                  Create Product
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
};

export default Index;
