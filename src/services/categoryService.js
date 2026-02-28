import { supabase } from './supabaseClient'

/**
 * Fetch all categories with optional parent filter
 * @param {number|null} parentId - If null, fetch main categories
 * @returns {Promise<Array>}
 */
export async function getCategories(parentId = null) {
  let query = supabase.from('categories').select('*').order('display_order')
  if (parentId === null) {
    query = query.is('parent_id', null)
  } else {
    query = query.eq('parent_id', parentId)
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

/**
 * Get a single category by slug
 * @param {string} slug
 * @returns {Promise<Object>}
 */
export async function getCategoryBySlug(slug) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}