import { Link } from 'react-router-dom'
import { Menu, X, User } from 'lucide-react'
import { useState } from 'react'

/**
 * Main navigation bar
 * @returns {JSX.Element}
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

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
            <Link to="/post-ad" className="hover:bg-primary-600 px-3 py-2 rounded-md transition">
              Post Ad
            </Link>
            <Link to="/chat" className="hover:bg-primary-600 px-3 py-2 rounded-md transition">
              Chat
            </Link>
            <Link to="/profile" className="hover:bg-primary-600 px-3 py-2 rounded-md transition">
              <User className="w-5 h-5" />
            </Link>
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
          <div className="md:hidden pb-4">
            <Link
              to="/post-ad"
              className="block px-3 py-2 rounded-md hover:bg-primary-600 transition"
              onClick={() => setIsOpen(false)}
            >
              Post Ad
            </Link>
            <Link
              to="/chat"
              className="block px-3 py-2 rounded-md hover:bg-primary-600 transition"
              onClick={() => setIsOpen(false)}
            >
              Chat
            </Link>
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md hover:bg-primary-600 transition"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar