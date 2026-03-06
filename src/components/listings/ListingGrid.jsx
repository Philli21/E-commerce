// src/components/listings/ListingGrid.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import ListingCard from './ListingCard';
import { getListings } from '../../services/listingService';
import { AlertCircle } from 'lucide-react';
import SkeletonListingCard from '../common/SkeletonListingCard';
import EmptyState from '../common/EmptyState';

const EMPTY_FILTERS = {};

const ListingGrid = ({ categoryId, filters = EMPTY_FILTERS }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 12;

  // Reset page when filters or category change
  useEffect(() => {
    setPage(1);
  }, [filters, categoryId]);

  // Stable query parameters
  const queryParams = useMemo(
    () => ({
      ...filters,
      category: categoryId,
      page,
      limit,
    }),
    [filters, categoryId, page, limit]
  );

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, pagination } = await getListings(queryParams);
      if (page === 1) {
        setListings(data);
      } else {
        setListings(prev => [...prev, ...data]);
      }
      setHasMore(page < pagination.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [queryParams, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleRetry = () => fetchListings();
  const handleLoadMore = () => setPage(p => p + 1);

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error mb-4">Failed to load listings: {error}</p>
        <button
          onClick={handleRetry}
          className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition active:scale-95"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonListingCard key={i} />
          ))}
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <EmptyState
          title="No listings found"
          message="Try adjusting your filters or check back later."
        />
      )}

      {!loading && hasMore && listings.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition active:scale-95"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default ListingGrid;