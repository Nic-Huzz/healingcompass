export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data } = req.body;
    
    // Google Apps Script Web App URL
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
    
    // Prepare the data
    const payload = {
      timestamp: new Date().toISOString(),
      session_id: data.session_id || '',
      step: data.step || '',
      user_name: data.user_name || '',
      ambition_gap: data.ambition_gap || '',
      logical_reasons: data.logical_reasons || '',
      past_parallel: data.past_parallel || '',
      splinter_event: data.splinter_event || '',
      post_event_feeling: data.post_event_feeling || '',
      pre_splinter_identity: data.pre_splinter_identity || '',
      splinter_identity: data.splinter_identity || '',
      reclaim_consent: data.reclaim_consent || '',
      protective_archetype: data.protective_archetype || '',
      loop_acknowledged: data.loop_acknowledged || '',
      second_half_consent: data.second_half_consent || '',
      biology_understanding: data.biology_understanding || '',
      essence_archetype: data.essence_archetype || '',
      persona_selection: data.persona_selection || '',
      email: data.email || '',
      flow_version: data.flow_version || '1.0',
      flow_completed: data.flow_completed || false
    };

    // Submit to Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ Successfully submitted to Google Apps Script');
      return res.status(200).json({ 
        success: true, 
        message: 'Data saved to Google Sheets successfully'
      });
    } else {
      throw new Error(`HTTP ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Google Apps Script Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}
