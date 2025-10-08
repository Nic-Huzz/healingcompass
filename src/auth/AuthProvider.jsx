import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({
  user: null,
  session: null,
  isLoading: true,
  signInWithMagicLink: async () => ({ error: null }),
  signOut: async () => ({ error: null })
})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.warn('[AuthProvider] Failed to get session', { error: error.message })
          return
        }

        if (isMounted) {
          setSession(data?.session ?? null)
        }
      } catch (error) {
        console.warn('[AuthProvider] getSession error', { error: error.message })
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signInWithMagicLink = useCallback(async (email) => {
    if (!email) {
      console.error('[AuthProvider] No email provided')
      return { error: new Error('Email is required') }
    }

    console.log('[AuthProvider] === MAGIC LINK DEBUG START ===')
    console.log('[AuthProvider] Email:', email.trim())
    console.log('[AuthProvider] Redirect URL:', window.location.origin)
    console.log('[AuthProvider] Supabase client available:', !!supabase)
    console.log('[AuthProvider] Current URL:', window.location.href)

    try {
      console.log('[AuthProvider] Calling supabase.auth.signInWithOtp...')
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}`
        }
      })

      console.log('[AuthProvider] === SUPABASE RESPONSE ===')
      console.log('[AuthProvider] Data:', data)
      console.log('[AuthProvider] Error:', error)
      console.log('[AuthProvider] Error code:', error?.code)
      console.log('[AuthProvider] Error message:', error?.message)
      console.log('[AuthProvider] Error details:', error?.details)

      if (error) {
        console.error('[AuthProvider] Magic link failed:', {
          code: error.code,
          message: error.message,
          details: error.details,
          status: error.status
        })
        return { error }
      }

      console.log('[AuthProvider] ✅ Magic link sent successfully')
      return { error: null }
    } catch (error) {
      console.error('[AuthProvider] Magic link exception:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      return { error }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.warn('[AuthProvider] Sign out error', { error: error.message })
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.warn('[AuthProvider] Sign out exception', { error: error.message })
      return { error }
    }
  }, [])

  const value = useMemo(() => ({
    user: session?.user ?? null,
    session,
    isLoading,
    signInWithMagicLink,
    signOut
  }), [session, isLoading, signInWithMagicLink, signOut])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
