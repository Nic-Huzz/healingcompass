-- Add Missing Columns to Supabase responses table
-- Run this in your Supabase SQL Editor

-- Add the missing columns that are causing the errors
ALTER TABLE responses ADD COLUMN IF NOT EXISTS archetype_acknowledgment TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS inner_alarm_resources_email TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS essence_reveal_response TEXT;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'responses' 
AND column_name IN ('archetype_acknowledgment', 'inner_alarm_resources_email', 'essence_reveal_response')
ORDER BY column_name;
