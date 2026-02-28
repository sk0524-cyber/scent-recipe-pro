import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useMaterials, Material, MaterialFormData } from '@/hooks/useMaterials';
import { MaterialForm } from '@/components/MaterialForm';
import { MaterialCard } from '@/components/MaterialCard';
import { MATERIAL_CATEGORIES } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpSection } from '@/components/HelpSection';

export default function Materials() {
  const { materials, isLoading, createMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSubmit = (data: MaterialFormData) => {
    if (editingMaterial) {
      updateMaterial.mutate(
        { id: editingMaterial.id, ...data },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingMaterial(null);
          },
        }
      );
    } else {
      createMaterial.mutate(data, {
        onSuccess: () => {
          setIsFormOpen(false);
        },
      });
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMaterial.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMaterial(null);
  };

  // Filter materials
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      searchQuery === '' ||
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group materials by category
  const materialsByCategory = filteredMaterials.reduce((acc, material) => {
    if (!acc[material.category]) {
      acc[material.category] = [];
    }
    acc[material.category].push(material);
    return acc;
  }, {} as Record<string, Material[]>);

  const sortedCategories = Object.keys(materialsByCategory).sort((a, b) => {
    const indexA = MATERIAL_CATEGORIES.indexOf(a as any);
    const indexB = MATERIAL_CATEGORIES.indexOf(b as any);
    return indexA - indexB;
  });

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Materials & Components
            </h1>
            <p className="text-muted-foreground">
              Manage your raw materials and packaging. Costs are automatically calculated.
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Material
          </Button>
        </div>

        <HelpSection
          title="How to Add Materials"
          items={[
            { title: 'What are materials?', content: 'Materials are the raw ingredients and packaging components you use to make your products — things like wax, fragrance oil, vessels, wicks, labels, and boxes.' },
            { title: 'How do I add a material?', content: '1. Click the "Add Material" button above\n2. Choose a category (e.g. Wax, Fragrance, Packaging)\n3. Enter the material name\n4. Enter the cost you pay and the quantity you receive (e.g. $50 for 10 lbs)\n5. The cost per unit is calculated automatically\n6. Click Save' },
            { title: 'Tip: Reuse across products', content: 'Once you add a material here, it becomes available in the Product Calculator for any product. Update a material\'s cost once and it automatically updates across all products that use it.' },
          ]}
        />

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {MATERIAL_CATEGORIES.slice(0, 5).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Materials list */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedCategories.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {searchQuery || selectedCategory ? 'No materials found' : 'No materials yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory
                  ? 'Try adjusting your search or filters.'
                  : 'Add your first material to get started.'}
              </p>
              {!searchQuery && !selectedCategory && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Material
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {sortedCategories.map((category) => (
              <div key={category}>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                  {category}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({materialsByCategory[category].length})
                  </span>
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {materialsByCategory[category].map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      onEdit={handleEdit}
                      onDelete={setDeleteId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editingMaterial ? 'Edit Material' : 'Add New Material'}
            </DialogTitle>
          </DialogHeader>
          <MaterialForm
            material={editingMaterial || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isSubmitting={createMaterial.isPending || updateMaterial.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this material? This action cannot be undone.
              If the material is used in any products, those product costs will be affected.
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
