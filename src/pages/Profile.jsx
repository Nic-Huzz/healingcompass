import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getLastSession } from '../lib/flowPersistence'

export default function Profile({ onNavigate }) {
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
  const [leadProfile, setLeadProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          console.warn('[Profile] No session found')
          setLoading(false)
          return
        }

        // Get core profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (profileError) {
          console.warn('[Profile] Failed to load profile', { error: profileError.message })
        } else {
          setProfile(profileData)
        }

        // Get latest lead magnet snapshot
        const { data: leadData, error: leadError } = await supabase
          .from('lead_flow_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (leadError && leadError.code !== 'PGRST116') {
          console.warn('[Profile] Failed to load lead profile', { error: leadError.message })
        } else if (leadData) {
          setLeadProfile(leadData)
        } else if (!leadData && profileData?.email) {
          const { data: leadByEmail, error: leadByEmailError } = await supabase
            .from('lead_flow_profiles')
            .select('*')
            .eq('email', profileData.email)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (leadByEmailError && leadByEmailError.code !== 'PGRST116') {
            console.warn('[Profile] Failed to load lead profile by email', { error: leadByEmailError.message })
          } else if (leadByEmail) {
            setLeadProfile(leadByEmail)
          }
        }

        // Check for active session
        const flowSession = await getLastSession()
        setSession(flowSession)

      } catch (error) {
        console.warn('[Profile] Load error', { error: error.message })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleContinueFlow = (target) => {
    if (onNavigate) {
      onNavigate(target)
    } else {
      window.location.href = target
    }
  }

  const combinedProfile = {
    display_name: leadProfile?.user_name || profile?.display_name || '',
    email: leadProfile?.email || profile?.email || '',
    essence_archetype: leadProfile?.essence_archetype || profile?.essence_archetype || '',
    protective_archetype: leadProfile?.protective_archetype || profile?.protective_archetype || '',
    persona: leadProfile?.persona || profile?.persona || ''
  }

  if (loading) {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div className="typing-indicator">
            <span></span><span></span><span></span>
          </div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>My Profile</h1>
            <p>Your Healing Compass journey</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              background: 'none',
              border: '1px solid #5e17eb',
              color: '#5e17eb',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Back to Flow
          </button>
        </div>
      </header>

      <main className="chat-container">
        <div className="messages">
          <div className="message ai">
            <div className="bubble">
              <div className="text">
                <h2>Your Profile</h2>
                {combinedProfile.display_name || combinedProfile.email || combinedProfile.essence_archetype || combinedProfile.protective_archetype || combinedProfile.persona ? (
                  <div style={{ marginTop: '20px', lineHeight: '1.6' }}>
                    <p><strong>Name:</strong> {combinedProfile.display_name || 'Not set'}</p>
                    <p><strong>Email:</strong> {combinedProfile.email || 'Not set'}</p>
                    <p><strong>Essence Archetype:</strong> {combinedProfile.essence_archetype || 'Not discovered yet'}</p>
                    <p><strong>Protective Archetype:</strong> {combinedProfile.protective_archetype || 'Not discovered yet'}</p>
                    <p><strong>Persona:</strong> {combinedProfile.persona || 'Not set'}</p>
                  </div>
                ) : (
                  <p>No profile data available. Complete the Healing Compass flow to see your results.</p>
                )}
                { (session || leadProfile) && (
                  <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h3>Continue Your Journey</h3>
                    <p>
                      {session
                        ? 'You have an active Healing Compass session. Pick up where you left off!'
                        : 'Jump back into the lead flow and keep building your profile insights.'}
                    </p>
                    <button 
                      onClick={() => handleContinueFlow(session ? '/healingcompass' : '/lead')}
                      style={{
                        background: 'linear-gradient(135deg, #5e17eb, #ffdd27)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        marginTop: '10px'
                      }}
                    >
                      {session ? 'Continue Healing Compass' : 'Resume Lead Flow'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
