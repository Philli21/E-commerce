import { useCategories } from '../../hooks/useCategories'
import * as Icons from 'lucide-react'

const StepCategory = ({ formData, updateForm, onNext }) => {
  const { categories, loading } = useCategories()

  const handleSelect = (catId) => {
    updateForm({ category_id: catId })
    onNext()
  }

  if (loading) return <div className="text-center py-8">Loading categories...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-text mb-6">Choose a category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = Icons[cat.icon] || Icons.HelpCircle
          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`p-6 rounded-xl border-2 transition flex flex-col items-center text-center ${
                formData.category_id === cat.id
                  ? 'border-primary bg-primary-50'
                  : 'border-slate-200 hover:border-primary'
              }`}
            >
              <Icon className="w-8 h-8 text-primary mb-3" />
              <span className="font-medium text-text">{cat.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default StepCategory