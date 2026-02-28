import { supabase } from './supabaseClient'

/**
 * Get public profile by user ID
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function getPublicProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, location, created_at')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

/**
 * Get seller's active listings
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getSellerListings(userId) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      listing_images (image_url, is_primary)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/**
 * Report a seller (placeholder)
 * @param {string} sellerId
 * @param {string} reason
 */
export async function reportSeller(sellerId, reason) {
  // This would typically insert into a reports table
  console.log('Report seller:', sellerId, reason)
  // For now, just log
  return { success: true }
}