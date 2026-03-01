
CREATE TABLE public.retail_stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  default_commission_pct NUMERIC NOT NULL,
  monthly_fee NUMERIC NOT NULL DEFAULT 0,
  per_unit_fee NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.retail_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stores" ON public.retail_stores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own stores" ON public.retail_stores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stores" ON public.retail_stores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stores" ON public.retail_stores FOR DELETE USING (auth.uid() = user_id);
