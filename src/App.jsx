// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import NotFound from './pages/NotFound';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/Register'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Chat = lazy(() => import('./pages/Chat'));
const CompleteProfile = lazy(() => import('./pages/auth/CompleteProfile'));
const PostAd = lazy(() => import('./pages/PostAd'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const EditListing = lazy(() => import('./pages/EditListing'));
const MyListings = lazy(() => import('./pages/MyListings'));
const Favorites = lazy(() => import('./pages/Favorites'));
const SellerProfile = lazy(() => import('./pages/SellerProfile'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
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
                  path="/edit-listing/:id"
                  element={
                    <ProtectedRoute>
                      <EditListing />
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
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;