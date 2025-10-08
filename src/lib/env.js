export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://qlwfcfypnoptsocdpxuv.supabase.co',
  SUPABASE_ANON: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Qizrwuj2oqRtuK2tJx7uxg_M7Bb9WZH'
}

// Debug logging
console.log('[ENV DEBUG]', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  RESULT_URL: ENV.SUPABASE_URL,
  RESULT_ANON: ENV.SUPABASE_ANON
})

for (const [k, v] of Object.entries(ENV)) {
  if (!v) console.warn(`[env] Missing ${k} – check Vercel/Vite env`)
}
