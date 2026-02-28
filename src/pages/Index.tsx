import { Link, useNavigate } from 'react-router-dom';
import { Package, Calculator, ArrowRight, TrendingUp, DollarSign, Layers, Tag, ShoppingBag, Navigation } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMaterials } from '@/hooks/useMaterials';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { formatCurrency } from '@/lib/calculations';
import { HelpSection } from '@/components/HelpSection';
import { useGuidedTour } from '@/hooks/useGuidedTour';


const Index = () => {
  const navigate = useNavigate();
  const { materials, isLoading: materialsLoading } = useMaterials();
  const { products, isLoading: productsLoading, duplicateProduct, deleteProduct } = useProducts();

  const isLoading = materialsLoading || productsLoading;
  const isNewUser = !isLoading && products.length === 0 && materials.length === 0;
  const { startTour } = useGuidedTour(isNewUser);

  // Calculate summary margin stats
  // wholesale_price and retail_price are per-pack, so compare against pack COGS
  const wholesaleProducts = products.filter(p => p.wholesale_price > 0);
  const avgWholesaleMargin = wholesaleProducts.length > 0
    ? wholesaleProducts.reduce((sum, p) => {
        const packCOGS = p.total_cogs_per_unit * (p.selling_pack_size || 1);
        return sum + ((p.wholesale_price - packCOGS) / p.wholesale_price) * 100;
      }, 0) / wholesaleProducts.length
    : 0;

  const dtcProducts = products.filter(p => p.retail_price > 0);
  const avgDTCMargin = dtcProducts.length > 0
    ? dtcProducts.reduce((sum, p) => {
        const packCOGS = p.total_cogs_per_unit * (p.selling_pack_size || 1);
        return sum + ((p.retail_price - packCOGS) / p.retail_price) * 100;
      }, 0) / dtcProducts.length
    : 0;

  const avgCombinedMargin = (avgWholesaleMargin > 0 && avgDTCMargin > 0)
    ? (avgWholesaleMargin + avgDTCMargin) / 2
    : avgWholesaleMargin || avgDTCMargin;

  const avgCostPerUnit = products.length > 0
    ? products.reduce((sum, p) => sum + p.total_cogs_per_unit, 0) / products.length
    : 0;
  const avgRetailPrice = dtcProducts.length > 0
    ? dtcProducts.reduce((sum, p) => sum + p.retail_price, 0) / dtcProducts.length
    : 0;

  return (
    <Layout>
      {/* Hero section */}
      <div id="tour-hero" className="mb-12 animate-fade-in">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Home Fragrance
          <span className="block text-primary">COGS Calculator</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-4">
          Calculate your cost of goods sold and set profitable wholesale and retail prices 
          for candles, diffusers, room sprays, and more.
        </p>
        <Button variant="ghost" size="sm" onClick={startTour} className="text-muted-foreground hover:text-foreground gap-2">
          <Navigation className="h-4 w-4" />
          Show Guided Tour
        </Button>
      </div>

      <div id="tour-help-section">
        <HelpSection
          title="Understanding Your Overview"
          items={[
            { title: 'What is "Avg Wholesale Margin"?', content: 'This is the average profit margin across all your products when sold at wholesale price. It shows how much profit you keep per unit after covering your costs of goods sold (COGS).' },
            { title: 'What is "Avg DTC Margin"?', content: 'DTC stands for Direct-to-Consumer. This margin shows your average profit when selling directly to customers at your retail price — typically higher than wholesale since there\'s no middleman.' },
            { title: 'What is "Avg Combined Margin"?', content: 'This is the average of your wholesale and DTC margins, giving you a blended view of overall profitability across both sales channels.' },
            { title: 'What do the colours mean?', content: 'Green (Healthy) = margin is 60% or above\nAmber (Moderate) = margin is between 40% and 59%\nRed (Low) = margin is below 40%\n\nHigher margins give you more room for discounts, marketing, and unexpected costs.' },
            { title: 'What are "Avg Cost per Unit" and "Avg Retail Price"?', content: '"Avg Cost per Unit" is the average COGS across all your products — what it costs you to make one unit.\n\n"Avg Retail Price" is the average suggested retail price across your products.' },
          ]}
        />
      </div>

      {/* Quick action cards */}
      <div className="grid gap-6 sm:grid-cols-2 mb-12">
        <Card id="tour-materials-card" className="group transition-smooth hover:shadow-elevated animate-fade-in" style={{ animationDelay: '0.1s' }}>
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

        <Card id="tour-calculator-card" className="group transition-smooth hover:shadow-elevated animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
            {[
              { label: 'Avg Wholesale Margin', value: avgWholesaleMargin, icon: DollarSign },
              { label: 'Avg DTC Margin', value: avgDTCMargin, icon: TrendingUp },
              { label: 'Avg Combined Margin', value: avgCombinedMargin, icon: Layers },
            ].map(({ label, value, icon: Icon }) => {
              const color = value >= 60 ? 'green' : value >= 40 ? 'amber' : 'red';
              const colorMap = {
                green: { bg: 'bg-green-100 dark:bg-green-950/40', text: 'text-green-600 dark:text-green-400', badge: 'text-green-700 dark:text-green-300' },
                amber: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', badge: 'text-amber-700 dark:text-amber-300' },
                red: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-600 dark:text-red-400', badge: 'text-red-700 dark:text-red-300' },
              };
              const c = colorMap[color];
              return (
                <Card key={label} variant="subtle">
                  <CardContent className="p-6 text-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bg} ${c.text} mx-auto mb-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{label}</p>
                    <p className={`font-display text-2xl font-bold ${c.badge}`}>
                      {value.toFixed(1)}%
                    </p>
                    <p className={`text-xs mt-1 ${c.text}`}>
                      {value >= 60 ? 'Healthy' : value >= 40 ? 'Moderate' : 'Low'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <Card variant="subtle">
              <CardContent className="p-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground mx-auto mb-3">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Avg Cost per Unit</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatCurrency(avgCostPerUnit)}
                </p>
              </CardContent>
            </Card>
            <Card variant="subtle">
              <CardContent className="p-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-3">
                  <Tag className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Avg Retail Price</p>
                <p className="font-display text-2xl font-bold text-foreground">
                  {formatCurrency(avgRetailPrice)}
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
