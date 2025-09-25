export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data } = req.body;
    
    // Google Sheets API configuration
    const SHEET_ID = '1jzbvD99PtRIY5VN6My4W1hamu132mrvSmyFfJJoujvY';
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'Google Sheets API key not configured' });
    }

    // Prepare the data for Google Sheets
    const values = [
      [
        new Date().toISOString(), // Timestamp
        data.session_id || '',
        data.step || '',
        data.user_name || '',
        data.ambition_gap || '',
        data.logical_reasons || '',
        data.past_parallel || '',
        data.splinter_event || '',
        data.post_event_feeling || '',
        data.pre_splinter_identity || '',
        data.splinter_identity || '',
        data.reclaim_consent || '',
        data.protective_archetype || '',
        data.loop_acknowledged || '',
        data.second_half_consent || '',
        data.biology_understanding || '',
        data.essence_archetype || '',
        data.persona_selection || '',
        data.email || '',
        data.flow_version || '1.0',
        data.flow_completed || false
      ]
    ];

    // Append to Google Sheets
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:U:append?valueInputOption=RAW&key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: values
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API Error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to save to Google Sheets',
        details: errorText
      });
    }

    const result = await response.json();
    console.log('✅ Successfully saved to Google Sheets:', result);

    return res.status(200).json({ 
      success: true, 
      message: 'Data saved to Google Sheets successfully',
      result: result
    });

  } catch (error) {
    console.error('❌ Google Sheets Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}
