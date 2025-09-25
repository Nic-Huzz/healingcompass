-- Supabase Schema Update for New Alfred Flow
-- Run these commands in your Supabase SQL Editor

-- Add new fields for the updated flow
ALTER TABLE responses ADD COLUMN IF NOT EXISTS biology_acknowledgement TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS release_resources_email TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS closing_acknowledgement TEXT;

-- Update existing field names to match new flow structure
-- Note: These will create new columns, old data will be preserved in original columns
ALTER TABLE responses ADD COLUMN IF NOT EXISTS logical_reasons_list TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS past_parallel_context TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS splinter_event_description TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS splinter_identity_verdict TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS essence_archetype_selection TEXT;

-- Optional: Drop old unused columns (uncomment if you want to clean up)
-- ALTER TABLE responses DROP COLUMN IF EXISTS pre_splinter_identity;
-- ALTER TABLE responses DROP COLUMN IF EXISTS reclaim_consent;
-- ALTER TABLE responses DROP COLUMN IF EXISTS archetype_resources_email;
-- ALTER TABLE responses DROP COLUMN IF EXISTS second_half_consent;
-- ALTER TABLE responses DROP COLUMN IF EXISTS biology_understanding;
-- ALTER TABLE responses DROP COLUMN IF EXISTS logical_reasons;
-- ALTER TABLE responses DROP COLUMN IF EXISTS past_parallel;
-- ALTER TABLE responses DROP COLUMN IF EXISTS splinter_event;
-- ALTER TABLE responses DROP COLUMN IF EXISTS splinter_identity;
-- ALTER TABLE responses DROP COLUMN IF EXISTS essence_archetype;

-- Update the merged_responses view to include new fields
DROP VIEW IF EXISTS merged_responses;

CREATE VIEW merged_responses AS
SELECT 
  id,
  session_id,
  user_name,
  healing_compass_consent,
  ambition_gap,
  logical_reasons_list,
  past_parallel_context,
  splinter_event_description,
  post_event_feeling,
  splinter_identity_verdict,
  biology_acknowledgement,
  release_resources_email,
  protective_archetype,
  loop_acknowledged,
  essence_archetype_selection,
  persona_selection,
  resource_opt_in,
  challenge_opt_in,
  closing_acknowledgement,
  email,
  flow_version,
  BOOL_OR(flow_completed) as flow_completed,
  MIN(created_at) as first_response,
  MAX(created_at) as last_response,
  COUNT(*) as total_responses
FROM responses
GROUP BY 
  id, session_id, user_name, healing_compass_consent, ambition_gap,
  logical_reasons_list, past_parallel_context, splinter_event_description,
  post_event_feeling, splinter_identity_verdict, biology_acknowledgement,
  release_resources_email, protective_archetype, loop_acknowledged,
  essence_archetype_selection, persona_selection, resource_opt_in,
  challenge_opt_in, closing_acknowledgement, email, flow_version;
