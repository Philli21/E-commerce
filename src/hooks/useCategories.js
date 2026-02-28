import { useState, useEffect } from 'react'
import { getCategories } from '../services/categoryService'


export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
    console.log('Fetched categories:', categories) // Debug log
  }, [])

  return { categories, loading, error }
}