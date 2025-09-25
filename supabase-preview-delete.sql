-- Supabase Preview Delete - See What Will Be Deleted
-- Run these commands in your Supabase SQL Editor

-- 1. First, see what will be deleted (preview)
SELECT 
  id,
  session_id,
  user_name,
  step,
  flow_completed,
  created_at
FROM responses 
WHERE flow_completed = false
ORDER BY created_at DESC;

-- 2. Count how many rows will be deleted
SELECT COUNT(*) as rows_to_delete
FROM responses 
WHERE flow_completed = false;

-- 3. Count how many completed flows will remain
SELECT COUNT(*) as completed_flows_remaining
FROM responses 
WHERE flow_completed = true;

-- 4. If you're happy with the preview, run the delete command:
-- DELETE FROM responses WHERE flow_completed = false;
