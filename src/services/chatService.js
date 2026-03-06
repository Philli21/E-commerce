// src/services/chatService.js
import { supabase } from './supabaseClient';

/**
 * Fetch all conversations for the current user, with last message and other participant.
 */
export async function fetchUserConversations(userId) {
  try {
    // 1. Get conversation IDs where user is participant
    const { data: participants, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (partError) throw partError;
    if (!participants || participants.length === 0) return [];

    const conversationIds = participants.map(p => p.conversation_id);

    // 2. Fetch conversations (basic data)
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id, listing_id, created_at, updated_at, last_message_id')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false });

    if (convError) throw convError;

    // 3. Enrich each conversation
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        // 3a. Fetch listing details
        let listing = null;
        if (conv.listing_id) {
          const { data: listingData, error: listingError } = await supabase
            .from('listings')
            .select('id, title, listing_images (image_url, is_primary)')
            .eq('id', conv.listing_id)
            .single();
          if (!listingError) listing = listingData;
        }

        // 3b. Fetch last message
        let lastMessage = null;
        if (conv.last_message_id) {
          const { data: msg, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('id', conv.last_message_id)
            .single();
          if (!msgError) lastMessage = msg;
        }

        // 3c. Fetch participants of this conversation
        const { data: partData, error: partFetchError } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.id);

        if (partFetchError) throw partFetchError;

        // 3d. Fetch profiles for each participant
        const participantIds = partData.map(p => p.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', participantIds);

        if (profilesError) throw profilesError;

        // Build participants array
        const participantsWithProfiles = profiles.map(profile => ({
          user: profile
        }));

        // Find the other participant
        const otherParticipant = profiles.find(p => p.id !== userId) || null;

        return {
          ...conv,
          listing,
          lastMessage,
          participants: participantsWithProfiles,
          otherParticipant,
        };
      })
    );

    return enriched;
  } catch (error) {
    console.error('fetchUserConversations failed:', error);
    throw error;
  }
}

/**
 * Get or create a conversation between current user and another user for a listing.
 */
export async function getOrCreateConversationSimple(currentUserId, otherUserId, listingId) {
  // Step 1: Get all conversation IDs where current user is a participant
  const { data: userConvs, error: userConvError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', currentUserId);

  if (userConvError) throw userConvError;

  if (!userConvs || userConvs.length === 0) {
    // No conversations at all, create new one
    return await createNewConversation(currentUserId, otherUserId, listingId);
  }

  const conversationIds = userConvs.map(c => c.conversation_id);

  // Step 2: Check which of these conversations also have the other user
  const { data: sharedConvs, error: sharedError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', otherUserId)
    .in('conversation_id', conversationIds);

  if (sharedError) throw sharedError;

  if (sharedConvs && sharedConvs.length > 0) {
    // Verify that the conversation is for this listing
    const conversationId = sharedConvs[0].conversation_id;
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('listing_id')
      .eq('id', conversationId)
      .single();

    if (!convError && conv.listing_id === listingId) {
      return conversationId;
    }
  }

  // No matching conversation found, create new one
  return await createNewConversation(currentUserId, otherUserId, listingId);
}

// Helper function to create a new conversation
async function createNewConversation(currentUserId, otherUserId, listingId) {
  // Create the conversation
  const { data: newConv, error: convError } = await supabase
    .from('conversations')
    .insert({
      listing_id: listingId,
      created_by: currentUserId
    })
    .select()
    .single();

  if (convError) {
    console.error('Error creating conversation:', convError);
    throw convError;
  }

  // Add both participants
  const participants = [
    { conversation_id: newConv.id, user_id: currentUserId },
    { conversation_id: newConv.id, user_id: otherUserId },
  ];

  const { error: partError } = await supabase
    .from('conversation_participants')
    .insert(participants);

  if (partError) {
    console.error('Error adding participants:', partError);
    // Clean up the conversation if participant insertion fails
    await supabase.from('conversations').delete().eq('id', newConv.id);
    throw partError;
  }

  return newConv.id;
}

/**
 * Fetch messages for a conversation, with optional limit and offset.
 */
export async function fetchMessages(conversationId, limit = 50, before = null) {
  try {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error } = await query;
    if (error) throw error;

    // For each message, fetch sender profile
    const messagesWithSender = await Promise.all(
      messages.map(async (msg) => {
        const { data: sender, error: senderError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', msg.sender_id)
          .single();

        if (senderError) {
          console.warn('Could not fetch sender for message', msg.id, senderError);
        }

        // Also fetch listing reference if any
        let listing = null;
        if (msg.listing_reference_id) {
          const { data: listingData, error: listingError } = await supabase
            .from('listings')
            .select('id, title, listing_images (image_url, is_primary)')
            .eq('id', msg.listing_reference_id)
            .single();
          if (!listingError) listing = listingData;
        }

        return {
          ...msg,
          sender: sender || null,
          listing,
        };
      })
    );

    // Return in chronological order
    return messagesWithSender.reverse();
  } catch (error) {
    console.error('fetchMessages failed:', error);
    throw error;
  }
}

/**
 * Send a new message.
 */
export async function sendMessage(conversationId, senderId, content, listingReferenceId = null) {
  // Insert the message
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      listing_reference_id: listingReferenceId,
    })
    .select()
    .single();

  if (error) throw error;

  // Fetch sender profile
  const { data: sender, error: senderError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', senderId)
    .single();

  if (senderError) {
    console.warn('Could not fetch sender for new message', senderError);
  }

  // Update conversation's updated_at and last_message_id
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString(), last_message_id: message.id })
    .eq('id', conversationId);

  return {
    ...message,
    sender: sender || null,
    listing: null,
  };
}

/**
 * Mark messages as read (update read_at for messages where user is not sender).
 */
export async function markMessagesAsRead(conversationId, userId) {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .is('read_at', null);

  if (error) throw error;
}