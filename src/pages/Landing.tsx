import { Link } from 'react-router-dom';
import { Calculator, DollarSign, Store, Package, ArrowRight, ChevronDown, Flame, Droplets, Wind, Sparkles, Cigarette, FileText, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Calculator,
    title: 'COGS Calculator',
    description: 'Build product formulas and calculate your true cost per unit — down to the penny.',
  },
  {
    icon: DollarSign,
    title: 'Pricing Engine',
    description: 'Set wholesale and retail prices with full margin visibility at every level.',
  },
  {
    icon: Store,
    title: 'Retail Store Tracking',
    description: 'Log sales per store and see which retail partners perform best for you.',
  },
  {
    icon: Package,
    title: 'Materials Library',
    description: 'Save your materials once and reuse them across all your product formulas.',
  },
  {
    icon: Navigation,
    title: 'Guided Onboarding',
    description: 'Interactive tour walks you through setup step-by-step. Up and running in minutes.',
  },
  {
    icon: FileText,
    title: 'Exports & Reports',
    description: 'Download branded PDF cost sheets and retail performance reports in one click.',
  },
];

const steps = [
  { number: '01', title: 'Add Your Materials', description: 'Enter your raw materials, packaging, and their costs.' },
  { number: '02', title: 'Build Product Formulas', description: 'Create recipes, assign components, and calculate COGS automatically.' },
  { number: '03', title: 'Track & Optimize', description: 'Monitor retail sales, compare margins, and refine your pricing strategy.' },
];

const stats = [
  { value: 'Instant', label: 'Margin calculations' },
  { value: 'Unlimited', label: 'Products & formulas' },
  { value: 'Per-store', label: 'Performance tracking' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-body">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/landing" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <span className="font-display text-lg font-semibold">C</span>
            </div>
            <span className="font-display text-xl font-semibold text-foreground">
              COGS Calculator
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/auth">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-subtle" />
        <div className="container relative mx-auto px-4 py-24 md:py-36 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight animate-fade-in max-w-3xl mx-auto">
            Know Your True Cost.{' '}
            <span className="text-primary">Set Profitable Prices.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            The all-in-one calculator for product-based businesses. Track materials, build formulas, calculate COGS, and price with confidence.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button size="lg" variant="warm" asChild>
              <Link to="/auth">
                Get Started Free <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works <ChevronDown className="ml-1 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20 md:py-28">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Everything You Need to Price Profitably
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Built specifically for makers, artisans, and small product businesses.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Card key={f.title} variant="elevated" className="animate-fade-in group hover:shadow-glow transition-smooth" style={{ animationDelay: `${i * 0.1}s` }}>
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Product Types */}
      <section className="bg-muted/50 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Built for Every Product Type
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              From candles to cosmetics — calculate COGS for any product-based business.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {[
              { icon: Flame, label: 'Candles' },
              { icon: Droplets, label: 'Wax Melts' },
              { icon: Wind, label: 'Reed Diffusers' },
              { icon: Sparkles, label: 'Room Sprays' },
              { icon: Cigarette, label: 'Incense' },
              { icon: Droplets, label: 'Cosmetics' },
              { icon: Package, label: 'Food Products' },
              { icon: Sparkles, label: 'Soap & Bath' },
            ].map((type, i) => (
              <div
                key={type.label}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-soft animate-fade-in transition-smooth hover:shadow-elevated hover:border-primary/30"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <type.icon className="h-4 w-4 text-primary" />
                {type.label}
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-muted-foreground">
            …and more coming soon. Works for any industry with raw materials and formulas.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Up and Running in Minutes
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <div key={s.number} className="text-center animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full gradient-warm text-primary-foreground font-display text-xl font-bold shadow-glow">
                  {s.number}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="grid gap-8 sm:grid-cols-3 max-w-3xl mx-auto text-center">
          {stats.map((s, i) => (
            <div key={s.label} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <p className="font-display text-3xl md:text-4xl font-bold text-primary">{s.value}</p>
              <p className="mt-2 text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="gradient-warm py-20 md:py-28 text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground max-w-2xl mx-auto">
            Ready to Stop Guessing Your Margins?
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-lg mx-auto">
            Join makers and product businesses who price with confidence.
          </p>
          <Button size="lg" className="mt-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold" asChild>
            <Link to="/auth">
              Get Started Free <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} COGS Calculator. All rights reserved.
          </p>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
            Log in
          </Link>
        </div>
      </footer>
    </div>
  );
}
