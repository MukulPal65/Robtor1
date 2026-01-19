-- Run this to update your existing profiles table
-- It will add the missing columns without recreating the table

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS age int,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS height numeric,
ADD COLUMN IF NOT EXISTS weight numeric,
ADD COLUMN IF NOT EXISTS blood_type text,
ADD COLUMN IF NOT EXISTS has_wearable boolean default false,
ADD COLUMN IF NOT EXISTS wearable_type text,
ADD COLUMN IF NOT EXISTS medical_history text[],
ADD COLUMN IF NOT EXISTS chronic_conditions text[],
ADD COLUMN IF NOT EXISTS medications text[],
ADD COLUMN IF NOT EXISTS allergies text[],
ADD COLUMN IF NOT EXISTS emergency_contact jsonb;
