import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'

// Page components (to be created)
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import PostAd from './pages/PostAd'
import ListingDetail from './pages/ListingDetail'
import Profile from './pages/Profile'
import Chat from './pages/Chat'

/**
 * Main application with routing
 * @returns {JSX.Element}
 */
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post-ad" element={<PostAd />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App