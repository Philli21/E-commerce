import { useState } from 'react'
import { ETHIOPIAN_CITIES } from '../../utils/constants' // define elsewhere

const FilterSidebar = ({ categoryId }) => {
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [location, setLocation] = useState('')
  const [condition, setCondition] = useState('')

  // This component would apply filters via a callback or URL params.
  // For brevity, we'll just render the inputs.

  return (
    <div className="bg-surface p-6 rounded-xl border border-slate-100">
      <h3 className="font-semibold text-text mb-4">Filters</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Price Range (ETB)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-1/2 px-3 py-2 border border-slate-200 rounded-lg"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-1/2 px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          >
            <option value="">All</option>
            {ETHIOPIAN_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default FilterSidebar