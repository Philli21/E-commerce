import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

const SearchBar = () => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query)}`)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [query, navigate])

  return (
    <div className="relative hidden md:block w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light w-4 h-4" />
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-9 pr-4 py-2 rounded-md bg-primary-600 placeholder:text-primary-200 text-white focus:outline-none focus:ring-2 focus:ring-white"
      />
    </div>
  )
}

export default SearchBar