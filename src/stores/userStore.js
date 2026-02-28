import { create } from 'zustand'
import { supabase } from '../services/supabaseClient'

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} full_name
 * @property {string} avatar_url
 * @property {string} location
 * @property {string} phone_number
 * @property {string} created_at
 */

const useUserStore = create((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  /**
   * Fetch user profile by ID (or current user if no ID)
   * @param {string} [userId]
   */
  fetchProfile: async (userId) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const id = userId || user?.id
      if (!id) throw new Error('No user ID')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      set({ profile: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  /**
   * Update profile
   * @param {Object} updates
   */
  updateProfile: async (updates) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
      if (error) throw error

      // Refresh profile
      await get().fetchProfile(user.id)
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  /**
   * Upload avatar image
   * @param {File} file
   * @returns {Promise<string>} public URL
   */
  uploadAvatar: async (file) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with new avatar URL
      await get().updateProfile({ avatar_url: publicUrl })
      return publicUrl
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  /**
   * Delete user account (with confirmation handled in UI)
   */
  deleteAccount: async () => {
    set({ loading: true, error: null })
    try {
      // This requires admin or service role – better to use Edge Function
      // For now, we'll implement via Edge Function later
      throw new Error('Not implemented – use Edge Function')
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },
}))

export default useUserStore