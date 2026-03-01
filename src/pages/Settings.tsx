import { useState } from 'react';
import { Plus, Pencil, Trash2, Store } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { useRetailStores, RetailStore, RetailStoreFormData } from '@/hooks/useRetailStores';

const storeFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  default_commission_pct: z.coerce.number().min(0, 'Must be 0 or greater').max(100, 'Cannot exceed 100%'),
  monthly_fee: z.coerce.number().min(0, 'Must be 0 or greater').max(999999, 'Value too large'),
  per_unit_fee: z.coerce.number().min(0, 'Must be 0 or greater').max(999999, 'Value too large'),
});

type StoreFormValues = z.infer<typeof storeFormSchema>;

function StoreForm({
  store,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  store?: RetailStore;
  onSubmit: (data: RetailStoreFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: store?.name ?? '',
      default_commission_pct: store?.default_commission_pct ?? 0,
      monthly_fee: store?.monthly_fee ?? 0,
      per_unit_fee: store?.per_unit_fee ?? 0,
    },
  });

  const handleSubmit = (values: StoreFormValues) => {
    onSubmit(values as RetailStoreFormData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Store Name</FormLabel>
            <FormControl><Input placeholder="e.g. Spa World" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="default_commission_pct" render={({ field }) => (
          <FormItem>
            <FormLabel>Commission %</FormLabel>
            <FormControl><Input type="number" step="0.1" placeholder="e.g. 50" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="monthly_fee" render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Fee ($)</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="per_unit_fee" render={({ field }) => (
            <FormItem>
              <FormLabel>Per Unit Fee ($)</FormLabel>
              <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {store ? 'Save Changes' : 'Add Store'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function Settings() {
  const { stores, isLoading, createStore, updateStore, deleteStore } = useRetailStores();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<RetailStore | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSubmit = (data: RetailStoreFormData) => {
    if (editingStore) {
      updateStore.mutate({ id: editingStore.id, ...data }, {
        onSuccess: () => { setIsFormOpen(false); setEditingStore(null); },
      });
    } else {
      createStore.mutate(data, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const handleEdit = (store: RetailStore) => {
    setEditingStore(store);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteStore.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStore(null);
  };

  return (
    <Layout>
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and retail partners.</p>
        </div>

        {/* Retail Stores Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Retail Store Directory
              </CardTitle>
              <CardDescription>
                Manage your wholesale retail partners. Assign them to products later.
              </CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Store
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : stores.length === 0 ? (
              <div className="text-center py-10">
                <Store className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  No retail partners added yet. Add your first store to get started.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Commission %</TableHead>
                    <TableHead className="text-right">Monthly Fee</TableHead>
                    <TableHead className="text-right">Per Unit Fee</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id} className="cursor-pointer" onClick={() => handleEdit(store)}>
                      <TableCell className="font-medium">{store.name}</TableCell>
                      <TableCell className="text-right">{store.default_commission_pct}%</TableCell>
                      <TableCell className="text-right">${store.monthly_fee.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${store.per_unit_fee.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(store); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteId(store.id); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editingStore ? 'Edit Store' : 'Add Retail Store'}
            </DialogTitle>
          </DialogHeader>
          <StoreForm
            store={editingStore ?? undefined}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isSubmitting={createStore.isPending || updateStore.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Store</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this retail partner? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
