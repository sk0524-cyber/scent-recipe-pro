
-- Create store_sales_records table
CREATE TABLE public.store_sales_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.product_store_assignments(id) ON DELETE CASCADE,
  period_month date NOT NULL,
  units_sold numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, period_month)
);

-- Enable RLS
ALTER TABLE public.store_sales_records ENABLE ROW LEVEL SECURITY;

-- RLS policies scoped through assignment -> product -> user_id
CREATE POLICY "Users can view own sales records" ON public.store_sales_records
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.product_store_assignments psa
    JOIN public.products p ON p.id = psa.product_id
    WHERE psa.id = store_sales_records.assignment_id
      AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own sales records" ON public.store_sales_records
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.product_store_assignments psa
    JOIN public.products p ON p.id = psa.product_id
    WHERE psa.id = store_sales_records.assignment_id
      AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own sales records" ON public.store_sales_records
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.product_store_assignments psa
    JOIN public.products p ON p.id = psa.product_id
    WHERE psa.id = store_sales_records.assignment_id
      AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own sales records" ON public.store_sales_records
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.product_store_assignments psa
    JOIN public.products p ON p.id = psa.product_id
    WHERE psa.id = store_sales_records.assignment_id
      AND p.user_id = auth.uid()
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_store_sales_records_updated_at
  BEFORE UPDATE ON public.store_sales_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
