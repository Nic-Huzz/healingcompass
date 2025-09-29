import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useEnsureProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ensureProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          setLoading(false)
          return
        }

        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.warn('Error fetching profile:', fetchError)
          setLoading(false)
          return
        }

        if (!existingProfile) {
          // Create new profile
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: session.user.id,
              email: session.user.email,
              display_name: '',
              essence_archetype: '',
              protective_archetype: '',
              persona: ''
            })
            .select()
            .single()

          if (createError) {
            console.warn('Error creating profile:', createError)
          } else {
            setProfile(newProfile)
          }
        } else {
          setProfile(existingProfile)
        }
      } catch (error) {
        console.warn('Error in ensureProfile:', error)
      } finally {
        setLoading(false)
      }
    }

    ensureProfile()
  }, [])

  const updateProfileFromContext = async (context) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user || !profile) return

      const updates = {}
      
      if (context.user_name) updates.display_name = context.user_name
      if (context.email || context.archetype_resources_email) updates.email = context.email || context.archetype_resources_email
      if (context.essence_archetype_selection) updates.essence_archetype = context.essence_archetype_selection
      if (context.protective_archetype) updates.protective_archetype = context.protective_archetype
      if (context.persona_selection) updates.persona = context.persona_selection

      if (Object.keys(updates).length === 0) return

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', session.user.id)
        .select()
        .single()

      if (error) {
        console.warn('Error updating profile:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.warn('Error updating profile from context:', error)
    }
  }

  return { profile, loading, updateProfileFromContext }
}
