import { create } from 'zustand'
import { supabase } from '../services/supabaseClient'

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} full_name
 * @property {string} avatar_url
 * @property {string} location
 * @property {string} phone_number
 */

/**
 * @typedef {Object} AuthState
 * @property {import('@supabase/supabase-js').User|null} user
 * @property {Profile|null} profile
 * @property {boolean} loading
 * @property {Function} setUser
 * @property {Function} setProfile
 * @property {Function} setLoading
 * @property {Function} signInWithGoogle
 * @property {Function} signOut
 * @property {Function} fetchProfile
 * @property {Function} updateProfile
 */

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  signInWithGoogle: async () => {
    set({ loading: true })
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      set({ loading: false })
      throw error
    }
  },

  signOut: async () => {
    set({ loading: true })
    const { error } = await supabase.auth.signOut()
    if (error) {
      set({ loading: false })
      throw error
    }
    set({ user: null, profile: null, loading: false })
  },

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error) {
      set({ profile: data })
    }
  },

  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
    if (error) throw error
    // Refresh profile
    await get().fetchProfile(user.id)
  },
}))

// Initialize auth listener (outside React)
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setUser(session?.user ?? null)
  if (session?.user) {
    useAuthStore.getState().fetchProfile(session.user.id)
  }
  useAuthStore.getState().setLoading(false)
})

const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.getState().setUser(session?.user ?? null)
  if (session?.user) {
    useAuthStore.getState().fetchProfile(session.user.id)
  } else {
    useAuthStore.getState().setProfile(null)
  }
  useAuthStore.getState().setLoading(false)
})

export default useAuthStore