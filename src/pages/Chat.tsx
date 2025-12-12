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
        <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

        <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="glass-card rounded-2xl p-8 text-center border-border/50 shadow-2xl backdrop-blur-xl">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 ring-4 ring-primary/5">
                <LogIn size={36} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-3 tracking-tight">Sign In Required</h1>
              <p className="text-muted-foreground mb-8 text-lg">
                Please sign in or create an account to start chatting with our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="default" size="lg" className="rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" asChild>
                  <Link to="/auth">
                    <LogIn size={18} className="mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-xl font-medium hover:bg-secondary/80" asChild>
                  <Link to="/auth?signup=true">
                    <UserPlus size={18} className="mr-2" />
                    Create Account
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout hideFooter={true} showChatWidget={false}>
      <Helmet>
        <title>Chat Support - QuantaMesh</title>
        <meta name="description" content="Chat with our support team for help with your app publishing needs." />
      </Helmet>

      {/* Main Container - Full height minus navbar on mobile, centered with padding on desktop */}
      <div className="relative flex flex-col h-[calc(100dvh-4rem)] md:h-[calc(100vh-5rem)] md:container md:mx-auto md:px-4 md:py-6">

        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex items-center p-4 bg-background/80 backdrop-blur-md border-b sticky top-0 z-10">
          <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Support Chat</h1>
        </div>

        {/* Desktop Header Description (Hidden on Mobile) */}
        <div className="hidden md:block mb-6 text-center">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">Support Center</span>
          </h1>
          <p className="text-muted-foreground">We're here to help you around the clock.</p>
        </div>

        {/* Chat Interface Container */}
        <div className="flex-1 flex flex-col md:glass-card md:rounded-3xl md:border md:border-border/50 md:shadow-2xl md:overflow-hidden bg-background/50 md:bg-secondary/5">

          {/* Messages Area - Flex 1 to take available space */}
          <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-0 animate-in fade-in duration-700 slide-in-from-bottom-4 fill-mode-forwards" style={{ animationDelay: '0.2s' }}>
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center ring-8 ring-background">
                  <MessageCircle className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h4 className="text-2xl font-bold tracking-tight">How can we help?</h4>
                  <p className="text-muted-foreground">
                    Our team is ready to assist you correctly. Send a message to get started.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {messages.map((message, index) => {
                  const isClient = message.sender_type === 'client';
                  return (
                    <div
                      key={message.id}
                      className={`flex w-full ${isClient ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[70%] ${isClient ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`rounded-2xl px-5 py-3 shadow-sm text-[15px] leading-relaxed relative group ${isClient
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-card border border-border/50 text-card-foreground rounded-bl-sm'
                            }`}
                        >
                          {message.content}
                        </div>
                        <span className="text-[11px] text-muted-foreground/60 px-1 select-none">
                          {format(new Date(message.created_at), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-background/80 backdrop-blur-lg border-t md:bg-secondary/30 md:border-t-0">
            {conversation?.status === 'closed' ? (
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-center">
                <p className="text-muted-foreground text-sm">This conversation is closed. Start a new one to continue.</p>
              </div>
            ) : (
              <div className="relative flex items-center gap-3 max-w-4xl mx-auto">
                <div className="relative flex-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="h-12 pl-4 pr-12 rounded-full border-border/50 bg-background/50 hover:bg-background focus:bg-background transition-colors shadow-sm focus-visible:ring-primary/20"
                    disabled={sending}
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || sending}
                  size="icon"
                  className="h-12 w-12 rounded-full shrink-0 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-gradient-to-br from-primary to-purple-600 border-0"
                >
                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5 ml-0.5" />
                  )}
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
}
