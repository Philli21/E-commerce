import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Hero section with search bar and CTA
 * @returns {JSX.Element}
 */
const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results page (to be implemented later)
      console.log('Searching for:', searchQuery)
    }
  }

  return (
    <section className="bg-gradient-to-br from-primary-50 to-background py-16 md:py-24 rounded-2xl">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-text mb-4">
          Discover & Sell in{' '}
          <span className="text-secondary">Ethiopia's Marketplace</span>
        </h1>
        <p className="text-lg text-text-light mb-8">
          Find everything from traditional crafts to modern gadgets – all in one place.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
            <input
              type="text"
              placeholder="Search for items, services, or sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="bg-secondary hover:bg-secondary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Search
          </button>
        </form>

        {/* CTA Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/post-ad')}
            className="bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Start Selling
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero