import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Edit2, CheckCircle, PauseCircle, Trash2, Loader2 } from 'lucide-react'
import useListingsStore from '../../stores/listingsStore'
import { formatDistanceToNow } from 'date-fns'

const ListingManagementCard = ({ listing }) => {
  const navigate = useNavigate()
  const { updateListingStatus, deleteListing } = useListingsStore()
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const primaryImage = listing.listing_images?.find(img => img.is_primary)?.image_url

  const handleStatusChange = async (newStatus) => {
    if (listing.status === newStatus) return
    setLoading(true)
    try {
      await updateListingStatus(listing.id, newStatus)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteListing(listing.id)
    } catch (error) {
      console.error('Failed to delete listing:', error)
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 0 }).format(price)
  }

  const timeAgo = formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })

  return (
    <div className="bg-surface rounded-lg shadow-sm border border-slate-100 overflow-hidden">
      <Link to={`/listing/${listing.id}`}>
        <div className="h-40 overflow-hidden bg-slate-100">
          {primaryImage ? (
            <img src={primaryImage} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-text-light">No image</div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link to={`/listing/${listing.id}`} className="block">
          <h3 className="font-semibold truncate">{listing.title}</h3>
          <p className="text-secondary font-bold">{formatPrice(listing.price)}</p>
          <p className="text-text-light text-xs mt-1">{timeAgo}</p>
        </Link>

        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
          <button
            onClick={() => navigate(`/edit-listing/${listing.id}`)}
            className="p-1 text-text-light hover:text-primary transition"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {listing.status !== 'sold' && (
            <button
              onClick={() => handleStatusChange('sold')}
              disabled={loading}
              className="p-1 text-text-light hover:text-success transition"
              title="Mark as Sold"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {listing.status !== 'reserved' && (
            <button
              onClick={() => handleStatusChange('reserved')}
              disabled={loading}
              className="p-1 text-text-light hover:text-secondary transition"
              title="Reserve"
            >
              <PauseCircle className="w-4 h-4" />
            </button>
          )}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1 text-text-light hover:text-error transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-error text-xs font-medium"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-text-light text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ListingManagementCard