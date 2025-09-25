-- Supabase Diagnostic Queries
-- Run these in your Supabase SQL Editor to check table structure and data

-- 1. Check if the responses table exists and its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'responses' 
ORDER BY ordinal_position;

-- 2. Check recent data in the responses table
SELECT * FROM responses 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Check if there are any constraints or issues
SELECT constraint_name, constraint_type, table_name
FROM information_schema.table_constraints 
WHERE table_name = 'responses';

-- 4. Check table permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'responses';

-- 5. Test a simple insert to see if it works
INSERT INTO responses (session_id, step, user_name, flow_version, flow_completed)
VALUES ('diagnostic-test-' || extract(epoch from now()), 'diagnostic', 'Test User', '1.0.0', false);

-- 6. Check if the insert worked
SELECT * FROM responses 
WHERE session_id LIKE 'diagnostic-test-%' 
ORDER BY created_at DESC 
LIMIT 5;
