import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import {
  MessageCircle,
  Send,
  Loader2,
  User,
  Mail,
  X,
  Check,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminChat, ConversationWithUnread } from '@/hooks/useAdminChat';
import { useToast } from '@/hooks/use-toast';

export function AdminChatPanel() {
  const {
    conversations,
    selectedConversation,
    messages,
    loading,
    selectConversation,
    sendReply,
    closeConversation,
    reopenConversation,
    refetch,
  } = useAdminChat();
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    setSending(true);
    try {
      await sendReply(inputValue.trim());
      setInputValue('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reply.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = async () => {
    if (!selectedConversation) return;
    try {
      await closeConversation(selectedConversation.id);
      toast({ title: 'Conversation closed' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to close conversation.',
        variant: 'destructive',
      });
    }
  };

  const handleReopen = async () => {
    if (!selectedConversation) return;
    try {
      await reopenConversation(selectedConversation.id);
      toast({ title: 'Conversation reopened' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reopen conversation.',
        variant: 'destructive',
      });
    }
  };

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="glass-card lg:col-span-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
              {totalUnread > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {totalUnread}
                </Badge>
              )}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={refetch}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConversation?.id === conv.id
                        ? 'bg-primary/20 border border-primary/30'
                        : 'hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {conv.user_name || conv.user_email}
                          </span>
                          {conv.status === 'closed' && (
                            <Badge variant="outline" className="text-xs">
                              Closed
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {conv.last_message || 'No messages yet'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(conv.last_message_at || conv.created_at), 'MMM d, HH:mm')}
                        </p>
                      </div>
                      {conv.unread_count > 0 && (
                        <Badge variant="destructive" className="shrink-0">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className="glass-card lg:col-span-2 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => selectConversation(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {selectedConversation.user_name || 'Anonymous'}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {selectedConversation.user_email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedConversation.status === 'open' ? (
                    <Button variant="outline" size="sm" onClick={handleClose}>
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleReopen}>
                      <Check className="h-4 w-4 mr-1" />
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No messages in this conversation
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            message.sender_type === 'admin'
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-secondary text-secondary-foreground rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender_type === 'admin'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {format(new Date(message.created_at), 'MMM d, HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a reply..."
                  className="flex-1"
                  disabled={sending || selectedConversation.status === 'closed'}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || sending || selectedConversation.status === 'closed'}
                  size="icon"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {selectedConversation.status === 'closed' && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Reopen the conversation to send messages
                </p>
              )}
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to view messages</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
