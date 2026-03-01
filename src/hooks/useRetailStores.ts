import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface RetailStore {
  id: string;
  user_id: string;
  name: string;
  default_commission_pct: number;
  monthly_fee: number;
  per_unit_fee: number;
  created_at: string;
}

export interface RetailStoreFormData {
  name: string;
  default_commission_pct: number;
  monthly_fee: number;
  per_unit_fee: number;
}

export function useRetailStores() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['retail_stores', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retail_stores')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as RetailStore[];
    },
    enabled: !!user,
  });

  const createStore = useMutation({
    mutationFn: async (formData: RetailStoreFormData) => {
      if (!user) throw new Error('You must be logged in');

      const { data, error } = await supabase
        .from('retail_stores')
        .insert({ ...formData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail_stores'] });
      toast({ title: 'Store added', description: 'Retail partner saved successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add store. Please try again.', variant: 'destructive' });
    },
  });

  const updateStore = useMutation({
    mutationFn: async ({ id, ...formData }: RetailStoreFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('retail_stores')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail_stores'] });
      toast({ title: 'Store updated', description: 'Your changes have been saved.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update store. Please try again.', variant: 'destructive' });
    },
  });

  const deleteStore = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('retail_stores').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail_stores'] });
      toast({ title: 'Store deleted', description: 'The retail partner has been removed.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete store. Please try again.', variant: 'destructive' });
    },
  });

  return { stores, isLoading, createStore, updateStore, deleteStore };
}
