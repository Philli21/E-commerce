import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Custom hook to manage user's favorite listings.
 * @returns {Object} { favorites, loading, toggleFavorite, isFavorited, favoritesCount }
 */
export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([])
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('favorites')
      .select('listing_id, listings(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) {
      console.error(error)
    } else {
      setFavorites(data.map(f => f.listings))
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const toggleFavorite = async (listingId) => {
    if (!user) {
      // Redirect to login or show modal
      window.location.href = '/login'
      return
    }

    // Optimistic update
    const existingIndex = favorites.findIndex(f => f.id === listingId)
    let newFavorites
    if (existingIndex >= 0) {
      newFavorites = favorites.filter((_, i) => i !== existingIndex)
    } else {
      // Add optimistic (we'll fetch full listing later)
      // To keep it simple, we'll just toggle UI and rely on background sync
      const { data: listing } = await supabase
        .from('listings')
        .select('*, listing_images(image_url, is_primary)')
        .eq('id', listingId)
        .single()
      newFavorites = listing ? [listing, ...favorites] : favorites
    }
    setFavorites(newFavorites)

    // Actual DB update
    try {
      if (existingIndex >= 0) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId)
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, listing_id: listingId })
      }
    } catch (error) {
      console.error('Toggle favorite error:', error)
      // Rollback
      setFavorites(favorites)
    }
  }

  const isFavorited = (listingId) => {
    return favorites.some(f => f.id === listingId)
  }

  const favoritesCount = favorites.length

  return { favorites, loading, toggleFavorite, isFavorited, favoritesCount }
}