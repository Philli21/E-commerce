import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2, MapPin, Phone, Camera } from 'lucide-react'
import { supabase } from '../../services/supabaseClient'

// Ethiopian cities (as defined in the database schema)
const ETHIOPIAN_CITIES = [
  'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar',
  'Hawassa', 'Adama', 'Jimma', 'Jijiga', 'Dessie', 'Others'
]

/**
 * Page for new users to complete their profile after first Google sign-in.
 * @returns {JSX.Element}
 */
const CompleteProfile = () => {
  const { user, profile, updateProfile, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [phoneNumber, setPhoneNumber] = useState('')
  const [city, setCity] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // If profile already has required fields, redirect
  if (!loading && profile?.phone_number && profile?.location) {
    navigate(from, { replace: true })
    return null
  }

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

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null

    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile)

    if (uploadError) {
      throw new Error('Avatar upload failed')
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      let avatarUrl = profile?.avatar_url
      if (avatarFile) {
        avatarUrl = await uploadAvatar()
      }

      await updateProfile({
        phone_number: phoneNumber,
        location: city,
        avatar_url: avatarUrl,
      })

      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-8 border border-slate-100">
        <h1 className="text-2xl font-bold text-text mb-6">Complete Your Profile</h1>
        <p className="text-text-light mb-6">
          Just a few more details to personalize your experience.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar upload */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                />
              ) : profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Current avatar"
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
            <p className="text-xs text-text-light">Click the camera to change photo</p>
          </div>

          {/* Phone number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text mb-1">
              Phone Number <span className="text-text-light">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+251 91 234 5678"
              />
            </div>
          </div>

          {/* City dropdown */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-text mb-1">
              Location <span className="text-error">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light w-5 h-5" />
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white"
              >
                <option value="">Select a city</option>
                {ETHIOPIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CompleteProfile