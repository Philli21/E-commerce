import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Loader2 } from 'lucide-react'

/**
 * Wrapper for routes that require authentication.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.requireCompleteProfile] - If true, also checks if profile is complete.
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ children, requireCompleteProfile = false }) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!user) {
    // Redirect to login, but save the current location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If profile completion is required and profile is missing required fields
  if (requireCompleteProfile && (!profile?.phone_number || !profile?.location)) {
    return <Navigate to="/complete-profile" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute