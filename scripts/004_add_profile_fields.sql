-- Add name and age columns to health_profiles table
ALTER TABLE public.health_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER;
