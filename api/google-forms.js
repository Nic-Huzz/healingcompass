export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data } = req.body;
    
    // Google Forms endpoint - this will work without OAuth2
    const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdYOUR_FORM_ID/formResponse';
    
    // Prepare form data
    const formData = new URLSearchParams({
      'entry.1234567890': new Date().toISOString(), // Timestamp
      'entry.1234567891': data.session_id || '',
      'entry.1234567892': data.step || '',
      'entry.1234567893': data.user_name || '',
      'entry.1234567894': data.ambition_gap || '',
      'entry.1234567895': data.logical_reasons || '',
      'entry.1234567896': data.past_parallel || '',
      'entry.1234567897': data.splinter_event || '',
      'entry.1234567898': data.post_event_feeling || '',
      'entry.1234567899': data.pre_splinter_identity || '',
      'entry.1234567900': data.splinter_identity || '',
      'entry.1234567901': data.reclaim_consent || '',
      'entry.1234567902': data.protective_archetype || '',
      'entry.1234567903': data.loop_acknowledged || '',
      'entry.1234567904': data.second_half_consent || '',
      'entry.1234567905': data.biology_understanding || '',
      'entry.1234567906': data.essence_archetype || '',
      'entry.1234567907': data.persona_selection || '',
      'entry.1234567908': data.email || '',
      'entry.1234567909': data.flow_version || '1.0',
      'entry.1234567910': data.flow_completed || false
    });

    // Submit to Google Forms
    const response = await fetch(FORM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    if (response.ok) {
      console.log('✅ Successfully submitted to Google Forms');
      return res.status(200).json({ 
        success: true, 
        message: 'Data submitted to Google Forms successfully'
      });
    } else {
      throw new Error(`HTTP ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Google Forms Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}
