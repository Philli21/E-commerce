import { useFavorites } from '../hooks/useFavorites'
import ListingGrid from '../components/listings/ListingGrid'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

const Favorites = () => {
  const { favorites, loading, toggleFavorite } = useFavorites()

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-200 h-64 rounded-lg"></div>
        ))}
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 mx-auto text-text-light mb-4" />
        <h1 className="text-3xl font-bold mb-2">No favorites yet</h1>
        <p className="text-text-light mb-6">
          When you like an item, tap the heart to save it here.
        </p>
        <Link
          to="/"
          className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
        >
          Browse Listings
        </Link>
      </div>
    )
  }

  // Add a remove button on each card? Could modify ListingCard to accept an onRemoveFavorite prop.
  // For simplicity, we'll rely on the heart toggle inside each card (already does optimistic update).
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
      <ListingGrid listings={favorites} loading={false} />
    </div>
  )
}

export default Favorites