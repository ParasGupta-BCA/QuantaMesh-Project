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
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
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
  const [uploading, setUploading] = useState(false);

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
      
      // Cast the data to Message[] properly
      const typedMessages = (data || []).map((m: any) => ({
        ...m,
        sender_type: m.sender_type as 'client' | 'admin'
      })) as Message[];
      
      setMessages(typedMessages);
      
      // Count unread messages from admin
      const unread = typedMessages.filter(
        (m) => m.sender_type === 'admin' && !m.is_read
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  // Send message with optional file
  const sendMessage = async (content: string, file?: File) => {
    if (!user || !conversation) return;

    let fileData: { file_url: string; file_name: string; file_type: string; file_size: number } | null = null;

    // Upload file if provided
    if (file) {
      setUploading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Store the file path instead of public URL - we'll generate signed URLs on demand
        fileData = {
          file_url: fileName, // Store path, not public URL
          file_name: file.name,
          file_type: file.type,
          file_size: file.size
        };
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      } finally {
        setUploading(false);
      }
    }

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        sender_type: 'client',
        content: content || (fileData ? `Shared a file: ${fileData.file_name}` : ''),
        ...(fileData && {
          file_url: fileData.file_url,
          file_name: fileData.file_name,
          file_type: fileData.file_type,
          file_size: fileData.file_size
        })
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
          const newMessage = {
            ...payload.new,
            sender_type: (payload.new as any).sender_type as 'client' | 'admin'
          } as Message;
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
    uploading,
    sendMessage,
    markAsRead,
  };
}
