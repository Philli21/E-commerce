import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getListingById } from '../services/listingService'
import { useAuth } from '../context/AuthContext'
import { MapPin, MessageCircle, Heart, Share2, CheckCircle } from 'lucide-react'
import ImageGallery from '../components/listings/ImageGallery'
import SellerCard from '../components/listings/SellerCard'
import SimilarListings from '../components/listings/SimilarListings'

const ListingDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListingById(id)
        setListing(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchListing()
  }, [id])

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-center py-8 text-error">{error}</div>
  if (!listing) return <div className="text-center py-8">Listing not found</div>

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ImageGallery images={listing.listing_images} />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-text">{listing.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-5 h-5 text-text-light" />
              <span className="text-text-light">{listing.location}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-secondary">{formatPrice(listing.price)}</span>
              {listing.price_negotiable && (
                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                  Negotiable
                </span>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <span className="bg-slate-200 text-text px-3 py-1 rounded-full text-sm capitalize">
                {listing.condition}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat with Seller
            </button>
            <button className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
              <Heart className="w-5 h-5 text-text-light" />
            </button>
            <button className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
              <Share2 className="w-5 h-5 text-text-light" />
            </button>
          </div>

          <SellerCard seller={listing.profiles} />

          <div className="bg-surface p-6 rounded-xl border border-slate-100">
            <h2 className="font-semibold text-text mb-3">Description</h2>
            <p className="text-text-light whitespace-pre-line">{listing.description}</p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-text mb-6">Similar Listings</h2>
        <SimilarListings categoryId={listing.category_id} currentId={listing.id} />
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Safety Tips
        </h3>
        <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
          <li>Meet in a public place</li>
          <li>Inspect the item before paying</li>
          <li>Use in-app chat for communication</li>
          <li>Never share your financial information</li>
        </ul>
      </div>
    </div>
  )
}

export default ListingDetail