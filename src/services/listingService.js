import { supabase } from './supabaseClient'

/**
 * Fetch listings with filters
 * @param {Object} filters - { category, minPrice, maxPrice, location, q, page, limit }
 * @returns {Promise<{data: Array, pagination: Object}>}
 */
export async function getListings(filters = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    location,
    q,
    page = 1,
    limit = 20,
  } = filters

  let query = supabase
    .from('listings')
    .select(`
      *,
      profiles (full_name, avatar_url, location),
      listing_images (image_url, is_primary)
    `, { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (category) query = query.eq('category_id', category)
  if (minPrice) query = query.gte('price', parseFloat(minPrice))
  if (maxPrice) query = query.lte('price', parseFloat(maxPrice))
  if (location) query = query.ilike('location', `%${location}%`)
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)

  const { data, error, count } = await query
  if (error) throw error

  return {
    data,
    pagination: {
      page: +page,
      limit,
      total: count,
      pages: Math.ceil(count / limit),
    },
  }
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
      profiles (full_name, avatar_url, location, phone_number, created_at),
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
export async function createListing(listingData, userId) {
  // Insert listing
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .insert({
      user_id: userId,
      category_id: listingData.category_id,
      title: listingData.title,
      description: listingData.description,
      price: parseFloat(listingData.price),
      price_negotiable: listingData.price_negotiable,
      condition: listingData.condition,
      location: listingData.location,
    })
    .select()
    .single()

  if (listingError) throw listingError

  // Upload images
  const imagePromises = listingData.images.map(async (file, index) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${listing.id}/${index}-${Date.now()}.${fileExt}`
    const filePath = `listings/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filePath)

    return {
      listing_id: listing.id,
      image_url: urlData.publicUrl,
      is_primary: index === 0,
      display_order: index,
    }
  })

  const imageRecords = await Promise.all(imagePromises)

  const { error: imagesError } = await supabase
    .from('listing_images')
    .insert(imageRecords)

  if (imagesError) throw imagesError

  return listing.id
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
 * Delete a listing (and its images from storage)
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteListing(id) {
  // First get images to delete from storage
  const { data: images } = await supabase
    .from('listing_images')
    .select('image_url')
    .eq('listing_id', id)

  // Delete listing (cascade will remove images rows)
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
  if (error) throw error

  // Delete files from storage
  if (images?.length) {
    const paths = images.map(img => {
      const urlParts = img.image_url.split('/')
      return urlParts.slice(-2).join('/') // adjust based on your path
    })
    await supabase.storage.from('listing-images').remove(paths)
  }
}