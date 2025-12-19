import { Edit2, Trash2, Copy, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="font-display text-lg font-semibold text-foreground truncate cursor-default">
                      {product.name}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{product.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-sm text-muted-foreground mt-1">
                {product.units_per_batch} units per batch
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(product.id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(product.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
