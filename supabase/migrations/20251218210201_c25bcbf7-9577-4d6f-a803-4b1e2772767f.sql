-- Create materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  purchase_cost DECIMAL(10,2) NOT NULL,
  purchase_quantity DECIMAL(10,4) NOT NULL,
  purchase_unit TEXT NOT NULL,
  units_per_case DECIMAL(10,2),
  cost_per_unit DECIMAL(10,6) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  units_per_batch INTEGER NOT NULL DEFAULT 1,
  fill_weight_per_unit DECIMAL(10,4) NOT NULL,
  fill_unit TEXT NOT NULL DEFAULT 'oz',
  labor_rate_per_hour DECIMAL(10,2) DEFAULT 0,
  labor_hours_per_batch DECIMAL(10,2) DEFAULT 0,
  shipping_overhead_per_batch DECIMAL(10,2) DEFAULT 0,
  retail_markup DECIMAL(5,2) DEFAULT 300,
  wholesale_markup DECIMAL(5,2) DEFAULT 100,
  materials_cost_per_unit DECIMAL(10,4) DEFAULT 0,
  packaging_cost_per_unit DECIMAL(10,4) DEFAULT 0,
  labor_cost_per_unit DECIMAL(10,4) DEFAULT 0,
  shipping_cost_per_unit DECIMAL(10,4) DEFAULT 0,
  total_cogs_per_unit DECIMAL(10,4) DEFAULT 0,
  wholesale_price DECIMAL(10,2) DEFAULT 0,
  retail_price DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product formula items (percentage-based)
CREATE TABLE public.product_formula_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  percentage DECIMAL(5,2) NOT NULL,
  slot_type TEXT, -- 'wax1', 'wax2', 'wax3', 'fragrance', 'custom'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product component items (per-piece)
CREATE TABLE public.product_component_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  quantity_per_unit DECIMAL(10,2) NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (but allow public access for this MVP without auth)
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_formula_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_component_items ENABLE ROW LEVEL SECURITY;

-- Create public policies (no auth required for this business tool)
CREATE POLICY "Allow public read materials" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Allow public insert materials" ON public.materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update materials" ON public.materials FOR UPDATE USING (true);
CREATE POLICY "Allow public delete materials" ON public.materials FOR DELETE USING (true);

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read product_formula_items" ON public.product_formula_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert product_formula_items" ON public.product_formula_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update product_formula_items" ON public.product_formula_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete product_formula_items" ON public.product_formula_items FOR DELETE USING (true);

CREATE POLICY "Allow public read product_component_items" ON public.product_component_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert product_component_items" ON public.product_component_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update product_component_items" ON public.product_component_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete product_component_items" ON public.product_component_items FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();