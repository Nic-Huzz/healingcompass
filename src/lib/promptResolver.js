import { renderEssenceReveal } from './templates/essenceRevealTemplate'
import { renderProtectiveMirror } from './templates/protectiveMirrorTemplate'

const VAR_PATTERN = /\{\{(\w+)\}\}/g
const MACRO_PATTERN = /\{\{([A-Z_]+)\(([^}]+)\)\}\}/g

export function interpolateVars(text = '', context = {}) {
  if (typeof text !== 'string') return ''
  return text.replace(VAR_PATTERN, (_match, key) => {
    const value = context?.[key]
    return value !== undefined && value !== null && value !== '' ? String(value) : _match
  })
}

function resolveMacros(text = '', context = {}) {
  if (typeof text !== 'string') return ''
  return text.replace(MACRO_PATTERN, (match, macro, argumentRaw) => {
    const key = argumentRaw?.trim()
    if (!key) return match
    const answer = context?.[key]

    switch (macro) {
      case 'ESSENCE_REVEAL':
        return answer ? renderEssenceReveal(answer) : match
      case 'PROTECTIVE_MIRROR':
        return answer ? renderProtectiveMirror(answer) : match
      default:
        return match
    }
  })
}

export function resolvePrompt(step, answers = {}) {
  if (!step?.prompt) return ''
  const withMacros = resolveMacros(step.prompt, answers)
  return interpolateVars(withMacros, answers)
}
