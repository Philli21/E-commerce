import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getCategoryBySlug } from '../services/categoryService'
import ListingGrid from '../components/listings/ListingGrid'
import FilterSidebar from '../components/search/FilterSidebar'

const CategoryPage = () => {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getCategoryBySlug(slug)
        setCategory(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategory()
  }, [slug])

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!category) return <div className="text-center py-8">Category not found</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text mb-6">{category.name}</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4">
          <FilterSidebar categoryId={category.id} />
        </aside>
        <main className="lg:w-3/4">
          <ListingGrid categoryId={category.id} />
        </main>
      </div>
    </div>
  )
}

export default CategoryPage