import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabaseClient'

/**
 * Custom hook for fetching listings with filters.
 * @param {Object} initialFilters - Filter parameters
 * @returns {Object} { listings, loading, error, pagination, refetch }
 */
export function useListings(initialFilters = {}) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [filters, setFilters] = useState(initialFilters)

  const buildQuery = () => {
    let query = supabase
      .from('listings')
      .select(`
        *,
        listing_images (image_url, is_primary)
      `, { count: 'exact' })
      .eq('status', 'active')

    if (filters.category) {
      query = query.eq('category_id', filters.category)
    }
    if (filters.minPrice) {
      query = query.gte('price', parseFloat(filters.minPrice))
    }
    if (filters.maxPrice) {
      query = query.lte('price', parseFloat(filters.maxPrice))
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    if (filters.condition && filters.condition.length) {
      query = query.in('condition', filters.condition)
    }
    if (filters.q) {
      query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`)
    }

    // Sorting
    const sortMap = {
      created_at_desc: { column: 'created_at', ascending: false },
      price_asc: { column: 'price', ascending: true },
      price_desc: { column: 'price', ascending: false },
    }
    const sort = sortMap[filters.sort] || sortMap.created_at_desc
    query = query.order(sort.column, { ascending: sort.ascending })

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 20
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    return { query, page, limit }
  }

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const { query, page, limit } = buildQuery()
      const { data, error, count } = await query
      if (error) throw error

      setListings(data || [])
      setPagination({
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      })
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const refetch = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })) // reset to first page
  }

  return { listings, loading, error, pagination, refetch }
}