import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getLastSession } from '../lib/flowPersistence'

export default function Profile({ onNavigate }) {
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
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

        // Get profile
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

  const handleContinueFlow = () => {
    if (onNavigate) {
      onNavigate('/')
    } else {
      window.location.href = '/'
    }
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
                {profile ? (
                  <div style={{ marginTop: '20px', lineHeight: '1.6' }}>
                    <p><strong>Name:</strong> {profile.display_name || 'Not set'}</p>
                    <p><strong>Email:</strong> {profile.email || 'Not set'}</p>
                    <p><strong>Essence Archetype:</strong> {profile.essence_archetype || 'Not discovered yet'}</p>
                    <p><strong>Protective Archetype:</strong> {profile.protective_archetype || 'Not discovered yet'}</p>
                    <p><strong>Persona:</strong> {profile.persona || 'Not set'}</p>
                  </div>
                ) : (
                  <p>No profile data available. Complete the Healing Compass flow to see your results.</p>
                )}
                
                {session && (
                  <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h3>Continue Your Journey</h3>
                    <p>You have an active Healing Compass session. Pick up where you left off!</p>
                    <button 
                      onClick={handleContinueFlow}
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
                      Continue Healing Compass
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
