import { create } from 'zustand'
import { supabase } from '../services/supabaseClient'

const useListingsStore = create((set, get) => ({
  listings: [],
  loading: false,
  error: null,

  /**
   * Fetch user's listings (optionally by status)
   * @param {string} [status] - 'active', 'sold', 'reserved', 'inactive'
   */
  fetchUserListings: async (status) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let query = supabase
        .from('listings')
        .select(`
          *,
          listing_images (image_url, is_primary)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query
      if (error) throw error
      set({ listings: data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  /**
   * Update listing status
   * @param {string} listingId
   * @param {string} newStatus
   */
  updateListingStatus: async (listingId, newStatus) => {
    // Optimistic update
    const originalListings = get().listings
    set(state => ({
      listings: state.listings.map(l =>
        l.id === listingId ? { ...l, status: newStatus } : l
      )
    }))

    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', listingId)
      if (error) throw error
    } catch (error) {
      // Rollback
      set({ listings: originalListings, error: error.message })
      throw error
    }
  },

  /**
   * Delete listing
   * @param {string} listingId
   */
  deleteListing: async (listingId) => {
    // Optimistic remove
    const originalListings = get().listings
    set(state => ({
      listings: state.listings.filter(l => l.id !== listingId)
    }))

    try {
      // First delete images from storage (optional, but good)
      const { data: images } = await supabase
        .from('listing_images')
        .select('image_url')
        .eq('listing_id', listingId)

      // Delete from database (cascade will remove images)
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
      if (error) throw error

      // Optionally delete files from storage
      if (images?.length) {
        const paths = images.map(img => {
          // Extract path from URL
          const urlParts = img.image_url.split('/')
          return urlParts.slice(-2).join('/') // assumes bucket/folder/filename
        })
        await supabase.storage.from('listing-images').remove(paths)
      }
    } catch (error) {
      set({ listings: originalListings, error: error.message })
      throw error
    }
  },
}))

export default useListingsStore