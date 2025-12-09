import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'client' | 'admin';
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
}

export function useChat() {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch or create conversation for client
  const fetchOrCreateConversation = useCallback(async () => {
    if (!user) return;

    try {
      // Try to get existing conversation
      const { data: existingConv, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingConv) {
        setConversation(existingConv as Conversation);
        return existingConv;
      }

      // Create new conversation if none exists
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          user_email: user.email || '',
          user_name: user.user_metadata?.full_name || null,
        })
        .select()
        .single();

      if (createError) throw createError;
      setConversation(newConv as Conversation);
      return newConv;
    } catch (error) {
      console.error('Error fetching/creating conversation:', error);
    }
  }, [user]);

  // Fetch messages for conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as Message[]) || []);
      
      // Count unread messages from admin
      const unread = (data || []).filter(
        (m: Message) => m.sender_type === 'admin' && !m.is_read
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  // Send message
  const sendMessage = async (content: string) => {
    if (!user || !conversation) return;

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        sender_type: 'client',
        content,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Mark messages as read
  const markAsRead = async () => {
    if (!conversation) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversation.id)
        .eq('sender_type', 'admin')
        .eq('is_read', false);
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Initialize
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const init = async () => {
      setLoading(true);
      const conv = await fetchOrCreateConversation();
      if (conv) {
        await fetchMessages(conv.id);
      }
      setLoading(false);
    };

    init();
  }, [user, fetchOrCreateConversation, fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!conversation) return;

    const channel = supabase
      .channel(`messages-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
          
          if (newMessage.sender_type === 'admin') {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  return {
    conversation,
    messages,
    loading,
    unreadCount,
    sendMessage,
    markAsRead,
  };
}
