-- Supabase Merged Responses Sorted by First Response Time
-- Run this command in your Supabase SQL Editor

-- Create a view that merges all responses by session and sorts by first response time
CREATE OR REPLACE VIEW merged_responses_sorted AS
SELECT 
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
  MIN(created_at) as first_response_time,
  MAX(created_at) as last_response_time,
  COUNT(*) as total_responses
FROM responses
GROUP BY 
  session_id, user_name, healing_compass_consent, ambition_gap,
  logical_reasons_list, past_parallel_context, splinter_event_description,
  post_event_feeling, splinter_identity_verdict, biology_acknowledgement,
  release_resources_email, protective_archetype, loop_acknowledged,
  essence_archetype_selection, persona_selection, resource_opt_in,
  challenge_opt_in, closing_acknowledgement, email, flow_version
ORDER BY first_response_time ASC;

-- Query to see the merged and sorted results
SELECT * FROM merged_responses_sorted;
