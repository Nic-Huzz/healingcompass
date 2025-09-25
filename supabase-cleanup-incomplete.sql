-- Supabase Cleanup - Delete Incomplete Flow Sessions
-- Run this command in your Supabase SQL Editor

-- Delete all rows where flow_completed is false or null
DELETE FROM responses 
WHERE flow_completed = false OR flow_completed IS NULL;

-- Optional: Check how many rows were deleted
-- SELECT COUNT(*) as remaining_completed_flows FROM responses WHERE flow_completed = true;
