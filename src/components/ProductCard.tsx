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
import { formatCurrency, calculateProfitMargin, formatPercentage, calculatePackCOGS, calculateWholesalePrice, calculateRetailPrice, isMakerMarginReady, calculateRetailerShelfPrice } from '@/lib/calculations';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDuplicate, onDelete }: ProductCardProps) {
  const packSize = product.selling_pack_size || 1;
  const hasPackSize = packSize > 1;
  const packCOGS = hasPackSize ? calculatePackCOGS(product.total_cogs_per_unit, packSize) : product.total_cogs_per_unit;
  const wholesalePrice = hasPackSize ? calculateWholesalePrice(packCOGS, product.wholesale_markup) : product.wholesale_price;
  const retailPrice = hasPackSize ? calculateRetailPrice(packCOGS, product.retail_markup) : product.retail_price;

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
                {hasPackSize && (
                  <Badge variant="outline" className="text-xs">
                    Pack of {packSize}
                  </Badge>
                )}
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
                {hasPackSize && ` · ${Math.floor(product.units_per_batch / packSize)} packs`}
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
            <p className="text-xs text-muted-foreground mb-1">COGS{hasPackSize ? '/pack' : ''}</p>
            <p className="font-display text-lg font-semibold text-foreground">
              {formatCurrency(packCOGS)}
            </p>
            {hasPackSize && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatCurrency(product.total_cogs_per_unit)}/unit
              </p>
            )}
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Wholesale{hasPackSize ? '/pack' : ''}</p>
            <p className="font-display text-lg font-semibold text-secondary-foreground">
              {formatCurrency(wholesalePrice)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              {formatPercentage(calculateProfitMargin(wholesalePrice ?? 0, packCOGS ?? 0))} margin
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">DTC Retail{hasPackSize ? '/pack' : ''}</p>
            <p className="font-display text-lg font-semibold text-primary">
              {formatCurrency(retailPrice)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              {formatPercentage(calculateProfitMargin(retailPrice ?? 0, packCOGS ?? 0))} margin
            </p>
          </div>
        </div>

        {/* Retail-Ready indicator */}
        {wholesalePrice > 0 && (() => {
          const targetMargin = (product as any).retailer_margin_target || 70;
          const { ready, makerMargin } = isMakerMarginReady(wholesalePrice, packCOGS, targetMargin);
          const shelfPrice = calculateRetailerShelfPrice(wholesalePrice, targetMargin);
          return (
            <div className={`px-5 py-2.5 border-t border-border text-xs font-medium ${
              ready
                ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
            }`}>
              <div className="flex items-center gap-1.5">
                <span>{ready ? '✓' : '⚠'}</span>
                <span>{ready ? 'On Target' : 'Below Target'}</span>
                <span className="text-muted-foreground ml-auto">{makerMargin.toFixed(1)}% wholesale margin</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-muted-foreground">Retailer Shelf Price</span>
                <span className="ml-auto font-semibold">{formatCurrency(shelfPrice)}</span>
              </div>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}
