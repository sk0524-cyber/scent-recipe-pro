-- Drop existing restrictive policies on materials
DROP POLICY IF EXISTS "Users can create their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can delete their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can update their own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can view their own materials" ON public.materials;

-- Create permissive policies for materials (temporary public access)
CREATE POLICY "Allow public insert" ON public.materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.materials FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON public.materials FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.materials FOR DELETE USING (true);

-- Drop existing restrictive policies on products
DROP POLICY IF EXISTS "Users can create their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;

-- Create permissive policies for products (temporary public access)
CREATE POLICY "Allow public insert" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.products FOR DELETE USING (true);

-- Drop existing restrictive policies on product_formula_items
DROP POLICY IF EXISTS "Users can create their product formula items" ON public.product_formula_items;
DROP POLICY IF EXISTS "Users can delete their product formula items" ON public.product_formula_items;
DROP POLICY IF EXISTS "Users can update their product formula items" ON public.product_formula_items;
DROP POLICY IF EXISTS "Users can view their product formula items" ON public.product_formula_items;

-- Create permissive policies for product_formula_items (temporary public access)
CREATE POLICY "Allow public insert" ON public.product_formula_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.product_formula_items FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON public.product_formula_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.product_formula_items FOR DELETE USING (true);

-- Drop existing restrictive policies on product_component_items
DROP POLICY IF EXISTS "Users can create their product component items" ON public.product_component_items;
DROP POLICY IF EXISTS "Users can delete their product component items" ON public.product_component_items;
DROP POLICY IF EXISTS "Users can update their product component items" ON public.product_component_items;
DROP POLICY IF EXISTS "Users can view their product component items" ON public.product_component_items;

-- Create permissive policies for product_component_items (temporary public access)
CREATE POLICY "Allow public insert" ON public.product_component_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.product_component_items FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON public.product_component_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.product_component_items FOR DELETE USING (true);