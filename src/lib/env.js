export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON: import.meta.env.VITE_SUPABASE_ANON_KEY
}

for (const [k, v] of Object.entries(ENV)) {
  if (!v) console.warn(`[env] Missing ${k} – check Vercel/Vite env`)
}
