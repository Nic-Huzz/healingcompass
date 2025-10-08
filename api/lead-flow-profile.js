export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const ANON_KEY = process.env.SUPABASE_ANON_KEY

    if (!SUPABASE_URL) {
      return res.status(500).json({ error: 'Missing Supabase URL environment variable' })
    }

    const authKey = SERVICE_ROLE_KEY || ANON_KEY
    if (!authKey) {
      return res.status(500).json({ error: 'No Supabase auth key configured' })
    }

    const { payload } = req.body || {}
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Missing payload' })
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/lead_flow_profiles?on_conflict=session_id`, {
      method: 'POST',
      headers: {
        apikey: authKey,
        Authorization: `Bearer ${authKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal,resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const text = await response.text()
      return res.status(response.status).json({ error: 'Supabase upsert failed', details: text })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('[lead-flow-profile] unexpected error', error)
    return res.status(500).json({ error: 'Unexpected error', details: error.message })
  }
}
