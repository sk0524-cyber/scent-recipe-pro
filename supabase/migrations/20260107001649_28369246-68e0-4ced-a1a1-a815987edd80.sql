-- Drop all permissive public policies from all tables
DROP POLICY IF EXISTS "Allow public insert" ON public.materials;
DROP POLICY IF EXISTS "Allow public select" ON public.materials;
DROP POLICY IF EXISTS "Allow public update" ON public.materials;
DROP POLICY IF EXISTS "Allow public delete" ON public.materials;

DROP POLICY IF EXISTS "Allow public insert" ON public.products;
DROP POLICY IF EXISTS "Allow public select" ON public.products;
DROP POLICY IF EXISTS "Allow public update" ON public.products;
DROP POLICY IF EXISTS "Allow public delete" ON public.products;

DROP POLICY IF EXISTS "Allow public insert" ON public.product_formula_items;
DROP POLICY IF EXISTS "Allow public select" ON public.product_formula_items;
DROP POLICY IF EXISTS "Allow public update" ON public.product_formula_items;
DROP POLICY IF EXISTS "Allow public delete" ON public.product_formula_items;

DROP POLICY IF EXISTS "Allow public insert" ON public.product_component_items;
DROP POLICY IF EXISTS "Allow public select" ON public.product_component_items;
DROP POLICY IF EXISTS "Allow public update" ON public.product_component_items;
DROP POLICY IF EXISTS "Allow public delete" ON public.product_component_items;

-- Create user-scoped RLS policies for materials
CREATE POLICY "Users can view own materials" 
  ON public.materials FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own materials" 
  ON public.materials FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own materials" 
  ON public.materials FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own materials" 
  ON public.materials FOR DELETE 
  USING (auth.uid() = user_id);

-- Create user-scoped RLS policies for products
CREATE POLICY "Users can view own products" 
  ON public.products FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own products" 
  ON public.products FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" 
  ON public.products FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" 
  ON public.products FOR DELETE 
  USING (auth.uid() = user_id);

-- Create user-scoped RLS policies for product_formula_items (via product ownership)
CREATE POLICY "Users can view own formula items" 
  ON public.product_formula_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create own formula items" 
  ON public.product_formula_items FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update own formula items" 
  ON public.product_formula_items FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own formula items" 
  ON public.product_formula_items FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND user_id = auth.uid()
  ));

-- Create user-scoped RLS policies for product_component_items (via product ownership)
CREATE POLICY "Users can view own component items" 
  ON public.product_component_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create own component items" 
  ON public.product_component_items FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update own component items" 
  ON public.product_component_items FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own component items" 
  ON public.product_component_items FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND user_id = auth.uid()
  ));