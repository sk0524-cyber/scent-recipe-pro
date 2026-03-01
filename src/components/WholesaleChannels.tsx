import { useState } from 'react';
import { ChevronDown, Plus, Trash2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProductStoreAssignments } from '@/hooks/useProductStoreAssignments';
import { useRetailStores, RetailStore } from '@/hooks/useRetailStores';
import { formatCurrency, formatPercentage } from '@/lib/calculations';

interface WholesaleChannelsProps {
  productId: string;
  wholesalePrice: number;
  packCOGS: number;
}

export function WholesaleChannels({ productId, wholesalePrice, packCOGS }: WholesaleChannelsProps) {
  const { assignments, isLoading, createAssignment, deleteAssignment } = useProductStoreAssignments(productId);
  const { stores, isLoading: storesLoading } = useRetailStores();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [commissionOverride, setCommissionOverride] = useState('');
  const [estimatedUnits, setEstimatedUnits] = useState('1');

  const handleAdd = () => {
    if (!selectedStoreId) return;
    createAssignment.mutate(
      {
        product_id: productId,
        store_id: selectedStoreId,
        commission_override_pct: commissionOverride ? Number(commissionOverride) : null,
        estimated_monthly_units: Number(estimatedUnits) || 1,
      },
      {
        onSuccess: () => {
          setShowAddDialog(false);
          setSelectedStoreId('');
          setCommissionOverride('');
          setEstimatedUnits('1');
        },
      }
    );
  };

  const getStoreById = (id: string): RetailStore | undefined => stores.find((s) => s.id === id);

  // Filter out already-assigned stores
  const availableStores = stores.filter(
    (s) => !assignments.some((a) => a.store_id === s.id)
  );

  const computeRow = (assignment: typeof assignments[0]) => {
    const store = getStoreById(assignment.store_id);
    if (!store) return null;

    const commissionPct = assignment.commission_override_pct ?? store.default_commission_pct;
    const feePerUnit =
      (store.monthly_fee / (assignment.estimated_monthly_units || 1)) + store.per_unit_fee;
    const netPrice = wholesalePrice * (1 - commissionPct / 100) - feePerUnit;
    const marginPct = netPrice > 0 ? ((netPrice - packCOGS) / netPrice) * 100 : 0;

    return { store, commissionPct, feePerUnit, netPrice, marginPct };
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full px-5 py-3 border-t border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
          <span className="flex items-center gap-2">
            <Store className="h-4 w-4 text-muted-foreground" />
            Wholesale Channels
            {assignments.length > 0 && (
              <span className="text-xs text-muted-foreground">({assignments.length})</span>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-5 pb-4 pt-1 border-t border-border">
          {stores.length === 0 && !storesLoading ? (
            <p className="text-sm text-muted-foreground py-3">
              No retail stores set up yet.{' '}
              <a href="/settings" className="text-primary underline underline-offset-2">
                Visit Settings
              </a>{' '}
              to add your retail partners.
            </p>
          ) : assignments.length === 0 && !isLoading ? (
            <div className="flex items-center justify-between py-3">
              <p className="text-sm text-muted-foreground">Not assigned to any stores yet.</p>
              <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add to Store
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Store</TableHead>
                    <TableHead className="text-xs text-right">Commission</TableHead>
                    <TableHead className="text-xs text-right">Fee/Unit</TableHead>
                    <TableHead className="text-xs text-right">Your Net</TableHead>
                    <TableHead className="text-xs text-right">Margin</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => {
                    const row = computeRow(assignment);
                    if (!row) return null;
                    const marginColor =
                      row.marginPct >= 50
                        ? 'text-green-600 dark:text-green-400'
                        : row.marginPct >= 30
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-destructive';

                    return (
                      <TableRow key={assignment.id}>
                        <TableCell className="text-sm font-medium py-2">{row.store.name}</TableCell>
                        <TableCell className="text-sm text-right py-2">
                          {formatPercentage(row.commissionPct)}
                        </TableCell>
                        <TableCell className="text-sm text-right py-2">
                          {formatCurrency(row.feePerUnit)}
                        </TableCell>
                        <TableCell className="text-sm text-right font-semibold py-2">
                          {formatCurrency(row.netPrice)}
                        </TableCell>
                        <TableCell className={`text-sm text-right font-semibold py-2 ${marginColor}`}>
                          {formatPercentage(row.marginPct)}
                        </TableCell>
                        <TableCell className="py-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteAssignment.mutate(assignment.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
              </Table>

              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddDialog(true)}
                  disabled={availableStores.length === 0}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add to Store
                </Button>
              </div>
            </>
          )}
        </div>
      </CollapsibleContent>

      {/* Add to Store Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Store</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Store</Label>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a store..." />
                </SelectTrigger>
                <SelectContent>
                  {availableStores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} ({store.default_commission_pct}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Commission Override % (optional)</Label>
              <Input
                type="number"
                placeholder={
                  selectedStoreId
                    ? `Default: ${getStoreById(selectedStoreId)?.default_commission_pct ?? ''}%`
                    : 'Leave blank to use store default'
                }
                value={commissionOverride}
                onChange={(e) => setCommissionOverride(e.target.value)}
                min={0}
                max={100}
                step={0.1}
              />
            </div>
            <div className="space-y-2">
              <Label>Estimated Monthly Units</Label>
              <Input
                type="number"
                value={estimatedUnits}
                onChange={(e) => setEstimatedUnits(e.target.value)}
                min={1}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Used to spread the store's monthly fee across units sold.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!selectedStoreId || createAssignment.isPending}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
}
