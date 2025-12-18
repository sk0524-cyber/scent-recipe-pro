-- Add weight_per_case and weight_per_case_unit columns to materials table
-- These are used for materials purchased by case that contain a weight (e.g., wax sold as 45lb/case)

ALTER TABLE public.materials 
ADD COLUMN weight_per_case numeric NULL,
ADD COLUMN weight_per_case_unit text NULL;

-- Add a comment for documentation
COMMENT ON COLUMN public.materials.weight_per_case IS 'Total weight contained in one case/pack (e.g., 45 for 45 lbs per case)';
COMMENT ON COLUMN public.materials.weight_per_case_unit IS 'Unit of weight per case (lb, oz, grams)';