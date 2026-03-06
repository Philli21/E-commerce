// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'sb-midnightbazaar-auth-token',
    // Increase lock timeout (milliseconds) – default is 10000
    lockTimeout: 20000, // 20 seconds
    // Optional: disable multi‑tab sync if you don't need it
    // storage: localStorage, // default
    // debug: true, // enable for debugging
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})