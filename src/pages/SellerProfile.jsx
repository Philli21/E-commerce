import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicProfile, getSellerListings, reportSeller } from '../services/userService'
import { MapPin, Calendar, MessageCircle, Flag } from 'lucide-react'
import { format } from 'date-fns'
import ListingGrid from '../components/listings/ListingGrid'

const SellerProfile = () => {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportModalOpen, setReportModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const profileData = await getPublicProfile(userId)
        setProfile(profileData)
        const listingsData = await getSellerListings(userId)
        setListings(listingsData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId])

  const handleReport = async (reason) => {
    try {
      await reportSeller(userId, reason)
      alert('Report submitted. Thank you for helping keep our community safe.')
      setReportModalOpen(false)
    } catch (err) {
      alert('Failed to submit report. Please try again.')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading seller profile...</div>
  }

  if (error || !profile) {
    return <div className="text-center py-12 text-error">Seller not found.</div>
  }

  const memberSince = format(new Date(profile.created_at), 'MMMM yyyy')

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile header */}
      <div className="bg-surface rounded-lg shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div>
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
                {profile.full_name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>
            <div className="flex flex-wrap gap-4 text-text-light">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {profile.location || 'Location not set'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Member since {memberSince}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setReportModalOpen(true)}
              className="border border-slate-200 text-text-light px-4 py-2 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
            >
              <Flag className="w-4 h-4" />
              Report
            </button>
          </div>
        </div>
      </div>

      {/* Seller's listings */}
      <h2 className="text-2xl font-bold mb-4">Active Listings by {profile.full_name}</h2>
      {listings.length === 0 ? (
        <p className="text-text-light">This seller has no active listings.</p>
      ) : (
        <ListingGrid listings={listings} loading={false} />
      )}

      {/* Report modal (simplified) */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Report this seller</h3>
            <p className="text-text-light mb-4">
              Why are you reporting this seller?
            </p>
            <div className="space-y-2 mb-4">
              {['Scam or fraud', 'Inappropriate behavior', 'Fake listings', 'Other'].map(reason => (
                <button
                  key={reason}
                  onClick={() => handleReport(reason)}
                  className="block w-full text-left px-3 py-2 border border-slate-200 rounded hover:bg-slate-50"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={() => setReportModalOpen(false)}
              className="w-full border border-slate-200 py-2 rounded hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerProfile