// src/components/chat/ConversationList.jsx
import { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const ConversationItem = memo(({ conv, user, onSelect }) => {
  const otherUser = conv.otherParticipant;
  const lastMessage = conv.lastMessage;
  const timeAgo = lastMessage
    ? formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })
    : '';
  const isUnread = lastMessage && lastMessage.sender_id !== user?.id && !lastMessage.read_at;

  return (
    <button
      onClick={() => onSelect(conv)}
      className="w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition flex items-start gap-3"
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {otherUser?.avatar_url ? (
          <img
            src={otherUser.avatar_url}
            alt={otherUser.full_name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold text-xl">
            {otherUser?.full_name?.charAt(0) || '?'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h4 className="font-semibold text-text truncate">
            {otherUser?.full_name || 'Unknown User'}
          </h4>
          {lastMessage && (
            <span className="text-xs text-text-light whitespace-nowrap ml-2">
              {timeAgo}
            </span>
          )}
        </div>
        {conv.listing && (
          <p className="text-xs text-primary truncate mb-1">
            Re: {conv.listing.title}
          </p>
        )}
        {lastMessage ? (
          <p className="text-sm text-text-light truncate">
            {lastMessage.sender_id === user?.id ? 'You: ' : ''}
            {lastMessage.content}
          </p>
        ) : (
          <p className="text-sm text-text-light italic">No messages yet</p>
        )}
      </div>

      {/* Unread badge */}
      {isUnread && (
        <div className="flex-shrink-0">
          <span className="block w-3 h-3 bg-secondary rounded-full"></span>
        </div>
      )}
    </button>
  );
});

const ConversationList = ({ conversations, onSelect }) => {
  const { user } = useAuth();

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-text-light">
        <p>No conversations yet</p>
        <p className="text-sm mt-2">Start by chatting with a seller from a listing</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conv={conv}
          user={user}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default ConversationList;