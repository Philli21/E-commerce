import { useState, useEffect } from 'react'
import { getListingById } from '../services/listingService'

/**
 * Fetch a single listing by ID
 * @param {string} id
 * @returns {Object} { listing, loading, error, refetch }
 */
export function useListing(id) {
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchListing = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getListingById(id)
      setListing(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListing()
  }, [id])

  return { listing, loading, error, refetch: fetchListing }
}