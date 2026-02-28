import { useSearchParams } from 'react-router-dom'
import ListingGrid from '../components/listings/ListingGrid'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text mb-2">
        Search results for "{query}"
      </h1>
      <ListingGrid filters={{ q: query }} />
    </div>
  )
}

export default SearchPage