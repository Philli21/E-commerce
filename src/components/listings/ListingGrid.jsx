import { useState, useEffect } from 'react'
import ListingCard from './ListingCard'
import { getListings } from '../../services/listingService'
import { Loader2 } from 'lucide-react'

const ListingGrid = ({ categoryId, filters = {} }) => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const limit = 12

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      try {
        const { data, pagination } = await getListings({
          ...filters,
          category: categoryId,
          page,
          limit,
        })
        if (page === 1) {
          setListings(data)
        } else {
          setListings(prev => [...prev, ...data])
        }
        setHasMore(page < pagination.pages)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [categoryId, filters, page])

  if (error) {
    return <p className="text-error text-center py-8">Failed to load listings</p>
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {!loading && hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => setPage(p => p + 1)}
            className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg"
          >
            Load More
          </button>
        </div>
      )}

      {!loading && !hasMore && listings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-light text-lg">No listings found</p>
          <p className="text-text-light mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}

export default ListingGrid