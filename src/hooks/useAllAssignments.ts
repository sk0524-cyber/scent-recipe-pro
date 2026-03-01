import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ProductStoreAssignment } from './useProductStoreAssignments';

export function useAllAssignments() {
  const { user } = useAuth();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['all_product_store_assignments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_store_assignments')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ProductStoreAssignment[];
    },
    enabled: !!user,
  });

  return { assignments, isLoading };
}
