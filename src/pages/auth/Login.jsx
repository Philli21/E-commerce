import { useAuth } from '../../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useEffect } from 'react'

/**
 * Login page – redirects to home if already authenticated.
 * @returns {JSX.Element}
 */
const Login = () => {
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      // Error is already logged in context; you could show a toast here
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-8 border border-slate-100">
        {/* Ethiopian-inspired illustration (simplified with emoji or icon) */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-2">🛒🇪🇹</div>
          <h1 className="text-3xl font-bold text-text">
            Welcome to <span className="text-primary">Midnight Bazaar</span>
          </h1>
          <p className="text-text-light mt-2">
            Ethiopia's trusted marketplace
          </p>
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-secondary hover:bg-secondary-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-3"
        >
          <LogIn className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="text-sm text-text-light text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}

export default Login