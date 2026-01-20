-- Fix: Add unique constraint if it doesn't exist
-- Run this in your Supabase SQL Editor

-- Drop existing constraint if it exists (in case it's corrupted)
ALTER TABLE health_metrics DROP CONSTRAINT IF EXISTS health_metrics_user_id_date_key;

-- Add the unique constraint
ALTER TABLE health_metrics ADD CONSTRAINT health_metrics_user_id_date_key UNIQUE (user_id, date);

-- Verify it was created
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'health_metrics' AND constraint_type = 'UNIQUE';
