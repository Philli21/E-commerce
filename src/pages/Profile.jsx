// src/pages/Profile.jsx
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../hooks/useListings';
import { MapPin, Calendar, Star, Edit2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import EditProfileModal from '../components/profile/EditProfileModal';
import ListingGrid from '../components/listings/ListingGrid';

const Profile = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('listings');
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { listings, loading: listingsLoading } = useListings({ 
    userId: user?.id, 
    status: 'active' 
  });

  if (loading || !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-text-light">Loading your profile...</p>
      </div>
    );
  }

  const memberSince = format(new Date(profile.created_at), 'MMMM yyyy');
  const activeListingsCount = listings?.length || 0;
  const soldItemsCount = 0;
  const isVerified = profile.phone_number && profile.location && activeListingsCount >= 3;

  return (
    <>
      <Helmet>
        <title>{profile.full_name} | Midnight Bazaar</title>
        <meta name="description" content={`View ${profile.full_name}'s profile on Midnight Bazaar.`} />
      </Helmet>
      <div className="max-w-6xl mx-auto">
        {/* Profile header */}
        <div className="bg-surface rounded-lg shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
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
              <button
                onClick={() => setEditModalOpen(true)}
                className="absolute bottom-0 right-0 bg-secondary text-white p-2 rounded-full hover:bg-secondary-600 transition active:scale-95"
                aria-label="Edit profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                {profile.full_name}
                {isVerified && (
                  <span className="text-blue-500" title="Verified Seller">
                    <CheckCircle className="w-6 h-6" />
                  </span>
                )}
              </h1>
              <div className="flex flex-wrap gap-4 text-text-light">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {profile.location || 'Location not set'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Member since {memberSince}
                </span>
                {isVerified && (
                  <span className="bg-primary-100 text-primary text-xs px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{activeListingsCount}</div>
                <div className="text-text-light text-sm">Active listings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{soldItemsCount}</div>
                <div className="text-text-light text-sm">Sold</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs (rest unchanged) */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('listings')}
              className={`pb-2 px-1 font-medium transition ${
                activeTab === 'listings'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-light hover:text-text'
              }`}
            >
              Listings
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2 px-1 font-medium transition ${
                activeTab === 'reviews'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-light hover:text-text'
              }`}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-2 px-1 font-medium transition ${
                activeTab === 'about'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-light hover:text-text'
              }`}
            >
              About
            </button>
          </nav>
        </div>

        {/* Tab content (unchanged) */}
        {activeTab === 'listings' && (
          <div>
            {listingsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-slate-200 h-64 rounded-lg"></div>
                ))}
              </div>
            ) : listings?.length > 0 ? (
              <ListingGrid listings={listings} loading={false} />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No active listings</h3>
                <p className="text-text-light mb-4">You haven't posted any ads yet.</p>
                <a
                  href="/post-ad"
                  className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition active:scale-95"
                >
                  <Edit2 className="w-4 h-4" />
                  Post an Ad
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="text-center py-12 text-text-light">
            <Star className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
            <p>When buyers interact with you, they can leave reviews.</p>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-surface p-6 rounded-lg border border-slate-100">
            <h3 className="font-semibold mb-2">About {profile.full_name}</h3>
            <p className="text-text-light">This user hasn't added a bio yet.</p>
            <div className="mt-4">
              <h4 className="font-semibold mb-1">Contact</h4>
              <p className="text-text-light">Phone: {profile.phone_number || 'Not provided'}</p>
              <p className="text-text-light">Location: {profile.location || 'Not provided'}</p>
              <p className="text-text-light">Email: {user?.email || 'Not provided'}</p>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          profile={profile}
        />
      </div>
    </>
  );
};

export default Profile;