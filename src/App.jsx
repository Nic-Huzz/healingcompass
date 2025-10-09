/* 
HEALING COMPASS — DO NOT CHANGE FLOW COPY/LOGIC HERE.
Allowed edits:
- Import/use flow persistence helpers
- Hydrate from getLastSession()
- Call upsertSession/logEvent in submit paths
*/
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import './App.css'
import { upsertSession, logEvent, getLastSession } from './lib/flowPersistence'
import { useEnsureProfile } from './hooks/useEnsureProfile'
import { resolvePrompt } from '@/lib/promptResolver' // [macros]
import { useAuth } from '@/auth/AuthProvider'
import { supabase } from '@/lib/supabaseClient'

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : ''

const buildResponsePayload = (data = {}) => ({
  session_id: data.session_id || '',
  step: data.step || '',
  user_name: data.user_name || '',
  healing_compass_consent: data.healing_compass_consent || '',
  ambition_gap: data.ambition_gap || '',
  logical_reasons_list: data.logical_reasons_list || '',
  past_parallel_context: data.past_parallel_context || '',
  splinter_event_description: data.splinter_event_description || '',
  post_event_feeling: data.post_event_feeling || '',
  splinter_identity_verdict: data.splinter_identity_verdict || '',
  biology_acknowledgement: data.biology_acknowledgement || '',
  inner_alarm_resources_email: data.inner_alarm_resources_email || '',
  release_resources_email: data.release_resources_email || '',
  protective_archetype: data.protective_archetype || '',
  archetype_acknowledgment: data.archetype_acknowledgment || '',
  loop_acknowledged: data.loop_acknowledged || '',
  essence_archetype_selection: data.essence_archetype_selection || '',
  essence_reveal_response: data.essence_reveal_response || '',
  persona_selection: data.persona_selection || '',
  resource_opt_in: data.resource_opt_in || '',
  challenge_opt_in: data.challenge_opt_in || '',
  closing_acknowledgement: data.closing_acknowledgement || '',
  email: data.email || '',
  flow_version: data.flow_version || '1.0.0',
  flow_completed: data.flow_completed || false,
  // Back-compat fields
  logical_reasons: data.logical_reasons_list || '',
  past_parallel: data.past_parallel_context || '',
  splinter_event: data.splinter_event_description || '',
  splinter_identity: data.splinter_identity_verdict || '',
  essence_archetype: data.essence_archetype_selection || '',
  archetype_resources_email: data.release_resources_email || '',
})

function App({ flowSrc = '/flow.json' } = {}) { // [flowSrc]
  const [flow, setFlow] = useState(null)
  const [flowMeta, setFlowMeta] = useState({ name: 'No flow loaded', version: null, ok: false, error: null })
  const [messages, setMessages] = useState([])
  const [context, setContext] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [typingMessage, setTypingMessage] = useState('')
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef(null)

  // Profile management
  const { profile, updateProfileFromContext } = useEnsureProfile()
  const { user, signInWithMagicLink } = useAuth()
  const [isSendingLoginLink, setIsSendingLoginLink] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginFeedback, setLoginFeedback] = useState('')
  const lastProfileSyncKey = useRef(null)

  const syncLeadFlowProfile = useCallback(async (answers) => {
    if (!supabase) {
      console.warn('[LeadFlow] Supabase not available, skipping sync')
      return
    }
    
    const { data: sessionData } = await supabase.auth.getSession()
    const supaUser = sessionData?.session?.user

    const payload = {
      session_id: sessionId,
      user_id: supaUser?.id ?? null,
      user_name: answers.user_name || null,
      protective_archetype:
        answers.protective_archetype_selection ||
        answers.protective_archetype ||
        null,
      protective_confirm: answers.protective_archetype_reflect || null,
      essence_archetype:
        answers.essence_archetype_selection ||
        answers.essence_archetype ||
        null,
      essence_confirm: answers.essence_archetype_reflect || null,
      email:
        answers.user_email ||
        answers.email ||
        answers.inner_alarm_resources_email ||
        null,
      persona: answers.persona_selection || answers.persona || null,
      context: answers || {},
    }

    try {
      const response = await fetch(`${API_BASE}/api/lead-flow-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      })
      if (!response.ok) {
        const details = await response.text()
        console.warn('[LeadFlow] Sync failed', {
          status: response.status,
          details,
        })
      }
    } catch (error) {
      console.warn(
        '[LeadFlow] Failed to sync via API — falling back to client insert',
        { error: error.message }
      )
      try {
        if (!supabase) {
          console.warn('[Fallback] Supabase not available, cannot save lead profile')
          return
        }
        
        const { error: fallbackError } = await supabase
          .from('lead_flow_profiles')
          .upsert(payload, { onConflict: 'session_id' })
        if (fallbackError) throw fallbackError
        console.warn('[Fallback] Saved lead profile directly from client')
      } catch (fallbackError) {
        console.error('[Fallback] Failed to save lead profile:', fallbackError)
      }
    }
  }, [sessionId])

  const profileSyncPayload = useMemo(() => ({
    user_name: context.user_name,
    email: context.email,
    user_email: context.user_email,
    inner_alarm_resources_email: context.inner_alarm_resources_email,
    archetype_resources_email: context.archetype_resources_email,
    essence_archetype_selection: context.essence_archetype_selection,
    essence_archetype: context.essence_archetype,
    protective_archetype_selection: context.protective_archetype_selection,
    protective_archetype: context.protective_archetype,
    persona_selection: context.persona_selection,
    persona: context.persona
  }), [
    context.user_name,
    context.email,
    context.user_email,
    context.inner_alarm_resources_email,
    context.archetype_resources_email,
    context.essence_archetype_selection,
    context.essence_archetype,
    context.protective_archetype_selection,
    context.protective_archetype,
    context.persona_selection,
    context.persona
  ])

  const profileSyncDisplayName = profileSyncPayload.user_name || ''
  const profileSyncEmail = profileSyncPayload.user_email
    || profileSyncPayload.email
    || profileSyncPayload.inner_alarm_resources_email
    || profileSyncPayload.archetype_resources_email
    || ''
  const profileSyncProtective = profileSyncPayload.protective_archetype_selection
    || profileSyncPayload.protective_archetype
    || ''
  const profileSyncEssence = profileSyncPayload.essence_archetype_selection
    || profileSyncPayload.essence_archetype
    || ''
  const profileSyncPersona = profileSyncPayload.persona_selection
    || profileSyncPayload.persona
    || ''

  const profileSyncKey = useMemo(
    () => JSON.stringify({
      profileSyncDisplayName,
      profileSyncEmail,
      profileSyncProtective,
      profileSyncEssence,
      profileSyncPersona
    }),
    [
      profileSyncDisplayName,
      profileSyncEmail,
      profileSyncProtective,
      profileSyncEssence,
      profileSyncPersona
    ]
  )

  const profileSyncHasData = useMemo(
    () => Boolean(
      profileSyncDisplayName
      || profileSyncEmail
      || profileSyncProtective
      || profileSyncEssence
      || profileSyncPersona
    ),
    [
      profileSyncDisplayName,
      profileSyncEmail,
      profileSyncProtective,
      profileSyncEssence,
      profileSyncPersona
    ]
  )

  useEffect(() => {
    if (!user || !profile) return
    if (!profileSyncHasData) return
    if (lastProfileSyncKey.current === profileSyncKey) return

    let isCancelled = false

    const syncProfile = async () => {
      try {
        await updateProfileFromContext(profileSyncPayload)
        if (!isCancelled) {
          lastProfileSyncKey.current = profileSyncKey
        }
      } catch (error) {
        console.warn('[App] Lead flow profile sync failed', { error: error.message })
      }
    }

    syncProfile()

    return () => {
      isCancelled = true
    }
  }, [
    user?.id,
    profile?.id,
    profileSyncKey,
    profileSyncHasData,
    profileSyncPayload,
    updateProfileFromContext
  ])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingMessage])

  // Variable interpolation function
  // Typewriter effect
  const typeText = async (text, callback) => {
    setTypingMessage('')
    let currentText = ''
    
    for (let i = 0; i < text.length; i++) {
      currentText += text[i]
      setTypingMessage(currentText)
      await new Promise(resolve => setTimeout(resolve, 8))
    }
    
    if (callback) callback()
  }

  // Load flow.json
  useEffect(() => {
    const load = async () => {
      try {
        const source = flowSrc || '/flow.json' // [flowSrc]
        const res = await fetch(source, { cache: 'no-store' }) // [flowSrc]
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const nodes = Array.isArray(data?.steps) ? [...data.steps].sort((a,b) => (a.step_order_index||0) - (b.step_order_index||0)) : 
                     Array.isArray(data?.nodes) ? [...data.nodes].sort((a,b) => (a.step_order_index||0) - (b.step_order_index||0)) : []
        if (!nodes.length) throw new Error('No steps found')
        setFlow({ ...data, nodes })
        setFlowMeta({ name: data?.flow_name || 'Flow', version: data?.version || '0.0.0', ok: true, error: null })
        
        // Try to restore from server first
        const serverSession = await getLastSession()
        if (serverSession) {
          try {
            const { current_index, context: serverContext } = serverSession
            if (serverContext && typeof current_index === 'number') {
              setContext(serverContext)
              setCurrentIndex(current_index)
              // Rebuild messages from server context
              const first = nodes[0]
              const firstPrompt = resolvePrompt(first, serverContext) // [macros]
              setMessages([{ id: 'sys-0', isAI: true, text: firstPrompt, timestamp: new Date().toLocaleTimeString() }])
              return
            }
          } catch (e) {
            console.warn('Failed to restore from server:', e)
          }
        }
        
        // Fallback to localStorage
        const saved = localStorage.getItem('flow-conversation')
        if (saved) {
          try {
            const { messages: savedMessages, context: savedContext, currentIndex: savedIndex } = JSON.parse(saved)
            if (savedMessages?.length > 0) {
              setMessages(savedMessages)
              setContext(savedContext || {})
              setCurrentIndex(savedIndex || 0)
              return
            }
          } catch (e) {
            console.warn('Failed to restore conversation:', e)
          }
        }
        
        // Start fresh with typewriter effect
        const first = nodes[0]
        setMessages([{ id: 'sys-0', isAI: true, text: '', timestamp: new Date().toLocaleTimeString() }])
        setCurrentIndex(0)

        // Type the first message
        const firstPrompt = resolvePrompt(first, {}) // [macros]
        await typeText(firstPrompt, () => {
          setMessages([{ id: 'sys-0', isAI: true, text: firstPrompt, timestamp: new Date().toLocaleTimeString() }])
        })
      } catch (err) {
        setFlowMeta({ name: 'No flow loaded', version: null, ok: false, error: String(err?.message || err) })
      }
    }
    load()
  }, [flowSrc]) // [flowSrc]

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('flow-conversation', JSON.stringify({
        messages,
        context,
        currentIndex
      }))
    }
  }, [messages, context, currentIndex])

  const sendToSupabase = async (data) => {
    try {
      const response = await fetch(`${API_BASE}/api/supabase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('Data saved to Supabase:', result)
      return result
    } catch (error) {
      console.error('Failed to save to Supabase via API:', error)

      if (!supabase) {
        return null
      }
      try {
        const payload = buildResponsePayload(data)
        const { data: insertData, error: supabaseError } = await supabase
          .from('responses')
          .insert(payload)
          .select()

        if (supabaseError) {
          throw supabaseError
        }

        console.warn('[Fallback] Saved to Supabase directly from client')
        return insertData
      } catch (fallbackError) {
        console.error('[Fallback] Failed to save to Supabase directly:', fallbackError)
      }
    }
  }

  const currentNode = flow?.nodes?.[currentIndex]
  const canAdvance = () => {
    if (!currentNode) return false
    const req = currentNode.required_inputs || []
    return req.every(key => context[key.replace(/[{}]/g,'')])
  }


  // Submit data after each question
  const submitProgressToSupabase = async (updates) => {
    try {
      // Determine if this is a lead magnet flow or healing compass flow
      const isLeadMagnetFlow = flowMeta.name?.toLowerCase().includes('lead') || 
                              flowSrc?.includes('lead_magnet') ||
                              currentNode?.step?.startsWith('lead_')
      
      const progressData = {
        session_id: sessionId,
        step: currentNode?.step || 'unknown',
        step_index: currentIndex,
        user_name: updates.user_name || context.user_name || '',
        flow_version: flowMeta.version || '1.0.0',
        flow_completed: false
      }

      if (isLeadMagnetFlow) {
        // Lead magnet flow specific fields
        progressData.protective_archetype = updates.protective_archetype_selection || 
                                          updates.protective_archetype || 
                                          context.protective_archetype_selection || 
                                          context.protective_archetype || ''
        progressData.essence_archetype_selection = updates.essence_archetype_selection || 
                                                 context.essence_archetype_selection || ''
        progressData.email = updates.user_email || 
                           updates.email || 
                           context.user_email || 
                           context.email || ''
        progressData.persona_selection = updates.persona_selection || context.persona_selection || ''
      } else {
        // Healing compass flow fields
        progressData.healing_compass_consent = updates.healing_compass_consent || context.healing_compass_consent || ''
        progressData.ambition_gap = updates.ambition_gap || context.ambition_gap || ''
        progressData.logical_reasons_list = updates.logical_reasons_list || context.logical_reasons_list || ''
        progressData.past_parallel_context = updates.past_parallel_context || context.past_parallel_context || ''
        progressData.splinter_event_description = updates.splinter_event_description || context.splinter_event_description || ''
        progressData.post_event_feeling = updates.post_event_feeling || context.post_event_feeling || ''
        progressData.splinter_identity_verdict = updates.splinter_identity_verdict || context.splinter_identity_verdict || ''
        progressData.biology_acknowledgement = updates.biology_acknowledgement || context.biology_acknowledgement || ''
        progressData.inner_alarm_resources_email = updates.inner_alarm_resources_email || context.inner_alarm_resources_email || ''
        progressData.release_resources_email = updates.release_resources_email || context.release_resources_email || ''
        progressData.protective_archetype = updates.protective_archetype || context.protective_archetype || ''
        progressData.archetype_acknowledgment = updates.archetype_acknowledgment || context.archetype_acknowledgment || ''
        progressData.loop_acknowledged = updates.loop_acknowledged || context.loop_acknowledged || ''
        progressData.essence_archetype_selection = updates.essence_archetype_selection || context.essence_archetype_selection || ''
        progressData.essence_reveal_response = updates.essence_reveal_response || context.essence_reveal_response || ''
        progressData.persona_selection = updates.persona_selection || context.persona_selection || ''
        progressData.resource_opt_in = updates.resource_opt_in || context.resource_opt_in || ''
        progressData.challenge_opt_in = updates.challenge_opt_in || context.challenge_opt_in || ''
        progressData.closing_acknowledgement = updates.closing_acknowledgement || context.closing_acknowledgement || ''
        progressData.email = updates.email || context.email || ''
      }
      
      await sendToSupabase(progressData)
    } catch (error) {
      console.error('Failed to save progress:', error)
      // Don't block the flow if progress saving fails
    }
  }

  const submitFreeText = async () => {
    console.log('[App] submitFreeText called with inputText:', inputText)
    const trimmed = inputText.trim()
    if (!trimmed || !currentNode || isLoading) {
      console.log('[App] submitFreeText early return:', { trimmed, currentNode: currentNode?.step, isLoading })
      return
    }

    setIsLoading(true)
    const userMessage = { id: Date.now()+':u', isAI: false, text: trimmed, timestamp: new Date().toLocaleTimeString() }
    const updates = { ...context }
    if (currentNode.tag_as) {
      updates[currentNode.tag_as] = trimmed
    }
    if (currentNode.store_as) {
      updates[currentNode.store_as] = true
    }
    setContext(updates)

    const nextIndex = currentIndex + 1
    const nextNode = flow?.nodes?.[nextIndex]

    // Add user message immediately
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputText('')

    // Persist to server (non-blocking)
    try {
      const session = await upsertSession({ current_index: nextIndex, context: updates })
      if (session) {
        await logEvent({ 
          session_id: session.id, 
          step_key: currentNode.step, 
          payload: updates 
        })
      }
      // Update profile from context
      updateProfileFromContext(updates)
      syncLeadFlowProfile(updates)
    } catch (error) {
      console.warn('[App] Persistence failed', { error: error.message })
    }

    // Submit progress to Supabase
    await submitProgressToSupabase(updates)

    // Email + magic link for both flows (Lead Magnet + legacy)
    const isLeadEmailStep   = currentNode.step === 'lead_q7_email_capture'
    const isLegacyEmailStep = currentNode.step === 'q7_connect_dots_inner_alarm_opt_in'
    const candidateEmail =
      trimmed ||
      updates.user_email ||
      updates.email ||
      context.user_email ||
      context.email

    const emailRegex = /^\S+@\S+\.\S+$/

    // --- DETAILED DEBUG LOGGING ---
    console.log('[Magic Link Debug - Pre-Check]', {
      currentStep: currentNode.step,
      isLeadEmailStep,
      isLegacyEmailStep,
      candidateEmail,
      emailValid: candidateEmail ? emailRegex.test(candidateEmail) : false,
      willTrigger: (isLeadEmailStep || isLegacyEmailStep) && candidateEmail && emailRegex.test(candidateEmail),
      trimmed,
      updates,
      context
    })
    // --- END DETAILED DEBUG LOGGING ---

    if ((isLeadEmailStep || isLegacyEmailStep) && candidateEmail && emailRegex.test(candidateEmail)) {
      // Magic link only (no follow-up marketing email)
      console.log('[Magic Link] Triggering magic link for:', candidateEmail)
      try {
        await signInWithMagicLink(candidateEmail)
      } catch (err) {
        console.warn('[Auth] magic link failed', err)
      }
    } else {
      console.log('[Magic Link] Not triggering - conditions not met')
    }

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 800))

    // Check if this is the last step
    const isLastStep = !nextNode
    let responseText
    try {
      const handled = currentNode.response_handling && currentNode.response_handling[trimmed]
      responseText = handled
        ? currentNode.response_handling[trimmed]
        : (nextNode ? resolvePrompt(nextNode, updates) : 'Flow completed')
    } catch (e) {
      console.warn('Prompt resolve failed (free text)', e)
      responseText = nextNode?.prompt || '...'
    }

    // Add AI message with typewriter effect
    const aiMessage = { 
      id: Date.now()+':ai', 
      isAI: true, 
      text: responseText, 
      timestamp: new Date().toLocaleTimeString() 
    }
    
    // Add empty AI message first
    setMessages([...newMessages, { ...aiMessage, text: '' }])
    
    // Type the response
    await typeText(responseText, () => {
      setMessages([...newMessages, aiMessage])
    })
    
    if (nextNode) {
      setCurrentIndex(nextIndex)
    } else {
      // Flow completed - send final data to Supabase
      try {
        const isLeadMagnetFlow = flowMeta.name?.toLowerCase().includes('lead') || 
                                flowSrc?.includes('lead_magnet') ||
                                currentNode?.step?.startsWith('lead_')
        
        const finalData = {
          session_id: sessionId,
          step: 'completed',
          user_name: updates.user_name || '',
          flow_version: flowMeta.version || '1.0.0',
          flow_completed: true
        }

        if (isLeadMagnetFlow) {
          // Lead magnet flow final data
          finalData.protective_archetype = updates.protective_archetype_selection || 
                                         updates.protective_archetype || ''
          finalData.essence_archetype_selection = updates.essence_archetype_selection || ''
          finalData.email = updates.user_email || updates.email || ''
          finalData.persona_selection = updates.persona_selection || ''
        } else {
          // Healing compass flow final data
          finalData.healing_compass_consent = updates.healing_compass_consent || ''
          finalData.ambition_gap = updates.ambition_gap || ''
          finalData.logical_reasons_list = updates.logical_reasons_list || ''
          finalData.past_parallel_context = updates.past_parallel_context || ''
          finalData.splinter_event_description = updates.splinter_event_description || ''
          finalData.post_event_feeling = updates.post_event_feeling || ''
          finalData.splinter_identity_verdict = updates.splinter_identity_verdict || ''
          finalData.biology_acknowledgement = updates.biology_acknowledgement || ''
          finalData.inner_alarm_resources_email = updates.inner_alarm_resources_email || ''
          finalData.release_resources_email = updates.release_resources_email || ''
          finalData.protective_archetype = updates.protective_archetype || ''
          finalData.archetype_acknowledgment = updates.archetype_acknowledgment || ''
          finalData.loop_acknowledged = updates.loop_acknowledged || ''
          finalData.essence_archetype_selection = updates.essence_archetype_selection || ''
          finalData.essence_reveal_response = updates.essence_reveal_response || ''
          finalData.persona_selection = updates.persona_selection || ''
          finalData.resource_opt_in = updates.resource_opt_in || ''
          finalData.challenge_opt_in = updates.challenge_opt_in || ''
          finalData.closing_acknowledgement = updates.closing_acknowledgement || ''
          finalData.email = updates.email || ''
        }
        
        await sendToSupabase(finalData)
        
        // Add success message with typewriter
        const successMessage = {
          id: Date.now()+':success',
          isAI: true,
          text: "That's all for now! I hope you found this process insightful 🙏🏼",
          timestamp: new Date().toLocaleTimeString()
        }
        
        setMessages(prev => [...prev, { ...successMessage, text: '' }])
        await typeText(successMessage.text, () => {
          setMessages(prev => [...prev, successMessage])
        })
      } catch (error) {
        console.error('Failed to save final data:', error)
        const errorMessage = {
          id: Date.now()+':error',
          isAI: true,
          text: "⚠️ There was an issue saving your responses, but they're stored locally. Please try again later.",
          timestamp: new Date().toLocaleTimeString()
        }
        
        setMessages(prev => [...prev, { ...errorMessage, text: '' }])
        await typeText(errorMessage.text, () => {
          setMessages(prev => [...prev, errorMessage])
        })
      }
    }
    
    setIsLoading(false)
  }

  const submitOption = async (option) => {
    if (!currentNode || isLoading) return
    const label = option.label || String(option)
    const value = option.value ?? (option.label ?? String(option))

    setIsLoading(true)
    const userMessage = { id: Date.now()+':u', isAI: false, text: label, timestamp: new Date().toLocaleTimeString() }
    const updates = { ...context }
    if (currentNode.tag_as) updates[currentNode.tag_as] = value
    if (currentNode.store_as) updates[currentNode.store_as] = true
    setContext(updates)

    const nextIndex = currentIndex + 1
    const nextNode = flow?.nodes?.[nextIndex]

    // Add user message immediately
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)

    // Persist to server (non-blocking)
    try {
      const session = await upsertSession({ current_index: nextIndex, context: updates })
      if (session) {
        await logEvent({ 
          session_id: session.id, 
          step_key: currentNode.step, 
          payload: updates 
        })
      }
      // Update profile from context
      updateProfileFromContext(updates)
      syncLeadFlowProfile(updates)
    } catch (error) {
      console.warn('[App] Persistence failed', { error: error.message })
    }

    // Submit progress to Supabase
    await submitProgressToSupabase(updates)

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 800))

    // Check if this is the last step
    const isLastStep = !nextNode
    
    let responseText
    try {
      const hasResponseHandling = currentNode.response_handling && currentNode.response_handling[value]
      responseText = hasResponseHandling
        ? currentNode.response_handling[value]
        : (nextNode ? resolvePrompt(nextNode, updates) : 'Flow completed')
    } catch (e) {
      console.warn('Prompt resolve failed (option)', e)
      responseText = nextNode?.prompt || '...'
    }

    // Add AI message with typewriter effect
    const aiMessage = { 
      id: Date.now()+':ai', 
      isAI: true, 
      text: responseText, 
      timestamp: new Date().toLocaleTimeString() 
    }
    
    // Add empty AI message first
    setMessages([...newMessages, { ...aiMessage, text: '' }])
    
    // Type the response
    await typeText(responseText, () => {
      setMessages([...newMessages, aiMessage])
    })
    
    
    if (nextNode) {
      setCurrentIndex(nextIndex)
    }
    
    setIsLoading(false)
  }

  const handleKeyDown = (e) => {
    console.log('[App] handleKeyDown called with key:', e.key)
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('[App] Enter pressed, calling submitFreeText')
      e.preventDefault()
      submitFreeText()
    }
  }

  const handleLoginClick = () => {
    setLoginFeedback('')
    setLoginEmail('')
    setIsLoginModalOpen(true)
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    const emailTrimmed = loginEmail.trim()
    if (!emailTrimmed) {
      setLoginFeedback('Please enter an email address.')
      return
    }
    setIsSendingLoginLink(true)
    try {
      const { error } = await signInWithMagicLink(emailTrimmed)
      if (error) {
        console.warn('[App] Magic link request failed', { error: error.message })
        setLoginFeedback('We could not send the magic link. Please try again.')
      } else {
        setLoginFeedback('Magic link sent! Check your email to access your profile.')
        setLoginEmail('')
      }
    } catch (error) {
      console.warn('[App] Magic link exception', error)
      setLoginFeedback('Something went wrong. Please try again.')
    } finally {
      setIsSendingLoginLink(false)
    }
  }

  const handleLoginClose = () => {
    if (isSendingLoginLink) return
    setIsLoginModalOpen(false)
    setLoginFeedback('')
    setLoginEmail('')
  }


  return (
    <div className="app">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Healing Compass</h1>
            <p>
              {flowMeta.ok ? (
                <>Ready to uncover the patterns that quietly block your ambitions?</>
              ) : (
                <>No flow loaded{flowMeta.error ? ` – ${flowMeta.error}` : ''}</>
              )}
            </p>
          </div>
          {user ? (
            <a 
              href="/me" 
              style={{
                background: 'none',
                border: '1px solid #5e17eb',
                color: '#5e17eb',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              My Profile
            </a>
          ) : (
            <button
              type="button"
              onClick={handleLoginClick}
              disabled={isSendingLoginLink}
              style={{
                background: 'none',
                border: '1px solid #5e17eb',
                color: '#5e17eb',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Log in
            </button>
          )}
        </div>
      </header>

      {!user && isLoginModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '28px',
              width: 'min(420px, 100%)',
              boxShadow: '0 12px 40px rgba(94,23,235,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0' }}>Access your profile</h2>
                <p style={{ margin: 0, color: '#555' }}>Enter your email and we’ll send you a magic link.</p>
              </div>
              <button
                type="button"
                onClick={handleLoginClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  lineHeight: '1',
                  cursor: isSendingLoginLink ? 'not-allowed' : 'pointer',
                  color: '#888'
                }}
                disabled={isSendingLoginLink}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: 500 }}>
                Email address
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d6d3f5',
                    fontSize: '15px'
                  }}
                  disabled={isSendingLoginLink}
                />
              </label>
              {loginFeedback && (
                <div style={{
                  background: loginFeedback.startsWith('Magic link sent') ? '#edf8ef' : '#fff4f4',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: loginFeedback.startsWith('Magic link sent') ? '#215732' : '#9f1b32',
                  fontSize: '14px'
                }}>
                  {loginFeedback}
                </div>
              )}
              <button
                type="submit"
                disabled={isSendingLoginLink}
                style={{
                  background: 'linear-gradient(135deg, #5e17eb, #ffdd27)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: isSendingLoginLink ? 'not-allowed' : 'pointer'
                }}
              >
                {isSendingLoginLink ? 'Sending magic link…' : 'Send magic link'}
              </button>
            </form>
          </div>
        </div>
      )}


      <main className="chat-container">
        <div className="messages">
          {messages.map(m => (
            <div key={m.id} className={`message ${m.isAI ? 'ai' : 'user'}`}>
              <div className="bubble">
                <div className="text">
                  {m.isAI && m.text === '' ? typingMessage : m.text}
                </div>
                <div className="timestamp">{m.timestamp}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai">
              <div className="bubble">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {currentNode && Array.isArray(currentNode.options) && currentNode.options.length > 0 ? (
        <div className="options-container">
          {currentNode.options.map((opt, idx) => (
            <button 
              key={idx} 
              className="option-button" 
              onClick={() => submitOption(opt)}
              disabled={isLoading}
            >
              {opt.label || String(opt)}
            </button>
          ))}
        </div>
      ) : null}

      <footer className="input-bar">
        <textarea
          className="message-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={currentNode?.tag_as === 'user_name' ? 'Type your name…' : 'Share your thoughts...'}
          rows={1}
          disabled={isLoading}
        />
        <button 
          className="send-button" 
          onClick={submitFreeText}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </footer>
    </div>
  )
}

export default App
