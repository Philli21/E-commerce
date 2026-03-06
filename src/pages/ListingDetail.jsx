// src/pages/ListingDetail.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getListingById } from '../services/listingService';
import { useAuth } from '../context/AuthContext';
import { MapPin, MessageCircle, Heart, Share2, CheckCircle } from 'lucide-react';
import ImageGallery from '../components/listings/ImageGallery';
import SellerCard from '../components/listings/SellerCard';
import SimilarListings from '../components/listings/SimilarListings';
import { useChat } from '../stores/chatStore';

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { startOrOpenConversation } = useChat();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListingById(id);
        setListing(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleChatClick = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/listing/${id}` } });
      return;
    }
    if (!listing) return;
    const conversationId = await startOrOpenConversation(listing.user_id, listing.id);
    navigate(`/chat?conversation=${conversationId}`);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-error">{error}</div>;
  if (!listing) return <div className="text-center py-8">Listing not found</div>;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <>
      <Helmet>
        <title>{listing.title} | Midnight Bazaar</title>
        <meta name="description" content={listing.description.substring(0, 160)} />
        <meta property="og:title" content={listing.title} />
        <meta property="og:description" content={listing.description} />
        <meta property="og:image" content={listing.listing_images?.[0]?.image_url} />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ImageGallery images={listing.listing_images} />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-text">{listing.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="w-5 h-5 text-text-light" />
                <span className="text-text-light">{listing.location}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-secondary">{formatPrice(listing.price)}</span>
                {listing.price_negotiable && (
                  <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                    Negotiable
                  </span>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <span className="bg-slate-200 text-text px-3 py-1 rounded-full text-sm capitalize">
                  {listing.condition}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleChatClick}
                className="flex-1 bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                Chat with Seller
              </button>
              <button className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition active:scale-95">
                <Heart className="w-5 h-5 text-text-light" />
              </button>
              <button className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition active:scale-95">
                <Share2 className="w-5 h-5 text-text-light" />
              </button>
            </div>

            <SellerCard seller={listing.profiles} />

            <div className="bg-surface p-6 rounded-xl border border-slate-100">
              <h2 className="font-semibold text-text mb-3">Description</h2>
              <p className="text-text-light whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Specifications */}
            {listing.specifications && Object.keys(listing.specifications).length > 0 && (
              <div className="bg-surface p-6 rounded-xl border border-slate-100">
                <h2 className="font-semibold text-text mb-4">Specifications</h2>
                <dl className="grid grid-cols-2 gap-4">
                  {Object.entries(listing.specifications).map(([key, value]) => (
                    <div key={key} className="border-b border-slate-100 pb-2">
                      <dt className="text-sm text-text-light capitalize">{key.replace(/([A-Z])/g, ' $1')}</dt>
                      <dd className="font-medium">{value || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-text mb-6">Similar Listings</h2>
          <SimilarListings categoryId={listing.category_id} currentId={listing.id} />
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Safety Tips
          </h3>
          <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
            <li>Meet in a public place</li>
            <li>Inspect the item before paying</li>
            <li>Use in-app chat for communication</li>
            <li>Never share your financial information</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default ListingDetail;