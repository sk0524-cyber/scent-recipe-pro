import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ProductStoreAssignment {
  id: string;
  product_id: string;
  store_id: string;
  commission_override_pct: number | null;
  estimated_monthly_units: number;
  created_at: string;
}

export interface AssignmentFormData {
  product_id: string;
  store_id: string;
  commission_override_pct?: number | null;
  estimated_monthly_units: number;
}

export function useProductStoreAssignments(productId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['product_store_assignments', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_store_assignments')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ProductStoreAssignment[];
    },
    enabled: !!user && !!productId,
  });

  const createAssignment = useMutation({
    mutationFn: async (formData: AssignmentFormData) => {
      const { data, error } = await supabase
        .from('product_store_assignments')
        .insert(formData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_store_assignments', productId] });
      toast({ title: 'Store assigned', description: 'Product assigned to store successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to assign store. It may already be assigned.', variant: 'destructive' });
    },
  });

  const deleteAssignment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_store_assignments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_store_assignments', productId] });
      toast({ title: 'Store removed', description: 'Store assignment has been removed.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to remove store assignment.', variant: 'destructive' });
    },
  });

  return { assignments, isLoading, createAssignment, deleteAssignment };
}
