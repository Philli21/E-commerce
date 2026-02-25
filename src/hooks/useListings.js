import { useState, useEffect, useCallback } from 'react'
import { getListings } from '../services/listingService'

/**
 * Custom hook for fetching listings with filters
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} { listings, loading, error, pagination, refetch }
 */
export function useListings(initialFilters = {}) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [filters, setFilters] = useState(initialFilters)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getListings(filters)
      setListings(result.data)
      setPagination(result.pagination)
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
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  return { listings, loading, error, pagination, refetch }
}