import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, PlusCircle, Search, Heart } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../hooks/useFavorites'
import CategoryDropdown from './categories/CategoryDropdown'
import SearchBar from './search/SearchBar'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, profile, signOut } = useAuth()
  const { favoritesCount } = useFavorites()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight">
              Midnight Bazaar
            </span>
            <span className="text-secondary text-sm font-medium hidden sm:inline">
              Ethiopian Marketplace
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <CategoryDropdown />
            <SearchBar />
            {/* Search form */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-primary-600 text-white placeholder:text-primary-200 px-4 py-2 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {user ? (
              <>
                <Link
                  to="/post-ad"
                  className="bg-secondary hover:bg-secondary-600 text-white font-semibold px-4 py-2 rounded-md transition flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Free Ad
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 hover:bg-primary-600 px-3 py-2 rounded-md transition"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-8 h-8 rounded-full border-2 border-white"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {profile?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <span className="hidden lg:inline">{profile?.full_name || 'User'}</span>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-text border border-slate-100">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm hover:bg-slate-50"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 inline mr-2" />
                        Profile
                      </Link>
                      <Link
                        to="/my-listings"
                        className="block px-4 py-2 text-sm hover:bg-slate-50"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <PlusCircle className="w-4 h-4 inline mr-2" />
                        My Listings
                      </Link>
                      <Link
                        to="/favorites"
                        className="block px-4 py-2 text-sm hover:bg-slate-50"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Heart className="w-4 h-4 inline mr-2" />
                        Favorites
                        {favoritesCount > 0 && (
                          <span className="ml-2 bg-secondary text-white text-xs px-2 py-0.5 rounded-full">
                            {favoritesCount}
                          </span>
                        )}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-error"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:bg-primary-600 px-3 py-2 rounded-md transition">
                  Login
                </Link>
                <Link
                  to="/post-ad"
                  className="bg-secondary hover:bg-secondary-600 text-white font-semibold px-4 py-2 rounded-md transition"
                >
                  Post Free Ad
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-primary-600 focus:outline-none"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-primary-600 text-white placeholder:text-primary-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {user ? (
              <>
                <Link
                  to="/post-ad"
                  className="block bg-secondary hover:bg-secondary-600 text-white font-semibold px-3 py-2 rounded-md transition"
                  onClick={() => setIsOpen(false)}
                >
                  Post Free Ad
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md hover:bg-primary-600 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/my-listings"
                  className="block px-3 py-2 rounded-md hover:bg-primary-600 transition"
                  onClick={() => setIsOpen(false)}
                >
                  My Listings
                </Link>
                <Link
                  to="/favorites"
                  className="block px-3 py-2 rounded-md hover:bg-primary-600 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Favorites {favoritesCount > 0 && `(${favoritesCount})`}
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-primary-600 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md hover:bg-primary-600 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/post-ad"
                  className="block bg-secondary hover:bg-secondary-600 text-white font-semibold px-3 py-2 rounded-md transition"
                  onClick={() => setIsOpen(false)}
                >
                  Post Free Ad
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar