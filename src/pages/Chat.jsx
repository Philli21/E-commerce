// src/pages/Chat.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useChat } from '../stores/chatStore';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const conversationIdFromUrl = searchParams.get('conversation');
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    loading,
    fetchConversations,
    setCurrentConversation,
    subscribeToConversations,
  } = useChat();

  const [mobileView, setMobileView] = useState('list');
  const initialFetchDone = useRef(false);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!user || initialFetchDone.current) return;
    initialFetchDone.current = true;

    const initChat = async () => {
      await fetchConversations();
      const unsubscribe = subscribeToConversations(user.id);
      subscriptionRef.current = unsubscribe;
    };

    initChat();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [user, fetchConversations, subscribeToConversations]);

  useEffect(() => {
    if (conversationIdFromUrl && conversations.length > 0) {
      const conv = conversations.find(c => c.id === conversationIdFromUrl);
      if (conv) {
        setCurrentConversation(conv);
        setMobileView('chat');
      }
    }
  }, [conversationIdFromUrl, conversations, setCurrentConversation]);

  const handleSelectConversation = useCallback((conv) => {
    setCurrentConversation(conv);
    setMobileView('chat');
  }, [setCurrentConversation]);

  const handleBack = useCallback(() => {
    setMobileView('list');
  }, []);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Please log in to view messages</h2>
        <a href="/login" className="text-primary underline">Login</a>
      </div>
    );
  }

  if (loading && conversations.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Chat | Midnight Bazaar</title>
      </Helmet>
      <div className="h-[calc(100vh-8rem)] flex overflow-hidden bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Sidebar */}
        <div
          className={`w-full md:w-80 border-r border-slate-200 ${
            mobileView === 'chat' ? 'hidden md:block' : 'block'
          }`}
        >
          <ConversationList
            conversations={conversations}
            onSelect={handleSelectConversation}
          />
        </div>

        {/* Main chat area */}
        <div
          className={`flex-1 flex flex-col ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {currentConversation ? (
            <ChatWindow
              conversation={currentConversation}
              onBack={handleBack}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-light">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Chat;