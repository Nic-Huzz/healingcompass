-- Supabase Schema Fix - Add Missing Columns
-- Run these commands in your Supabase SQL Editor

-- Add all missing columns first
ALTER TABLE responses ADD COLUMN IF NOT EXISTS challenge_opt_in TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS biology_acknowledgement TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS release_resources_email TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS closing_acknowledgement TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS logical_reasons_list TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS past_parallel_context TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS splinter_event_description TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS splinter_identity_verdict TEXT;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS essence_archetype_selection TEXT;

-- Now update the merged_responses view
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
