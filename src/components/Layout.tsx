import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/materials', icon: Package, label: 'Materials' },
  { href: '/calculator', icon: Calculator, label: 'Calculator' }
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <span className="font-display text-lg font-semibold">C</span>
            </div>
            <span className="font-display text-xl font-semibold text-foreground">
              COGS Calculator
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                to={href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 font-body text-sm font-medium transition-smooth',
                  location.pathname === href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Home Fragrance COGS Calculator
          </p>
        </div>
      </footer>
    </div>
  );
}
