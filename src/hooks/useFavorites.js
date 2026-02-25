import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabaseClient'

/**
 * Manage user's favorite listings
 * @returns {Object} { favorites, loading, toggleFavorite, isFavorited }
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFavorites = useCallback(async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('listing_id, listings(*)')
      .order('created_at', { ascending: false })
    if (error) {
      console.error(error)
    } else {
      setFavorites(data.map(f => f.listings))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const toggleFavorite = async (listingId) => {
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('listing_id', listingId)
      .single()

    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id)
      setFavorites(prev => prev.filter(l => l.id !== listingId))
    } else {
      await supabase.from('favorites').insert({ listing_id: listingId })
      // Optionally fetch the full listing details
      const { data: newListing } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single()
      setFavorites(prev => [newListing, ...prev])
    }
  }

  const isFavorited = (listingId) => favorites.some(f => f.id === listingId)

  return { favorites, loading, toggleFavorite, isFavorited }
}