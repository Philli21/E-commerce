import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import useUserStore from '../../stores/userStore'
import { Camera, X, Loader2 } from 'lucide-react'

const ETHIOPIAN_CITIES = [
  'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar',
  'Hawassa', 'Adama', 'Jimma', 'Jijiga', 'Dessie', 'Others'
]

/**
 * Edit profile modal
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Object} props.profile - Current profile data
 */
const EditProfileModal = ({ isOpen, onClose, profile }) => {
  const { updateProfile, uploadAvatar, deleteAccount } = useUserStore()
  const { signOut } = useAuth()
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone_number: profile?.phone_number || '',
    location: profile?.location || '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Upload avatar if changed
      if (avatarFile) {
        await uploadAvatar(avatarFile)
      }

      // Update other fields
      await updateProfile(formData)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return
    setLoading(true)
    try {
      await deleteAccount()
      await signOut()
      // Redirect to home after sign out
      window.location.href = '/'
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <button onClick={onClose} className="text-text-light hover:text-text">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar upload */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-4 border-primary">
                    <Camera className="w-8 h-8 text-text-light" />
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-secondary hover:bg-secondary-600 text-white p-2 rounded-full cursor-pointer transition"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>

            {/* Full name */}
            <div>
              <label className="block font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Phone number */}
            <div>
              <label className="block font-medium mb-1">Phone Number (optional)</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-primary"
                placeholder="+251 91 234 5678"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block font-medium mb-1">Location</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a city</option>
                {ETHIOPIAN_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-error text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </button>
          </form>

          {/* Delete account */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-error hover:underline text-sm"
              >
                Delete account
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-error">Are you sure? This action cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-error text-white px-3 py-1 rounded text-sm hover:bg-error/80"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="border border-slate-200 px-3 py-1 rounded text-sm hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfileModal