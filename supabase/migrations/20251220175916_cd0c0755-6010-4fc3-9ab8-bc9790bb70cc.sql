-- Add reed_stick_count column to products table for Reed Diffusers
ALTER TABLE public.products 
ADD COLUMN reed_stick_count integer NULL;