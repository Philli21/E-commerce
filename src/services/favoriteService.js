import { supabase } from './supabaseClient'

/**
 * Add a listing to favorites
 * @param {string} listingId
 * @returns {Promise<Object>}
 */
export async function addFavorite(listingId) {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ listing_id: listingId })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Remove a listing from favorites
 * @param {string} listingId
 * @returns {Promise<void>}
 */
export async function removeFavorite(listingId) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('listing_id', listingId)
  if (error) throw error
}

/**
 * Check if a listing is favorited by current user
 * @param {string} listingId
 * @returns {Promise<boolean>}
 */
export async function isFavorite(listingId) {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('listing_id', listingId)
    .single()
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return !!data
}