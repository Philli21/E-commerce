import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { getCategories } from '../../services/categoryService'

/**
 * Dropdown menu showing categories with subcategories on hover.
 * @returns {JSX.Element}
 */
const CategoryDropdown = () => {
  const [mainCategories, setMainCategories] = useState([])
  const [subcategories, setSubcategories] = useState({})
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      const mains = await getCategories(null)
      setMainCategories(mains)
      const subs = {}
      await Promise.all(
        mains.map(async (main) => {
          const children = await getCategories(main.id)
          subs[main.id] = children
        })
      )
      setSubcategories(subs)
    }
    fetchAll()
  }, [])

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 hover:bg-primary-600 px-3 py-2 rounded-md transition text-white"
      >
        Categories <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-50">
          {mainCategories.map((cat) => (
            <div key={cat.id} className="relative group">
              <Link
                to={`/category/${cat.slug}`}
                className="block px-4 py-2 hover:bg-slate-50 text-text"
                onClick={() => setOpen(false)}
              >
                {cat.name}
              </Link>
              {subcategories[cat.id]?.length > 0 && (
                <div className="absolute left-full top-0 hidden group-hover:block w-48 bg-white shadow-lg rounded-md py-2">
                  {subcategories[cat.id].map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/category/${sub.slug}`}
                      className="block px-4 py-2 hover:bg-slate-50 text-text"
                      onClick={() => setOpen(false)}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryDropdown