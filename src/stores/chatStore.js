// src/stores/chatStore.js
import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import * as chatService from '../services/chatService';

export const useChat = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  unreadCount: 0,

  fetchConversations: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    set({ loading: true });
    try {
      const conversations = await chatService.fetchUserConversations(user.id);
      set({ conversations, loading: false });
      await get().updateUnreadCount();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateUnreadCount: async () => {
    const { conversations } = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const count = conversations.filter(conv => {
      const lastMsg = conv.lastMessage;
      return lastMsg && lastMsg.sender_id !== user.id && !lastMsg.read_at;
    }).length;
    set({ unreadCount: count });
  },

  setCurrentConversation: async (conversation) => {
    set({ currentConversation: conversation, messages: [] });
    await get().loadMessages(conversation.id);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await chatService.markMessagesAsRead(conversation.id, user.id);
      set(state => ({
        conversations: state.conversations.map(c =>
          c.id === conversation.id && c.lastMessage
            ? { ...c, lastMessage: { ...c.lastMessage, read_at: new Date().toISOString() } }
            : c
        ),
      }));
      await get().updateUnreadCount();
    }
  },

  loadMessages: async (conversationId, before = null) => {
    set({ loading: true });
    try {
      const newMessages = await chatService.fetchMessages(conversationId, 50, before);
      set(state => ({
        messages: before ? [...newMessages, ...state.messages] : newMessages,
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  sendMessage: async (content, listingReferenceId = null) => {
    const { currentConversation, messages } = get();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !currentConversation) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      conversation_id: currentConversation.id,
      sender_id: user.id,
      content,
      listing_reference_id: listingReferenceId,
      created_at: new Date().toISOString(),
      read_at: null,
      sender: {
        id: user.id,
        full_name: user.user_metadata?.full_name || 'You',
        avatar_url: user.user_metadata?.avatar_url,
      },
      listing: null,
    };

    set({ messages: [...messages, optimisticMessage] });

    try {
      const sentMessage = await chatService.sendMessage(
        currentConversation.id,
        user.id,
        content,
        listingReferenceId
      );

      set(state => ({
        messages: state.messages.map(m => m.id === tempId ? sentMessage : m),
        conversations: state.conversations.map(c =>
          c.id === currentConversation.id
            ? { ...c, lastMessage: sentMessage, updated_at: sentMessage.created_at }
            : c
        ),
      }));

      await get().updateUnreadCount();
    } catch (error) {
      set(state => ({
        messages: state.messages.filter(m => m.id !== tempId),
        error: error.message,
      }));
    }
  },

  startOrOpenConversation: async (otherUserId, listingId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const conversationId = await chatService.getOrCreateConversationSimple(
      user.id,
      otherUserId,
      listingId
    );

    await get().fetchConversations();

    const conversation = get().conversations.find(c => c.id === conversationId);
    if (conversation) {
      await get().setCurrentConversation(conversation);
    }

    return conversationId;
  },

  subscribeToConversations: (userId) => {
    if (!userId) return () => {};

    const messageSubscription = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=in.(${get().conversations.map(c => c.id).join(',')})`,
        },
        async (payload) => {
          const newMessage = payload.new;

          if (newMessage.sender_id === userId) {
            return;
          }

          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();
          newMessage.sender = sender;

          set(state => {
            const isCurrentConversation = state.currentConversation?.id === newMessage.conversation_id;
            return {
              messages: isCurrentConversation ? [...state.messages, newMessage] : state.messages,
              conversations: state.conversations.map(c =>
                c.id === newMessage.conversation_id
                  ? { ...c, lastMessage: newMessage, updated_at: newMessage.created_at }
                  : c
              ),
            };
          });

          await chatService.markMessagesAsRead(newMessage.conversation_id, userId);
          await get().updateUnreadCount();
        }
      )
      .subscribe();

    const convSubscription = supabase
      .channel('public:conversation_participants')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          await get().fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
      supabase.removeChannel(convSubscription);
    };
  },
}));