import { Link } from 'react-router-dom'
import { useCategories } from '../../hooks/useCategories'
import * as Icons from 'lucide-react'

/**
 * Displays main categories as a grid of cards.
 * @returns {JSX.Element}
 */
const CategoryGrid = () => {
  const { categories, loading, error } = useCategories()

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-error text-center">Failed to load categories</p>
  }

  const renderIcon = (iconName) => {
    const Icon = Icons[iconName] || Icons.HelpCircle
    return <Icon className="w-8 h-8 text-primary" />
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={`/category/${cat.slug}`}
          className="bg-surface hover:shadow-lg transition p-6 rounded-xl border border-slate-100 flex flex-col items-center text-center"
        >
          <div className="mb-3">{renderIcon(cat.icon)}</div>
          <h3 className="font-semibold text-text">{cat.name}</h3>
        </Link>
      ))}
    </div>
  )
}

export default CategoryGrid