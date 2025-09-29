# Acceptance — Milestone 1 (Profiles Spine)

## 1) Auth
- When logged out, I see a Magic Link panel.
- Enter email → receive link → return logged in (session persists).

## 2) Profile
- `profiles` row created on first login.
- After archetype steps, profile fields update.

## 3) Persistence
- Each answer writes a `flow_event`.
- `flow_sessions` current_index/context updates per step.

## 4) Resume
- Reload page → resumes at correct step from server.
- If server unavailable, localStorage fallback works.

## 5) /me
- Shows name, email, essence_archetype, protective_archetype, persona.
- "Continue Healing Compass" appears if a session exists.

## 6) No regressions
- Flow copy/logic unchanged.
- Build & Preview pass on Vercel.
