# Cursor Working Agreement — Healing Compass (Milestone 1+)

## Invariants (NEVER break)
- Do not change flow copy, prompts, or flow logic unless explicitly asked.
- Do not remove localStorage fallback. Server resume (Supabase) augments, never replaces.
- Do not introduce new env vars. Use: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, RESEND_API_KEY.
- Do not add libraries without approval. Current stack: React (Vite), react-router-dom, @supabase/supabase-js.
- Errors must never block the flow: log with `console.warn`, continue.

## File boundaries
- Supabase client: `src/lib/supabaseClient.js`
- Flow persistence helpers: `src/lib/flowPersistence.js`
- Auth UI: `src/AuthGate.jsx`
- Profile bootstrap: `src/hooks/useEnsureProfile.js`
- Main chat: `src/App.jsx` (only surgical edits in submit paths + initial load)
- Profile page: `src/pages/Profile.jsx`
- Routing: `src/main.jsx`
- SPA rewrites: `vercel.json` (respect static files & /api)

## Persistence rules
- On each answer: 
  1) `upsertSession({ flow_slug:'healing-compass', version:1, current_index, context })`
  2) `logEvent({ session_id, flow_slug:'healing-compass', step_key, payload:context })`
- On load (if authed): try `getLastSession()`; if found, hydrate `currentIndex` and `context`. If not, fall back to localStorage → fresh start.

## RLS expectations
- All DB writes/reads scoped to `auth.uid()`.
- Never query rows for other users.

## UX rules
- If unauthenticated: show Magic Link panel (email prompt). After login, render app as-is.
- `/me` shows: display_name, email, essence_archetype, protective_archetype, persona, and a "Continue Healing Compass" CTA if a session exists.

## Coding style
- Small diffs, isolated files, clear names. Async/await. Guard nulls.
- Console warnings only for recoverable failures.

## Commit discipline
- One unit of work per commit. Write what changed and why.
- After each commit, ensure Vercel Preview stays green.

## Definition of Done (for any flow integration)
- Login works (magic link).
- Profile row exists/updates from context.
- `flow_sessions` and `flow_events` populated per step.
- Server resume works; local fallback intact.
- `/me` renders and resume CTA works.

## UX & Routing
- No copy changes to Healing Compass flow.
- New pages must be reachable via a discrete nav link; do not change the chat entry point.
- Mobile-first: test in iPhone 13/14 width; avoid fixed heights; use native scrolling.

## Branching & Commits
- One unit per commit; show file list + manual test steps.
- If change touches `App.jsx`, explain why and which sentinels were respected.

## Dependencies
- Propose first; include bundle size impact from `packagephobia.com`.
- Prefer native/vanilla over adding deps (e.g., no lodash for `get`).

## Supabase
- Use `supabase.auth.getSession()` per call site; do not cache long-lived.
- Guard for null session; fail soft.
- All writes idempotent when possible.

## Testing
- Provide a 5-step manual test script for each PR (login, step submit, reload resume, /me view).
