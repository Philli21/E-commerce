// src/pages/MyListings.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useListingsStore from '../stores/listingsStore';
import ListingManagementCard from '../components/listings/ListingManagementCard';
import EmptyState from '../components/common/EmptyState';
import { PlusCircle } from 'lucide-react';

const STATUS_TABS = [
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'inactive', label: 'Drafts' },
];

const MyListings = () => {
  const [activeTab, setActiveTab] = useState('active');
  const { listings, fetchUserListings, loading } = useListingsStore();

  useEffect(() => {
    fetchUserListings(activeTab);
  }, [activeTab, fetchUserListings]);

  const filteredListings = listings.filter(l => l.status === activeTab);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link
          to="/post-ad"
          className="bg-secondary hover:bg-secondary-600 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2 active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          Post New Ad
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex gap-6">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-2 px-1 font-medium transition ${
                activeTab === tab.value
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-light hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-200 h-64 rounded-lg"></div>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <EmptyState
          icon={PlusCircle}
          title={`No ${activeTab} listings`}
          message={
            activeTab === 'active' ? "You haven't posted any active ads yet." :
            activeTab === 'sold' ? "You haven't sold any items yet." :
            activeTab === 'reserved' ? "You don't have any reserved items." :
            "You don't have any drafts."
          }
          action={
            <Link
              to="/post-ad"
              className="bg-primary hover:bg-primary-600 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              Post an Ad
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map(listing => (
            <ListingManagementCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;