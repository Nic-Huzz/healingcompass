Milestone 1 – Auth Refactor Plan

Goal

Allow any visitor to access the Healing Compass flow immediately. If authenticated, show a “My Profile” button. If not authenticated, still allow full flow completion. When they enter their email (step with tag_as: email), trigger a Supabase magic link auth and connect their flow data to a profile.

⸻

Implementation Steps

Step 1: Create Auth Provider
	•	File: src/auth/AuthProvider.jsx
	•	Wraps Supabase auth context
	•	Exposes: { user, signInWithMagicLink, signOut }
	•	Uses supabase.auth.onAuthStateChange

Step 2: Update main.jsx
	•	Wrap <App /> with <AuthProvider>
	•	Add /me route → Profile page

Step 3: Update App.jsx
	•	Behavior:
	•	If user exists → show “My Profile” button in header
	•	If no user → flow runs normally
	•	On the step where email is collected:
	•	Call signInWithMagicLink(email)
	•	Save email + continue flow

Step 4: Profile Page
	•	File: src/pages/Profile.jsx
	•	Displays:
	•	Name
	•	Protective archetype
	•	Essence archetype
	•	Button: “Continue Healing Compass” → resumes last session

⸻

Acceptance Tests
	1.	Unauthenticated User:
	•	Visit / → Flow loads immediately.
	•	Enter answers until email step → get magic link.
	•	Open link → authenticated, profile created.
	2.	Authenticated User:
	•	Visit / → Flow loads + “My Profile” visible.
	•	Click → goes to /me with profile data.
	3.	Profile Data:
	•	Ensure protective & essence archetypes are pulled from Supabase.
	4.	Resume Session:
	•	From /me click “Continue Healing Compass” → resumes last session.

⸻

Guardrails
	•	Do not block flow access behind auth.
	•	Keep localStorage fallback.
	•	Commit boundaries: one step per commit.
	•	Respect ./docs/CURSOR_RULES.md and ./docs/ACCEPTANCE_M1.md.

⸻

Commit Plan
	•	Commit 1: Add AuthProvider.jsx
	•	Commit 2: Wrap App with provider, add /me route
	•	Commit 3: Update App.jsx for email-triggered magic link + profile button
	•	Commit 4: Create Profile page with resume CTA

⸻

✅ When these are done: Milestone 1 complete.