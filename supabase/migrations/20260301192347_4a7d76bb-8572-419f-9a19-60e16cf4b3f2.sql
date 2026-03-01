
CREATE TABLE public.product_store_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.retail_stores(id) ON DELETE CASCADE,
  commission_override_pct NUMERIC,
  estimated_monthly_units NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, store_id)
);

ALTER TABLE public.product_store_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assignments"
  ON public.product_store_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = product_store_assignments.product_id
    AND products.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own assignments"
  ON public.product_store_assignments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = product_store_assignments.product_id
    AND products.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own assignments"
  ON public.product_store_assignments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = product_store_assignments.product_id
    AND products.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own assignments"
  ON public.product_store_assignments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = product_store_assignments.product_id
    AND products.user_id = auth.uid()
  ));
