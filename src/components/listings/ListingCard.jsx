// src/components/listings/ListingCard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useFavorites } from '../../hooks/useFavorites';

const ListingCard = ({ listing }) => {
  const { isFavorited, toggleFavorite } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [heartPulse, setHeartPulse] = useState(false);

  const images = listing.listing_images || [];
  const mainImage = images.find(img => img.is_primary) || images[0];
  const otherImages = images.filter(img => !img.is_primary);

  useEffect(() => {
    if (!hovering || otherImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % (otherImages.length + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [hovering, otherImages.length]);

  const displayedImage = currentImageIndex === 0
    ? mainImage?.image_url
    : otherImages[currentImageIndex - 1]?.image_url;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const timeAgo = formatDistanceToNow(new Date(listing.created_at), { addSuffix: true });

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    setHeartPulse(true);
    setTimeout(() => setHeartPulse(false), 300);
    toggleFavorite(listing.id);
  };

  return (
    <div
      className="bg-surface rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden border border-slate-100"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        setCurrentImageIndex(0);
      }}
    >
      <Link to={`/listing/${listing.id}`} className="block relative aspect-square">
        {displayedImage ? (
          <img
            src={displayedImage}
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
            <span className="text-text-light">No image</span>
          </div>
        )}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-slate-100 transition active:scale-95"
          aria-label={isFavorited(listing.id) ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorited(listing.id) ? 'fill-error text-error' : 'text-text-light'
            } ${heartPulse ? 'heart-pulse' : ''}`}
          />
        </button>
        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {listing.condition}
        </span>
      </Link>

      <div className="p-4">
        <Link to={`/listing/${listing.id}`}>
          <h3 className="font-semibold text-text line-clamp-2 hover:text-primary">
            {listing.title}
          </h3>
        </Link>
        <p className="text-secondary font-bold text-xl mt-2">{formatPrice(listing.price)}</p>
        <div className="flex items-center justify-between mt-3 text-sm text-text-light">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {listing.location}
          </span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;