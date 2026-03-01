import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, ArrowLeft, Download, FileText } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMaterials } from '@/hooks/useMaterials';
import { useProducts, ProductWithItems, ProductFormData } from '@/hooks/useProducts';
import { ProductCalculator } from '@/components/ProductCalculator';
import { ProductCard } from '@/components/ProductCard';
import { exportProductsToCSV } from '@/lib/export';
import { exportProductCostSheetPDF } from '@/lib/pdf-export';
import { toast } from '@/hooks/use-toast';
import { HelpSection } from '@/components/HelpSection';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Calculator() {
  const { materials, isLoading: materialsLoading } = useMaterials();
  const {
    products,
    isLoading: productsLoading,
    getProductWithItems,
    createProduct,
    updateProduct,
    duplicateProduct,
    deleteProduct,
  } = useProducts();
  const { isFreeTier, limits, canAddProduct, canExportPdf, canExportCsv } = useSubscription();

  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithItems | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const isLoading = materialsLoading || productsLoading;
  const atProductLimit = !canAddProduct(products.length);

  // Handle edit from URL query parameter
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && products.length > 0 && !showForm && !isLoadingProduct) {
      const productToEdit = products.find(p => p.id === editId);
      if (productToEdit) {
        handleEdit(productToEdit);
        // Clear the query parameter
        setSearchParams({});
      }
    }
  }, [searchParams, products, showForm, isLoadingProduct]);

  const handleCreateNew = () => {
    if (atProductLimit) {
      return; // Button should be disabled, but just in case
    }
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = async (product: any) => {
    setIsLoadingProduct(true);
    const productWithItems = await getProductWithItems(product.id);
    setEditingProduct(productWithItems);
    setShowForm(true);
    setIsLoadingProduct(false);
  };

  const handleSave = (data: ProductFormData) => {
    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, ...data },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingProduct(null);
          },
        }
      );
    } else {
      createProduct.mutate(data, {
        onSuccess: () => {
          setShowForm(false);
        },
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteProduct.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  // Show form view
  if (showForm) {
    return (
      <Layout>
        <div className="animate-fade-in">
          <Button variant="ghost" onClick={handleCancel} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {editingProduct ? 'Edit Product' : 'New Product'}
            </h1>
            <p className="text-muted-foreground">
              Define your formula, add components, and calculate pricing.
            </p>
          </div>

          <HelpSection
            title="How to Use the Calculator"
            items={[
              { title: 'Step-by-step workflow', content: '1. Name your product and choose a type (candle, diffuser, etc.)\n2. Set your batch size (how many units per batch)\n3. Add formula ingredients with percentages (e.g. 80% wax, 10% fragrance)\n4. Add packaging components (vessel, lid, label, box)\n5. Set labour hours and rate, plus any shipping overhead\n6. Review your COGS and suggested pricing at the bottom' },
              { title: 'How do markup and margin work?', content: 'Markup is how much you add on top of your cost. A 2× markup on a $5 cost = $10 price.\n\nMargin is the percentage of the final price that is profit. A $10 price with $5 cost = 50% margin.\n\nYou can set separate wholesale and retail markups.' },
              { title: 'Duplicating and exporting', content: 'Use the ⋯ menu on any product card to duplicate it (great for variations) or export all products to CSV from the main list.' },
            ]}
          />

          {materialsLoading || isLoadingProduct ? (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-1/3 mb-4" />
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          ) : materials.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  No Materials Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  You need to add materials before creating products.
                </p>
                <Button onClick={() => window.location.href = '/materials'}>
                  Add Materials First
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ProductCalculator
              product={editingProduct}
              materials={materials}
              onSave={handleSave}
              onCancel={handleCancel}
              isSubmitting={createProduct.isPending || updateProduct.isPending}
            />
          )}
        </div>
      </Layout>
    );
  }

  // Show products list view
  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Product Calculator
            </h1>
            <p className="text-muted-foreground">
              Create products with formulas and see calculated COGS and pricing.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {products.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!canExportCsv) {
                      toast({
                        title: 'Upgrade required',
                        description: 'CSV export is available on paid plans.',
                        variant: 'destructive',
                      });
                      return;
                    }
                    exportProductsToCSV(products);
                    toast({
                      title: 'Export complete',
                      description: `Exported ${products.length} product(s) to CSV.`,
                    });
                  }}
                  disabled={!canExportCsv}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!canExportPdf) {
                      toast({
                        title: 'Upgrade required',
                        description: 'PDF export is available on paid plans.',
                        variant: 'destructive',
                      });
                      return;
                    }
                    products.forEach(p => exportProductCostSheetPDF(p));
                    toast({
                      title: 'PDF export complete',
                      description: `Generated ${products.length} cost sheet(s).`,
                    });
                  }}
                  disabled={!canExportPdf}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export PDFs
                </Button>
              </>
            )}
            <Button onClick={handleCreateNew} variant="warm" disabled={atProductLimit}>
              <Plus className="mr-2 h-4 w-4" />
              New Product
            </Button>
          </div>
        </div>

        {/* Usage banner for free tier */}
        {isFreeTier && (
          <UpgradePrompt
            variant="banner"
            currentCount={products.length}
            maxCount={limits.maxProducts}
            itemName="Products"
          />
        )}

        <HelpSection
          title="How to Use the Calculator"
          items={[
            { title: 'Step-by-step workflow', content: '1. Click "New Product" to start\n2. Name your product and choose a type (candle, diffuser, etc.)\n3. Set your batch size and fill weight\n4. Add formula ingredients with percentages\n5. Add packaging components\n6. Set labour and shipping costs\n7. Review COGS and pricing at the bottom' },
            { title: 'How do markup and margin work?', content: 'Markup is how much you add on top of your cost. A 2× markup on a $5 cost = $10 price.\n\nMargin is the percentage of the final price that is profit. A $10 price with $5 cost = 50% margin.' },
            { title: 'Duplicating and exporting', content: 'Use the ⋯ menu on any product card to duplicate it (great for scent variations). You can also export all products to CSV using the Export button.' },
          ]}
        />

        {/* Products list */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                No Products Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first product to calculate COGS and pricing.
              </p>
              <Button onClick={handleCreateNew} variant="warm" disabled={atProductLimit}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDuplicate={(id) => duplicateProduct.mutate(id)}
                onDelete={setDeleteId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
