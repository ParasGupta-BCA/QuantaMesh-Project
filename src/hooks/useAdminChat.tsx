import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Message, Conversation } from './useChat';

export interface ConversationWithUnread extends Conversation {
  unread_count: number;
  last_message?: string;
}

export function useAdminChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithUnread[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      const { data: convs, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get unread counts for each conversation
      const convsWithUnread = await Promise.all(
        (convs || []).map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('sender_type', 'client')
            .eq('is_read', false);

          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            unread_count: count || 0,
            last_message: lastMsg?.content || '',
          } as ConversationWithUnread;
        })
      );

      setConversations(convsWithUnread);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as Message[]) || []);

      // Mark client messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'client')
        .eq('is_read', false);

      // Update unread count in conversations list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        )
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  // Send reply
  const sendReply = async (content: string) => {
    if (!user || !selectedConversation) return;

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        sender_type: 'admin',
        content,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending reply:', error);
      throw error;
    }
  };

  // Close conversation
  const closeConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'closed' })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, status: 'closed' as const } : c
        )
      );
    } catch (error) {
      console.error('Error closing conversation:', error);
      throw error;
    }
  };

  // Reopen conversation
  const reopenConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'open' })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, status: 'open' as const } : c
        )
      );
    } catch (error) {
      console.error('Error reopening conversation:', error);
      throw error;
    }
  };

  // Select conversation
  const selectConversation = (conv: Conversation | null) => {
    setSelectedConversation(conv);
    if (conv) {
      fetchMessages(conv.id);
    } else {
      setMessages([]);
    }
  };

  // Initialize
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchConversations();
      setLoading(false);
    };

    init();
  }, [fetchConversations]);

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel('admin-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Update messages if we're viewing this conversation
          if (selectedConversation?.id === newMessage.conversation_id) {
            setMessages((prev) => [...prev, newMessage]);
            
            // Mark as read if from client
            if (newMessage.sender_type === 'client') {
              supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', newMessage.id);
            }
          }

          // Update conversations list
          if (newMessage.sender_type === 'client') {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === newMessage.conversation_id
                  ? {
                      ...c,
                      unread_count:
                        selectedConversation?.id === c.id
                          ? 0
                          : c.unread_count + 1,
                      last_message: newMessage.content,
                    }
                  : c
              )
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, fetchConversations]);

  return {
    conversations,
    selectedConversation,
    messages,
    loading,
    selectConversation,
    sendReply,
    closeConversation,
    reopenConversation,
    refetch: fetchConversations,
  };
}
