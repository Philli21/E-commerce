import { X } from 'lucide-react'

/**
 * Displays active filters as removable chips.
 * @param {Object} props
 * @param {Object} props.filters - Current filters
 * @param {Function} props.setFilters - Function to update filters
 * @returns {JSX.Element}
 */
const ActiveFilters = ({ filters, setFilters }) => {
  const removeFilter = (key) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    setFilters(newFilters)
  }

  if (Object.keys(filters).length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.category && (
        <span className="bg-primary-50 text-primary px-3 py-1 rounded-full text-sm flex items-center">
          Category: {filters.category}
          <button onClick={() => removeFilter('category')} className="ml-2">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {filters.minPrice && (
        <span className="bg-primary-50 text-primary px-3 py-1 rounded-full text-sm flex items-center">
          Min: {filters.minPrice} ETB
          <button onClick={() => removeFilter('minPrice')} className="ml-2">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {filters.maxPrice && (
        <span className="bg-primary-50 text-primary px-3 py-1 rounded-full text-sm flex items-center">
          Max: {filters.maxPrice} ETB
          <button onClick={() => removeFilter('maxPrice')} className="ml-2">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {filters.location && (
        <span className="bg-primary-50 text-primary px-3 py-1 rounded-full text-sm flex items-center">
          Location: {filters.location}
          <button onClick={() => removeFilter('location')} className="ml-2">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {/* Add more as needed */}
    </div>
  )
}

export default ActiveFilters