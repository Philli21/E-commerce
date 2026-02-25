import { supabase } from './supabaseClient'

/**
 * Fetch all categories
 * @returns {Promise<Array>}
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order')
  if (error) throw error
  return data
}