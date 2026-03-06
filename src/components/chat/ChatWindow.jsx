// src/components/chat/ChatWindow.jsx
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../stores/chatStore';
import MessageBubble from './MessageBubble';
import { ArrowLeft, Send, MoreVertical, Flag, Ban } from 'lucide-react';

const ChatWindow = memo(({ conversation, onBack }) => {
  const { user } = useAuth();
  const { messages, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const otherUser = conversation?.otherParticipant;

  // Only scroll when new messages are added
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages.length]);

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await sendMessage(newMessage.trim());
    setNewMessage('');
    inputRef.current?.focus();
  }, [newMessage, sendMessage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  }, [handleSend]);

  const toggleMenu = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  const handleReport = useCallback(() => {
    alert('Report conversation (not implemented)');
    setShowMenu(false);
  }, []);

  const handleBlock = useCallback(() => {
    alert('Block user (not implemented)');
    setShowMenu(false);
  }, []);

  if (!conversation) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-1 rounded-full hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            {otherUser?.avatar_url ? (
              <img
                src={otherUser.avatar_url}
                alt={otherUser.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold">
                {otherUser?.full_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{otherUser?.full_name || 'User'}</h3>
            {conversation.listing && (
              <p className="text-xs text-text-light">
                Re: {conversation.listing.title}
              </p>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-slate-100"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-slate-200">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                onClick={handleReport}
              >
                <Flag className="w-4 h-4" /> Report
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 text-error"
                onClick={handleBlock}
              >
                <Ban className="w-4 h-4" /> Block User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sender_id === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows="1"
            className="flex-1 resize-none border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary max-h-32"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary-600 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {/* Safety tip banner */}
        <div className="mt-2 text-xs text-text-light bg-blue-50 p-2 rounded">
          ⚠️ Meet in a public place, inspect item before paying.
        </div>
      </form>
    </div>
  );
});

export default ChatWindow;