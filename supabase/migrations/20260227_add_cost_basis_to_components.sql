-- Add cost_basis column to product_component_items
-- 'unit' = cost per individual unit (e.g., per stick)
-- 'pack' = cost per selling pack (e.g., 1 box per 10-stick pack)
ALTER TABLE public.product_component_items
ADD COLUMN IF NOT EXISTS cost_basis TEXT NOT NULL DEFAULT 'unit'
CHECK (cost_basis IN ('unit', 'pack'));
