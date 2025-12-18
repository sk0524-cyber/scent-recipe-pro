import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { calculateCostPerUnit } from '@/lib/calculations';

export interface Material {
  id: string;
  name: string;
  category: string;
  purchase_cost: number;
  purchase_quantity: number;
  purchase_unit: string;
  units_per_case: number | null;
  weight_per_case: number | null;
  weight_per_case_unit: string | null;
  cost_per_unit: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaterialFormData {
  name: string;
  category: string;
  purchase_cost: number;
  purchase_quantity: number;
  purchase_unit: string;
  units_per_case: number | null;
  weight_per_case: number | null;
  weight_per_case_unit: string | null;
  notes: string | null;
}

export function useMaterials() {
  const queryClient = useQueryClient();

  const { data: materials = [], isLoading, error } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Material[];
    }
  });

  const createMaterial = useMutation({
    mutationFn: async (formData: MaterialFormData) => {
      const costPerUnit = calculateCostPerUnit(
        formData.purchase_cost,
        formData.purchase_quantity,
        formData.purchase_unit,
        formData.units_per_case,
        formData.category,
        formData.weight_per_case,
        formData.weight_per_case_unit
      );

      const { data, error } = await supabase
        .from('materials')
        .insert({
          ...formData,
          cost_per_unit: costPerUnit
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: 'Material added',
        description: 'Your material has been saved successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add material. Please try again.',
        variant: 'destructive'
      });
      console.error('Error creating material:', error);
    }
  });

  const updateMaterial = useMutation({
    mutationFn: async ({ id, ...formData }: MaterialFormData & { id: string }) => {
      const costPerUnit = calculateCostPerUnit(
        formData.purchase_cost,
        formData.purchase_quantity,
        formData.purchase_unit,
        formData.units_per_case,
        formData.category,
        formData.weight_per_case,
        formData.weight_per_case_unit
      );

      const { data, error } = await supabase
        .from('materials')
        .update({
          ...formData,
          cost_per_unit: costPerUnit
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: 'Material updated',
        description: 'Your changes have been saved.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update material. Please try again.',
        variant: 'destructive'
      });
      console.error('Error updating material:', error);
    }
  });

  const deleteMaterial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: 'Material deleted',
        description: 'The material has been removed.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete material. It may be in use by a product.',
        variant: 'destructive'
      });
      console.error('Error deleting material:', error);
    }
  });

  return {
    materials,
    isLoading,
    error,
    createMaterial,
    updateMaterial,
    deleteMaterial
  };
}
