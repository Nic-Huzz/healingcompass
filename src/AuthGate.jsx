import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'

export default function AuthGate({ children, context = {} }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleMagicLink = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSigningIn(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin
        }
      })
      
      if (error) {
        console.error('Magic link error:', error)
        alert('Failed to send magic link. Please try again.')
      } else {
        alert('Check your email for the magic link!')
      }
    } catch (error) {
      console.error('Magic link error:', error)
      alert('Failed to send magic link. Please try again.')
    } finally {
      setIsSigningIn(false)
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
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (session) {
    return children
  }

  // Prefill email from context if available
  const prefilledEmail = context.user_name || context.archetype_resources_email || context.email || ''

  return (
    <div className="app">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Healing Compass</h1>
            <p>Ready to uncover the patterns that quietly block your ambitions?</p>
          </div>
        </div>
      </header>

      <main className="chat-container">
        <div className="messages">
          <div className="message ai">
            <div className="bubble">
              <div className="text">
                Welcome to Healing Compass! 🌿<br/><br/>
                To save your progress and access your personalized profile, please sign in with your email address.
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="input-bar">
        <form onSubmit={handleMagicLink} style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="message-input"
            style={{ flex: 1 }}
            required
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={isSigningIn || !email.trim()}
          >
            {isSigningIn ? 'Sending...' : 'Continue with Email'}
          </button>
        </form>
      </footer>
    </div>
  )
}
