/* 
HEALING COMPASS — DO NOT CHANGE FLOW COPY/LOGIC HERE.
Allowed edits:
- Import/use flow persistence helpers
- Hydrate from getLastSession()
- Call upsertSession/logEvent in submit paths
*/
import { useState, useRef, useEffect } from 'react'
import './App.css'
import { upsertSession, logEvent, getLastSession } from './lib/flowPersistence'
import { useEnsureProfile } from './hooks/useEnsureProfile'

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingMessage])

  // Variable interpolation function
  const interpolateText = (text, context) => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return context[variable] || match
    })
  }

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
        const nodes = Array.isArray(data?.steps) ? [...data.steps].sort((a,b) => (a.step_order_index||0) - (b.step_order_index||0)) : []
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
              const firstPrompt = interpolateText(first.prompt, serverContext)
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
        const firstPrompt = interpolateText(first.prompt, {})
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
      const response = await fetch('/api/supabase', {
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
      console.error('Failed to save to Supabase:', error)
      throw error
    }
  }

  const sendEmail = async (email, user_name, archetype, protective_archetype) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          user_name, 
          archetype, 
          protective_archetype 
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      console.log('Email sent successfully:', result)
      return result
    } catch (error) {
      console.error('Failed to send email:', error)
      // Don't throw error - email failure shouldn't break the flow
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
      const progressData = {
        session_id: sessionId,
        step: currentNode?.step || 'unknown',
        step_index: currentIndex,
        user_name: updates.user_name || context.user_name || '',
        healing_compass_consent: updates.healing_compass_consent || context.healing_compass_consent || '',
        ambition_gap: updates.ambition_gap || context.ambition_gap || '',
        // Use correct field names from flow.json
        logical_reasons_list: updates.logical_reasons_list || context.logical_reasons_list || '',
        past_parallel_context: updates.past_parallel_context || context.past_parallel_context || '',
        splinter_event_description: updates.splinter_event_description || context.splinter_event_description || '',
        post_event_feeling: updates.post_event_feeling || context.post_event_feeling || '',
        splinter_identity_verdict: updates.splinter_identity_verdict || context.splinter_identity_verdict || '',
        biology_acknowledgement: updates.biology_acknowledgement || context.biology_acknowledgement || '',
        inner_alarm_resources_email: updates.inner_alarm_resources_email || context.inner_alarm_resources_email || '',
        release_resources_email: updates.release_resources_email || context.release_resources_email || '',
        protective_archetype: updates.protective_archetype || context.protective_archetype || '',
        archetype_acknowledgment: updates.archetype_acknowledgment || context.archetype_acknowledgment || '',
        loop_acknowledged: updates.loop_acknowledged || context.loop_acknowledged || '',
        essence_archetype_selection: updates.essence_archetype_selection || context.essence_archetype_selection || '',
        essence_reveal_response: updates.essence_reveal_response || context.essence_reveal_response || '',
        persona_selection: updates.persona_selection || context.persona_selection || '',
        resource_opt_in: updates.resource_opt_in || context.resource_opt_in || '',
        challenge_opt_in: updates.challenge_opt_in || context.challenge_opt_in || '',
        closing_acknowledgement: updates.closing_acknowledgement || context.closing_acknowledgement || '',
        email: updates.email || context.email || '',
        flow_version: flowMeta.version || '1.0.0',
        flow_completed: false
      }
      
      await sendToSupabase(progressData)
    } catch (error) {
      console.error('Failed to save progress:', error)
      // Don't block the flow if progress saving fails
    }
  }

  const submitFreeText = async () => {
    const trimmed = inputText.trim()
    if (!trimmed || !currentNode || isLoading) return

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
    } catch (error) {
      console.warn('[App] Persistence failed', { error: error.message })
    }

    // Submit progress to Supabase
    await submitProgressToSupabase(updates)

    // Send email if this is step 7 (inner alarm resources email)
    if (currentNode.step === 'q7_connect_dots_inner_alarm_opt_in' && trimmed && trimmed.includes('@')) {
      // Send personalized email with archetype resources
      await sendEmail(
        trimmed, // email address
        updates.user_name || context.user_name,
        updates.essence_archetype_selection || context.essence_archetype_selection,
        updates.protective_archetype || context.protective_archetype
      )
    }

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 800))

    // Check if this is the last step
    const isLastStep = !nextNode
    const responseText = currentNode.response_handling && currentNode.response_handling[trimmed] 
      ? currentNode.response_handling[trimmed] 
      : (nextNode ? interpolateText(nextNode.prompt, updates) : "Flow completed")

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
      // Flow completed - send final data to Airtable
      try {
        const finalData = {
          session_id: sessionId,
          step: 'completed',
          user_name: updates.user_name || '',
          healing_compass_consent: updates.healing_compass_consent || '',
          ambition_gap: updates.ambition_gap || '',
          logical_reasons_list: updates.logical_reasons_list || '',
          past_parallel_context: updates.past_parallel_context || '',
          splinter_event_description: updates.splinter_event_description || '',
          post_event_feeling: updates.post_event_feeling || '',
          splinter_identity_verdict: updates.splinter_identity_verdict || '',
          biology_acknowledgement: updates.biology_acknowledgement || '',
          inner_alarm_resources_email: updates.inner_alarm_resources_email || '',
          release_resources_email: updates.release_resources_email || '',
          protective_archetype: updates.protective_archetype || '',
          archetype_acknowledgment: updates.archetype_acknowledgment || '',
          loop_acknowledged: updates.loop_acknowledged || '',
          essence_archetype_selection: updates.essence_archetype_selection || '',
          essence_reveal_response: updates.essence_reveal_response || '',
          persona_selection: updates.persona_selection || '',
          resource_opt_in: updates.resource_opt_in || '',
          challenge_opt_in: updates.challenge_opt_in || '',
          closing_acknowledgement: updates.closing_acknowledgement || '',
          email: updates.email || '',
          flow_version: flowMeta.version || '1.0.0',
          flow_completed: true
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
    } catch (error) {
      console.warn('[App] Persistence failed', { error: error.message })
    }

    // Submit progress to Supabase
    await submitProgressToSupabase(updates)

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 800))

    // Check if this is the last step
    const isLastStep = !nextNode
    
    // Special handling for archetype reveal step (step 10)
    let responseText
    if (currentNode.step === 'q10_essence_archetype_reclaim' && currentNode.response_handling) {
      const selectedArchetype = updates.essence_archetype_selection
      const archetypeData = currentNode.response_handling[selectedArchetype]
      if (archetypeData) {
        // Use the archetype reveal template with archetype-specific data
        const revealTemplate = "You are the **{{essence_archetype_selection}}**.\n\n{{poetic_line}}\n\nYou carry a frequency that others feel — even when they can't name it.\n{{energetic_transmission}}\n\nAt your core, your essence is:\n{{essence}}\n\nYour natural superpower — the way you shift spaces and people is —\n{{superpower}}\n\nLet your path be guided by this deeper truth:\n{{north_star}}\n\nI see a vision for your future. To fulfil it, ask yourself:\n{{poetic_vision}}\n\nWhen you live this truth out loud — not just in theory but in embodiment —\n{{vision_in_action}}\n\n**Does this feel like you?**"
        responseText = interpolateText(revealTemplate, { ...updates, ...archetypeData })
      } else {
        responseText = nextNode ? interpolateText(nextNode.prompt, updates) : "Flow completed"
      }
    } else {
      // Standard response handling
      const hasResponseHandling = currentNode.response_handling && currentNode.response_handling[value]
      responseText = hasResponseHandling 
        ? currentNode.response_handling[value] 
        : (nextNode ? interpolateText(nextNode.prompt, updates) : "Flow completed")
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitFreeText()
    }
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
        </div>
      </header>


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
