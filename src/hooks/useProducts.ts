import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Product {
  id: string;
  name: string;
  product_type: string;
  units_per_batch: number;
  fill_weight_per_unit: number;
  fill_unit: string;
  reed_stick_count: number | null;
  selling_pack_size: number;
  labor_rate_per_hour: number;
  labor_hours_per_batch: number;
  shipping_overhead_per_batch: number;
  retail_markup: number;
  wholesale_markup: number;
  materials_cost_per_unit: number;
  packaging_cost_per_unit: number;
  labor_cost_per_unit: number;
  shipping_cost_per_unit: number;
  total_cogs_per_unit: number;
  wholesale_price: number;
  retail_price: number;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface FormulaItem {
  id: string;
  product_id: string;
  material_id: string;
  percentage: number;
  slot_type: string | null;
}

export interface ComponentItem {
  id: string;
  product_id: string;
  material_id: string;
  quantity_per_unit: number;
}

export interface ProductWithItems extends Product {
  formula_items: FormulaItem[];
  component_items: ComponentItem[];
}

export interface ProductFormData {
  name: string;
  product_type: string;
  units_per_batch: number;
  fill_weight_per_unit: number;
  fill_unit: string;
  reed_stick_count?: number | null;
  selling_pack_size?: number;
  labor_rate_per_hour: number;
  labor_hours_per_batch: number;
  shipping_overhead_per_batch: number;
  retail_markup: number;
  wholesale_markup: number;
  materials_cost_per_unit: number;
  packaging_cost_per_unit: number;
  labor_cost_per_unit: number;
  shipping_cost_per_unit: number;
  total_cogs_per_unit: number;
  wholesale_price: number;
  retail_price: number;
  formula_items: Array<{
    material_id: string;
    percentage: number;
    slot_type?: string;
  }>;
  component_items: Array<{
    material_id: string;
    quantity_per_unit: number;
  }>;
}

export function useProducts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user
  });

  const getProductWithItems = async (id: string): Promise<ProductWithItems | null> => {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (productError || !product) return null;

    const { data: formulaItems } = await supabase
      .from('product_formula_items')
      .select('*')
      .eq('product_id', id);

    const { data: componentItems } = await supabase
      .from('product_component_items')
      .select('*')
      .eq('product_id', id);

    return {
      ...product,
      formula_items: formulaItems || [],
      component_items: componentItems || []
    } as ProductWithItems;
  };

  const createProduct = useMutation({
    mutationFn: async (formData: ProductFormData) => {
      if (!user) throw new Error('You must be logged in to create products');
      
      const { formula_items, component_items, ...productData } = formData;

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          ...productData,
          user_id: user.id
        })
        .select()
        .single();

      if (productError) throw productError;

      // Insert formula items
      if (formula_items.length > 0) {
        const formulaData = formula_items
          .filter(item => item.material_id && item.percentage > 0)
          .map(item => ({
            product_id: product.id,
            material_id: item.material_id,
            percentage: item.percentage,
            slot_type: item.slot_type || null
          }));

        if (formulaData.length > 0) {
          const { error } = await supabase
            .from('product_formula_items')
            .insert(formulaData);
          if (error) throw error;
        }
      }

      // Insert component items
      if (component_items.length > 0) {
        const componentData = component_items
          .filter(item => item.material_id && item.quantity_per_unit > 0)
          .map(item => ({
            product_id: product.id,
            material_id: item.material_id,
            quantity_per_unit: item.quantity_per_unit
          }));

        if (componentData.length > 0) {
          const { error } = await supabase
            .from('product_component_items')
            .insert(componentData);
          if (error) throw error;
        }
      }

      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Product saved',
        description: 'Your product has been created successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create product. Please try again.',
        variant: 'destructive'
      });
      console.error('Error creating product:', error);
    }
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...formData }: ProductFormData & { id: string }) => {
      const { formula_items, component_items, ...productData } = formData;

      const { data: product, error: productError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (productError) throw productError;

      // Delete existing formula and component items
      await supabase.from('product_formula_items').delete().eq('product_id', id);
      await supabase.from('product_component_items').delete().eq('product_id', id);

      // Insert new formula items
      if (formula_items.length > 0) {
        const formulaData = formula_items
          .filter(item => item.material_id && item.percentage > 0)
          .map(item => ({
            product_id: id,
            material_id: item.material_id,
            percentage: item.percentage,
            slot_type: item.slot_type || null
          }));

        if (formulaData.length > 0) {
          const { error } = await supabase
            .from('product_formula_items')
            .insert(formulaData);
          if (error) throw error;
        }
      }

      // Insert new component items
      if (component_items.length > 0) {
        const componentData = component_items
          .filter(item => item.material_id && item.quantity_per_unit > 0)
          .map(item => ({
            product_id: id,
            material_id: item.material_id,
            quantity_per_unit: item.quantity_per_unit
          }));

        if (componentData.length > 0) {
          const { error } = await supabase
            .from('product_component_items')
            .insert(componentData);
          if (error) throw error;
        }
      }

      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Product updated',
        description: 'Your changes have been saved.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update product. Please try again.',
        variant: 'destructive'
      });
      console.error('Error updating product:', error);
    }
  });

  const duplicateProduct = useMutation({
    mutationFn: async (id: string) => {
      const productWithItems = await getProductWithItems(id);
      if (!productWithItems) throw new Error('Product not found');

      const { id: _, created_at, updated_at, user_id, formula_items, component_items, ...productData } = productWithItems;
      
      const newFormData: ProductFormData = {
        ...productData,
        name: `${productData.name} (Copy)`,
        formula_items: formula_items.map(item => ({
          material_id: item.material_id,
          percentage: item.percentage,
          slot_type: item.slot_type || undefined
        })),
        component_items: component_items.map(item => ({
          material_id: item.material_id,
          quantity_per_unit: item.quantity_per_unit
        }))
      };

      return createProduct.mutateAsync(newFormData);
    },
    onSuccess: () => {
      toast({
        title: 'Product duplicated',
        description: 'A copy of the product has been created.'
      });
    }
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Product deleted',
        description: 'The product has been removed.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive'
      });
      console.error('Error deleting product:', error);
    }
  });

  return {
    products,
    isLoading,
    error,
    getProductWithItems,
    createProduct,
    updateProduct,
    duplicateProduct,
    deleteProduct
  };
}
