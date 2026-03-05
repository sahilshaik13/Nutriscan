-- Create food_scans table to store all scanned food items
CREATE TABLE IF NOT EXISTS public.food_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  image_url TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  nutrition_data JSONB DEFAULT '{}'::jsonb,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  health_rating TEXT CHECK (health_rating IN ('very_healthy', 'healthy', 'moderate', 'unhealthy', 'very_unhealthy')),
  questions_answered JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.food_scans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own scans" ON public.food_scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans" ON public.food_scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans" ON public.food_scans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scans" ON public.food_scans
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_food_scans_user_id ON public.food_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_food_scans_created_at ON public.food_scans(created_at DESC);
