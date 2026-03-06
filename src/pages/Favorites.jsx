// src/pages/Favorites.jsx
import { useFavorites } from '../hooks/useFavorites';
import ListingGrid from '../components/listings/ListingGrid';
import EmptyState from '../components/common/EmptyState';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { favorites, loading, toggleFavorite } = useFavorites();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-200 h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No favorites yet"
        message="When you like an item, tap the heart to save it here."
        action={
          <Link
            to="/"
            className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition active:scale-95"
          >
            Browse Listings
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
      <ListingGrid listings={favorites} loading={false} />
    </div>
  );
};

export default Favorites;