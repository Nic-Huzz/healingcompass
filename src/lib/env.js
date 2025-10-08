export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://qlwfcfypnoptsocdpxuv.supabase.co',
  SUPABASE_ANON: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Qizrwuj2oqRtuK2tJx7uxg_M7Bb9WZH'
}

for (const [k, v] of Object.entries(ENV)) {
  if (!v) console.warn(`[env] Missing ${k} – check Vercel/Vite env`)
}
