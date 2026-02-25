import { supabase } from './supabaseClient'

const LISTINGS_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/listings`

/**
 * Fetch listings with filters
 * @param {Object} filters - { category, minPrice, maxPrice, location, q, page, limit }
 * @returns {Promise<{data: Array, pagination: Object}>}
 */
export async function getListings(filters = {}) {
  const params = new URLSearchParams(filters)
  const response = await fetch(`${LISTINGS_FUNCTION_URL}?${params}`)
  if (!response.ok) throw new Error('Failed to fetch listings')
  return response.json()
}

/**
 * Fetch a single listing by ID
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getListingById(id) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      profiles (full_name, avatar_url, location, phone_number),
      listing_images (image_url, is_primary)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

/**
 * Create a new listing (authenticated)
 * @param {Object} listingData
 * @returns {Promise<Object>}
 */
export async function createListing(listingData) {
  const { data, error } = await supabase
    .from('listings')
    .insert(listingData)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Update a listing
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateListing(id, updates) {
  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Delete a listing
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteListing(id) {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
  if (error) throw error
}