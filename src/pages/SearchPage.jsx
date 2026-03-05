import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';          // ← add this import
import ListingGrid from '../components/listings/ListingGrid';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // Memoize filters object – only recreates when query changes
  const filters = useMemo(() => ({ q: query }), [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text mb-2">
        Search results for "{query}"
      </h1>
      <ListingGrid filters={filters} />
    </div>
  );
};

export default SearchPage;