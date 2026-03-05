-- Create health_profiles table to store user health preferences
CREATE TABLE IF NOT EXISTS health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Food Allergies (Big 9)
  allergies TEXT[] DEFAULT '{}',
  
  -- Intolerances & Sensitivities
  intolerances TEXT[] DEFAULT '{}',
  
  -- Medical Conditions
  medical_conditions TEXT[] DEFAULT '{}',
  
  -- Dietary Lifestyles
  dietary_lifestyles TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one profile per user
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own health profile"
  ON health_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health profile"
  ON health_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health profile"
  ON health_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health profile"
  ON health_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_health_profiles_user_id ON health_profiles(user_id);
