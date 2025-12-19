-- Add user_id column to materials table
ALTER TABLE public.materials 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to products table
ALTER TABLE public.products 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing public access policies for materials
DROP POLICY IF EXISTS "Allow public delete materials" ON public.materials;
DROP POLICY IF EXISTS "Allow public insert materials" ON public.materials;
DROP POLICY IF EXISTS "Allow public read materials" ON public.materials;
DROP POLICY IF EXISTS "Allow public update materials" ON public.materials;

-- Create user-specific RLS policies for materials
CREATE POLICY "Users can view their own materials" 
ON public.materials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own materials" 
ON public.materials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials" 
ON public.materials 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials" 
ON public.materials 
FOR DELETE 
USING (auth.uid() = user_id);

-- Drop existing public access policies for products
DROP POLICY IF EXISTS "Allow public delete products" ON public.products;
DROP POLICY IF EXISTS "Allow public insert products" ON public.products;
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
DROP POLICY IF EXISTS "Allow public update products" ON public.products;

-- Create user-specific RLS policies for products
CREATE POLICY "Users can view their own products" 
ON public.products 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON public.products 
FOR DELETE 
USING (auth.uid() = user_id);

-- Update product_component_items policies to check product ownership
DROP POLICY IF EXISTS "Allow public delete product_component_items" ON public.product_component_items;
DROP POLICY IF EXISTS "Allow public insert product_component_items" ON public.product_component_items;
DROP POLICY IF EXISTS "Allow public read product_component_items" ON public.product_component_items;
DROP POLICY IF EXISTS "Allow public update product_component_items" ON public.product_component_items;

CREATE POLICY "Users can view their product component items" 
ON public.product_component_items 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND user_id = auth.uid()));

CREATE POLICY "Users can create their product component items" 
ON public.product_component_items 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND user_id = auth.uid()));

CREATE POLICY "Users can update their product component items" 
ON public.product_component_items 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete their product component items" 
ON public.product_component_items 
FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND user_id = auth.uid()));

-- Update product_formula_items policies to check product ownership
DROP POLICY IF EXISTS "Allow public delete product_formula_items" ON public.product_formula_items;
DROP POLICY IF EXISTS "Allow public insert product_formula_items" ON public.product_formula_items;
DROP POLICY IF EXISTS "Allow public read product_formula_items" ON public.product_formula_items;
DROP POLICY IF EXISTS "Allow public update product_formula_items" ON public.product_formula_items;

CREATE POLICY "Users can view their product formula items" 
ON public.product_formula_items 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND user_id = auth.uid()));

CREATE POLICY "Users can create their product formula items" 
ON public.product_formula_items 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND user_id = auth.uid()));

CREATE POLICY "Users can update their product formula items" 
ON public.product_formula_items 
FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete their product formula items" 
ON public.product_formula_items 
FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND user_id = auth.uid()));