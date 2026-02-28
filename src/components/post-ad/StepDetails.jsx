import { useState } from 'react'
import { MapPin, DollarSign } from 'lucide-react'

const ETHIOPIAN_CITIES = [
  'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar',
  'Hawassa', 'Adama', 'Jimma', 'Jijiga', 'Dessie', 'Others'
]

const StepDetails = ({ formData, updateForm, onNext, onBack }) => {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.location) newErrors.location = 'Location is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onNext()
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-text mb-6">Listing Details</h2>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateForm({ title: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="e.g., 2022 Toyota Corolla"
          />
          {errors.title && <p className="text-error text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            rows="4"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Describe your item in detail..."
          />
          {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text mb-1">Price (ETB)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light w-5 h-5" />
              <input
                type="number"
                value={formData.price}
                onChange={(e) => updateForm({ price: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="1250000"
              />
            </div>
            {errors.price && <p className="text-error text-sm mt-1">{errors.price}</p>}
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.price_negotiable}
                onChange={(e) => updateForm({ price_negotiable: e.target.checked })}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-text">Price negotiable</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Condition</label>
          <div className="flex gap-4">
            {['new', 'used', 'refurbished'].map((cond) => (
              <label key={cond} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="condition"
                  value={cond}
                  checked={formData.condition === cond}
                  onChange={(e) => updateForm({ condition: e.target.value })}
                  className="text-primary focus:ring-primary"
                />
                <span className="capitalize">{cond}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light w-5 h-5" />
            <select
              value={formData.location}
              onChange={(e) => updateForm({ location: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary appearance-none bg-white"
            >
              <option value="">Select a city</option>
              {ETHIOPIAN_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          {errors.location && <p className="text-error text-sm mt-1">{errors.location}</p>}
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg"
          >
            Next: Images
          </button>
        </div>
      </div>
    </div>
  )
}

export default StepDetails