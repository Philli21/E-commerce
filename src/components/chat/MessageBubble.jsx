// src/components/chat/MessageBubble.jsx
import { memo, useState } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const MessageBubble = ({ message, isOwn }) => {
  const [showTime, setShowTime] = useState(false);
  const { content, created_at, read_at, listing, sender } = message;
  const timeStr = format(new Date(created_at), 'h:mm a');
  const fullDate = format(new Date(created_at), 'PPpp');

  // Determine read receipt state
  let receiptIcon = null;
  if (isOwn) {
    if (read_at) {
      receiptIcon = <CheckCheck className="w-3.5 h-3.5 text-blue-500" />;
    } else {
      // Heuristic: if message is older than 5 seconds, consider it delivered
      const isDelivered = (new Date() - new Date(created_at)) > 5000;
      receiptIcon = isDelivered ? (
        <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
      ) : (
        <Check className="w-3.5 h-3.5 text-gray-400" />
      );
    }
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-1' : 'order-2'}`}>
        {/* Optional listing card */}
        {listing && (
          <Link
            to={`/listing/${listing.id}`}
            className="block mb-1 p-2 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-2">
              {listing.listing_images?.[0] && (
                <img
                  src={listing.listing_images[0].image_url}
                  alt={listing.title}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div>
                <p className="font-medium text-sm line-clamp-1">{listing.title}</p>
                <p className="text-xs text-text-light">View listing</p>
              </div>
            </div>
          </Link>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-2 break-words relative ${
            isOwn
              ? 'bg-indigo-600 text-white rounded-br-none'
              : 'bg-slate-200 text-text rounded-bl-none'
          }`}
          onMouseEnter={() => setShowTime(true)}
          onMouseLeave={() => setShowTime(false)}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>

          {/* Timestamp tooltip */}
          {showTime && (
            <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {fullDate}
            </span>
          )}
        </div>

        {/* Timestamp and read receipt */}
        <div className={`flex items-center gap-1 mt-1 text-xs text-text-light ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{timeStr}</span>
          {receiptIcon && <span>{receiptIcon}</span>}
        </div>
      </div>

      {/* Avatar for other user */}
      {!isOwn && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-2 order-1">
          {sender?.avatar_url ? (
            <img src={sender.avatar_url} alt={sender.full_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-300 flex items-center justify-center text-xs font-bold">
              {sender?.full_name?.charAt(0) || '?'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(MessageBubble);