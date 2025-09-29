import { supabase } from './supabaseClient'
import { withTimeout } from './utils'

const FLOW_SLUG = 'healing-compass'
const FLOW_VERSION = 1

export async function upsertSession({ current_index, context }) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      console.warn('[flowPersistence] No session for upsertSession')
      return null
    }

    const { data, error } = await withTimeout(
      supabase
        .from('flow_sessions')
        .upsert({
          user_id: session.user.id,
          flow_slug: FLOW_SLUG,
          version: FLOW_VERSION,
          current_index,
          context
        }, {
          onConflict: 'user_id,flow_slug'
        })
        .select()
        .single()
    )

    if (error) {
      console.warn('[flowPersistence] Session upsert failed', { error: error.message })
      return null
    }

    return data
  } catch (error) {
    console.warn('[flowPersistence] Session upsert error', { error: error.message })
    return null
  }
}

export async function logEvent({ session_id, step_key, payload }) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      console.warn('[flowPersistence] No session for logEvent')
      return null
    }

    const { data, error } = await withTimeout(
      supabase
        .from('flow_events')
        .insert({
          user_id: session.user.id,
          session_id,
          flow_slug: FLOW_SLUG,
          step_key,
          payload
        })
        .select()
        .single()
    )

    if (error) {
      console.warn('[flowPersistence] Event log failed', { error: error.message })
      return null
    }

    return data
  } catch (error) {
    console.warn('[flowPersistence] Event log error', { error: error.message })
    return null
  }
}

export async function getLastSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      console.warn('[flowPersistence] No session for getLastSession')
      return null
    }

    const { data, error } = await withTimeout(
      supabase
        .from('flow_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('flow_slug', FLOW_SLUG)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    )

    if (error) {
      console.warn('[flowPersistence] Get session failed', { error: error.message })
      return null
    }

    return data
  } catch (error) {
    console.warn('[flowPersistence] Get session error', { error: error.message })
    return null
  }
}
