import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Send, Loader2, MessageCircle, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const { conversation, messages, loading, sendMessage, markAsRead } = useChat();
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark messages as read when page loads
  useEffect(() => {
    if (user && !loading) {
      markAsRead();
    }
  }, [user, loading, markAsRead]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(inputValue.trim());
      setInputValue('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
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

  // Loading state
  if (authLoading) {
    return (
      <Layout>
        <Helmet>
          <title>Chat Support - QuantaMesh</title>
        </Helmet>
        <section className="pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="container mx-auto px-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        </section>
      </Layout>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Layout>
        <Helmet>
          <title>Chat Support - QuantaMesh</title>
          <meta name="description" content="Chat with our support team for help with your app publishing needs." />
        </Helmet>

        <section className="pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <LogIn size={32} className="text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
                <p className="text-muted-foreground mb-6">
                  Please sign in or create an account to chat with our support team.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="gradient" asChild>
                    <Link to="/auth">
                      <LogIn size={16} className="mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/auth?signup=true">
                      <UserPlus size={16} className="mr-2" />
                      Create Account
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Chat Support - QuantaMesh</title>
        <meta name="description" content="Chat with our support team for help with your app publishing needs." />
      </Helmet>

      <section className="pt-20 pb-8 md:pt-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Support</span> Chat
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have questions about your app publishing order? Chat with our team and get help in real-time.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[600px]">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border bg-secondary/50">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">QuantaMesh Support</h3>
                  <p className="text-sm text-muted-foreground">We typically reply quickly</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <MessageCircle className="h-10 w-10 text-primary" />
                    </div>
                    <h4 className="text-xl font-medium mb-2">Start a conversation</h4>
                    <p className="text-muted-foreground max-w-md">
                      Send us a message and we'll get back to you as soon as possible. We're here to help with your app publishing needs.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_type === 'client' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.sender_type === 'client'
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-secondary text-secondary-foreground rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1.5 ${
                              message.sender_type === 'client'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {format(new Date(message.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border bg-secondary/30">
                {conversation?.status === 'closed' ? (
                  <p className="text-center text-muted-foreground py-2">
                    This conversation has been closed. Start a new message to reopen it.
                  </p>
                ) : (
                  <div className="flex gap-3">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={sending}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || sending}
                      size="icon"
                      className="h-10 w-10"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
