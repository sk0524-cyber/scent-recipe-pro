import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started and testing the waters.',
    features: [
      'Up to 5 products',
      'Up to 10 materials',
      'Basic COGS calculator',
      'Wholesale & retail pricing',
      'Community support',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For growing makers ready to scale their pricing strategy.',
    features: [
      'Unlimited products',
      'Unlimited materials',
      'Full COGS calculator',
      'Retail store tracking',
      'Sales performance analytics',
      'CSV & PDF exports',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Business',
    price: '$49',
    period: '/month',
    description: 'For teams and multi-brand operations.',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Multi-brand support',
      'Advanced analytics',
      'Custom reports',
      'API access',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function Pricing() {
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
        <div className="container relative mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground animate-fade-in">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Start free. Upgrade when you're ready to grow.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="container mx-auto px-4 pb-20 -mt-4">
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <Card
              key={tier.name}
              variant="elevated"
              className={cn(
                'relative animate-fade-in transition-smooth',
                tier.highlighted && 'border-primary shadow-glow ring-2 ring-primary/20 scale-[1.02]'
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-warm px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="font-display text-xl">{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="font-display text-4xl font-bold text-foreground">{tier.price}</span>
                  <span className="text-muted-foreground text-sm">{tier.period}</span>
                </div>
                <CardDescription className="mt-3">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={tier.highlighted ? 'warm' : 'outline'}
                  size="lg"
                  asChild
                >
                  <Link to="/auth">
                    {tier.cta} <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ-style note */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Questions?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pricing is still being finalized. All early sign-ups get full access during our launch period.
            Have questions? Reach out and we'll get back to you.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link to="/auth">Sign Up for Early Access</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} COGS Calculator. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/landing" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
              Home
            </Link>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
