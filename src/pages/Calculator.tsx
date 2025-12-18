import { useState } from 'react';
import { Plus, ArrowLeft, Download } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMaterials } from '@/hooks/useMaterials';
import { useProducts, ProductWithItems, ProductFormData } from '@/hooks/useProducts';
import { ProductCalculator } from '@/components/ProductCalculator';
import { ProductCard } from '@/components/ProductCard';
import { exportProductsToCSV } from '@/lib/export';
import { toast } from '@/hooks/use-toast';
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

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithItems | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const isLoading = materialsLoading || productsLoading;

  const handleCreateNew = () => {
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
          <div className="flex gap-3">
            {products.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  exportProductsToCSV(products);
                  toast({
                    title: 'Export complete',
                    description: `Exported ${products.length} product(s) to CSV.`,
                  });
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
            <Button onClick={handleCreateNew} variant="warm">
              <Plus className="mr-2 h-4 w-4" />
              New Product
            </Button>
          </div>
        </div>

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
              <Button onClick={handleCreateNew} variant="warm">
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
