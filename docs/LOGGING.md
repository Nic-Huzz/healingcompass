# Logging Guidelines — Healing Compass

## Format
- Use `console.warn('[module] message', {context})`
- No spammy logs in tight loops
- Strip PII from logs (emails only for auth steps)

## Examples

### ✅ Good
```javascript
console.warn('[flowPersistence] Session upsert failed', { error: error.message })
console.warn('[auth] Magic link sent', { email: 'user@example.com' })
console.warn('[profile] Update failed', { userId: 'abc123', fields: ['name'] })
```

### ❌ Bad
```javascript
console.log('Processing step...') // Too verbose
console.warn('Error:', user) // Contains full user object with PII
console.warn('Step completed') // No context
```

## Context Guidelines
- Include relevant IDs (session_id, user_id)
- Include error messages (not full error objects)
- Include operation status (success/failure)
- Never log full user objects or sensitive data
