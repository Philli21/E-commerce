import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Existing pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/Register'
import ListingDetail from './pages/ListingDetail'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import CompleteProfile from './pages/auth/CompleteProfile'
import PostAd from './pages/PostAd'
import CategoryPage from './pages/CategoryPage'
import SearchPage from './pages/SearchPage'

// New pages
import MyListings from './pages/MyListings'
import Favorites from './pages/Favorites'
import SellerProfile from './pages/SellerProfile'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route
            path="/post-ad"
            element={
              <ProtectedRoute requireCompleteProfile>
                <PostAd />
              </ProtectedRoute>
            }
          />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route path="/seller/:userId" element={<SellerProfile />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App