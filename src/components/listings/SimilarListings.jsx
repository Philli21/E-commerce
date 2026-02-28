import { useState, useEffect } from 'react'
import { getListings } from '../../services/listingService'
import ListingCard from './ListingCard'
import { Loader2 } from 'lucide-react'

const SimilarListings = ({ categoryId, currentId }) => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSimilar = async () => {
      const { data } = await getListings({ category: categoryId, limit: 4 })
      setListings(data.filter(l => l.id !== currentId))
      setLoading(false)
    }
    fetchSimilar()
  }, [categoryId, currentId])

  if (loading) return <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
  if (listings.length === 0) return <p className="text-text-light">No similar listings</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}

export default SimilarListings