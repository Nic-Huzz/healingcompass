export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data } = req.body;
    
    // Supabase configuration
    const SUPABASE_URL = process.env.SUPABASE_URL;
    
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }
    
    // Prepare the data for Supabase
           const payload = {
             session_id: data.session_id || '',
             step: data.step || '',
             user_name: data.user_name || '',
             healing_compass_consent: data.healing_compass_consent || '',
             ambition_gap: data.ambition_gap || '',
             // New field names
             logical_reasons_list: data.logical_reasons_list || '',
             past_parallel_context: data.past_parallel_context || '',
             splinter_event_description: data.splinter_event_description || '',
             post_event_feeling: data.post_event_feeling || '',
             splinter_identity_verdict: data.splinter_identity_verdict || '',
             biology_acknowledgement: data.biology_acknowledgement || '',
             inner_alarm_resources_email: data.inner_alarm_resources_email || '',
             release_resources_email: data.release_resources_email || '',
             protective_archetype: data.protective_archetype || '',
             archetype_acknowledgment: data.archetype_acknowledgment || '',
             loop_acknowledged: data.loop_acknowledged || '',
             essence_archetype_selection: data.essence_archetype_selection || '',
             essence_reveal_response: data.essence_reveal_response || '',
             persona_selection: data.persona_selection || '',
             resource_opt_in: data.resource_opt_in || '',
             challenge_opt_in: data.challenge_opt_in || '',
             closing_acknowledgement: data.closing_acknowledgement || '',
             // Old field names (for backward compatibility)
             logical_reasons: data.logical_reasons_list || '',
             past_parallel: data.past_parallel_context || '',
             splinter_event: data.splinter_event_description || '',
             splinter_identity: data.splinter_identity_verdict || '',
             essence_archetype: data.essence_archetype_selection || '',
             archetype_resources_email: data.release_resources_email || '',
             email: data.email || '',
             flow_version: data.flow_version || '1.0',
             flow_completed: data.flow_completed || false
           };

    // Insert into Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/responses`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ Successfully saved to Supabase');
      return res.status(200).json({ 
        success: true, 
        message: 'Data saved to Supabase successfully'
      });
    } else {
      const errorText = await response.text();
      console.error('Supabase API Error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to save to Supabase',
        details: errorText
      });
    }

  } catch (error) {
    console.error('❌ Supabase Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}
