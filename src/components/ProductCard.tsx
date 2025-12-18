import { Edit2, Trash2, Copy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/calculations';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDuplicate, onDelete }: ProductCardProps) {
  return (
    <Card className="group transition-smooth hover:shadow-elevated overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {product.product_type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {product.fill_weight_per_unit} {product.fill_unit}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {product.units_per_batch} units per batch
              </p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(product)}
                className="h-8 w-8"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDuplicate(product.id)}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(product.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Pricing summary */}
        <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-muted/30">
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">COGS</p>
            <p className="font-display text-lg font-semibold text-foreground">
              {formatCurrency(product.total_cogs_per_unit)}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Wholesale</p>
            <p className="font-display text-lg font-semibold text-secondary-foreground">
              {formatCurrency(product.wholesale_price)}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Retail</p>
            <p className="font-display text-lg font-semibold text-primary">
              {formatCurrency(product.retail_price)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
