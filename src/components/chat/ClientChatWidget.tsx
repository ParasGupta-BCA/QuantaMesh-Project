import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function ClientChatWidget() {
  const { user } = useAuth();
  const { conversation, messages, loading, unreadCount, sendMessage, markAsRead } = useChat();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive - MUST be before any conditional returns
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Don't render if user is not logged in - AFTER all hooks
  if (!user) return null;

  const handleOpen = () => {
    setIsOpen(true);
    markAsRead();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

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

  return (
    <>
      {/* Chat Button */}
      {/* Chat Button */}
      {/* We use a fixed container for positioning, but the internal button has the custom styles */}
      <div className="fixed bottom-6 right-6 z-50">
        <div
          className={`custom-chat-btn-container ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="custom-chat-btn-background"></div>
          <svg viewBox="0 0 100 100" className="custom-chat-bubble">
            <g className="bubble">
              <path d="M 30.7873,85.113394 30.7873,46.556405 C 30.7873,41.101961
              36.826342,35.342 40.898074,35.342 H 59.113981 C 63.73287,35.342
              69.29995,40.103201 69.29995,46.784744" className="line line1"></path>
              <path d="M 13.461999,65.039335 H 58.028684 C
                63.483128,65.039335
                69.243089,59.000293 69.243089,54.928561 V 45.605853 C
                69.243089,40.986964 65.02087,35.419884 58.339327,35.419884" className="line line2"></path>
            </g>
            <circle cx="42.5" cy="50.7" r="1.9" className="circle circle1"></circle>
            <circle r="1.9" cy="50.7" cx="49.9" className="circle circle2"></circle>
            <circle cx="57.3" cy="50.7" r="1.9" className="circle circle3"></circle>
          </svg>

          {unreadCount > 0 && !isOpen && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center text-xs rounded-full border-2 border-background animate-pulse"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)] glass-card rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Chat</h3>
                  <p className="text-xs text-muted-foreground">We typically reply quickly</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-medium mb-1">Start a conversation</h4>
                  <p className="text-sm text-muted-foreground">
                    Send us a message and we'll get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'client' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.sender_type === 'client'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary text-secondary-foreground rounded-bl-md'
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${message.sender_type === 'client'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                            }`}
                        >
                          {format(new Date(message.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-secondary/30">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={sending || conversation?.status === 'closed'}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || sending || conversation?.status === 'closed'}
                  size="icon"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {conversation?.status === 'closed' && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  This conversation has been closed
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
