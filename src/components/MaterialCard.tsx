import { Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Material } from '@/hooks/useMaterials';
import { formatCurrency, getCostPerUnitLabel } from '@/lib/calculations';

interface MaterialCardProps {
  material: Material;
  onEdit: (material: Material) => void;
  onDelete: (id: string) => void;
}

export function MaterialCard({ material, onEdit, onDelete }: MaterialCardProps) {
  const costPerUnitLabel = getCostPerUnitLabel(material.purchase_unit, material.category);

  return (
    <Card className="group transition-smooth hover:shadow-elevated">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {material.category}
              </Badge>
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground truncate">
              {material.name}
            </h3>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p>
                <span className="font-medium">Purchase:</span>{' '}
                {formatCurrency(material.purchase_cost)} for {material.purchase_quantity} {material.purchase_unit}
                {material.units_per_case && ` (${material.units_per_case} per ${material.purchase_unit})`}
              </p>
              <p className="text-primary font-medium">
                {formatCurrency(material.cost_per_unit, 4)} {costPerUnitLabel}
              </p>
            </div>
            {material.notes && (
              <p className="mt-2 text-xs text-muted-foreground italic truncate">
                {material.notes}
              </p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(material)}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(material.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
