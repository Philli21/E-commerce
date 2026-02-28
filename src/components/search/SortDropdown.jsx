const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

/**
 * Dropdown for sorting listings.
 * @param {Object} props
 * @param {Object} props.filters - Current filters
 * @param {Function} props.setFilters - Function to update filters
 * @returns {JSX.Element}
 */
const SortDropdown = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    setFilters({ ...filters, sort: e.target.value })
  }

  return (
    <select
      value={filters.sort || 'created_at_desc'}
      onChange={handleChange}
      className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
    >
      {SORT_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

export default SortDropdown