# Healing Compass – Project Overview 🌿

## Mission
The Healing Compass is an interactive portal that helps people uncover and heal subconscious blocks ("emotional splinters").
It combines guided chat flows, archetype reveals, and gamified tracking to support long-term transformation.

Our north star: **a playful, trustworthy, and effective digital companion for healing and growth.**

---

## Tech Stack
- **Frontend:** React + Vite (mobile-first, simple components)
- **Hosting:** Vercel (with Preview Deploys enabled)
- **Database & Auth:** Supabase (Postgres + Supabase Auth)
- **Email Automation:** Resend
- **AI Guidance:** OpenAI API (Alfred, Codex flows)
- **Version Control:** GitHub (main = prod, feature branches = preview)

---

## Milestones Roadmap

### **Milestone 1 – Profiles (✅ In Progress)**
- Complete Healing Compass flow.
- Collect user email → send magic link → authenticate via Supabase.
- Auto-create user profile in Supabase.
- Store archetype + flow data in profile.
- `/me` profile page shows name, essence archetype, and protective archetype.
- Resume button → continues Healing Compass flow.

---

### **Milestone 2 – CTA & Resources**
- Downloadable PDF explaining emotional splinters (currently in Canva).
- CTA: express interest in 7-day challenge.

---

### **Milestone 3 – Profile Expansion**
- Guided flow to map what the nervous system feels “safe” with (money, actions, roles).
- Store these limits in profile.
- Let users retest over time and track changes.
- Emotional splinter mapping flow (extend Healing Compass).

---

### **Milestone 4 – Activity Tracking & Gamification**
- Track all healing activities (modalities, reflections).
- Add streaks, points, and badges for engagement.

---

### **Milestone 5 – AI Journal**
- AI companion that summarizes reflections, tracks progress, and offers insights.
- Uses stored profile data and past reflections as context.

---

### **Milestone 6 – Practitioner Matching**
- Connect users to facilitators based on needs and archetypes.

---

### **Milestone 7 – Education Library**
- Curated video and resource library.
- Unlock archetype-specific content as progress milestones.

---

## Development Principles
1. **One milestone at a time** → no skipping ahead.
2. **Small commits, feature branches, preview deploys** → never push straight to main.
3. **Guardrails first** → always read `/docs/CURSOR_RULES.md` and `/docs/ACCEPTANCE_M1.md`.
4. **Manual test steps required** with each PR.
5. **No secrets in repo** → use `.env` and `env.example`.

---

## Current Status
- Building out milestone 1
- Next: test, polish, stabilize, and validate before moving to Milestone 2.

---

## North Star
We’re building a **playful healing ecosystem** that starts with Healing Compass but expands into:
- **Personalized guidance** (archetypes, splinter maps)
- **Gamified growth** (badges, streaks, challenges)
- **Community & practitioners** (shared experiences, matching)

Always: healing should be **fun, trustworthy, and effective**.
