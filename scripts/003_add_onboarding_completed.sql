-- Add onboarding_completed column to health_profiles
ALTER TABLE health_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
