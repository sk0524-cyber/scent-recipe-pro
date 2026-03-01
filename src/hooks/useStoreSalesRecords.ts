import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, subMonths } from 'date-fns';

export interface StoreSalesRecord {
  id: string;
  assignment_id: string;
  period_month: string;
  units_sold: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useStoreSalesRecords() {
  const { user } = useAuth();

  const { data: salesRecords = [], isLoading } = useQuery({
    queryKey: ['store_sales_records', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_sales_records')
        .select('*')
        .order('period_month', { ascending: false });

      if (error) throw error;
      return data as StoreSalesRecord[];
    },
    enabled: !!user,
  });

  return { salesRecords, isLoading };
}

export function useUpsertSalesRecord() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      periodMonth,
      unitsSold,
      notes,
    }: {
      assignmentId: string;
      periodMonth: string; // YYYY-MM-DD (first of month)
      unitsSold: number;
      notes?: string;
    }) => {
      // Try to find existing record
      const { data: existing } = await supabase
        .from('store_sales_records')
        .select('id')
        .eq('assignment_id', assignmentId)
        .eq('period_month', periodMonth)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('store_sales_records')
          .update({ units_sold: unitsSold, notes: notes ?? null })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('store_sales_records')
          .insert({
            assignment_id: assignmentId,
            period_month: periodMonth,
            units_sold: unitsSold,
            notes: notes ?? null,
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store_sales_records', user?.id] });
    },
  });
}

/** Helper: get the period_month string for a given date */
export function getPeriodMonth(date: Date = new Date()): string {
  return format(startOfMonth(date), 'yyyy-MM-dd');
}

/** Helper: get units sold for a specific assignment + month from records array */
export function getUnitsSoldForMonth(
  records: StoreSalesRecord[],
  assignmentId: string,
  periodMonth: string
): number {
  const record = records.find(
    (r) => r.assignment_id === assignmentId && r.period_month === periodMonth
  );
  return record ? Number(record.units_sold) : 0;
}

/** Helper: get total units sold across last 12 months for an assignment */
export function getUnitsLast12Months(
  records: StoreSalesRecord[],
  assignmentId: string,
  referenceDate: Date = new Date()
): number {
  const twelveMonthsAgo = format(startOfMonth(subMonths(referenceDate, 11)), 'yyyy-MM-dd');
  const currentMonth = format(startOfMonth(referenceDate), 'yyyy-MM-dd');

  return records
    .filter(
      (r) =>
        r.assignment_id === assignmentId &&
        r.period_month >= twelveMonthsAgo &&
        r.period_month <= currentMonth
    )
    .reduce((sum, r) => sum + Number(r.units_sold), 0);
}
