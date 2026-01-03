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
  Search,
  MoreVertical,
  Paperclip,
  FileIcon,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminChat, ConversationWithUnread } from '@/hooks/useAdminChat';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileAttachment } from './FileAttachment';

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const isImageFile = (type: string) => type?.startsWith('image/');

export function AdminChatPanel() {
  const {
    conversations,
    selectedConversation,
    messages,
    loading,
    uploading,
    selectConversation,
    sendReply,
    closeConversation,
    reopenConversation,
    refetch,
  } = useAdminChat();
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 50MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if ((!inputValue.trim() && !selectedFile) || sending) return;

    setSending(true);
    try {
      await sendReply(inputValue.trim(), selectedFile || undefined);
      setInputValue('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [messages, selectedConversation]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  const filteredConversations = conversations.filter(c =>
    (c.user_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.user_email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const renderFileAttachment = (message: typeof messages[0]) => {
    if (!message.file_url) return null;

    return (
      <FileAttachment
        fileUrl={message.file_url}
        fileName={message.file_name}
        fileType={message.file_type}
        fileSize={message.file_size}
        isClientMessage={message.sender_type !== 'admin'}
        maxImageWidth="250px"
        maxImageHeight="250px"
      />
    );
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] min-h-[500px] max-h-[800px] rounded-2xl overflow-hidden glass-card border-border/40 gap-0 shadow-xl bg-background/40 backdrop-blur-xl animate-fade-in">
      {/* Conversations List Sidebar */}
      <div
        className={`w-full lg:w-[350px] lg:border-r border-border/40 flex flex-col bg-secondary/10 lg:bg-transparent ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}
      >
        <div className="p-4 border-b border-border/30 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              Inbox
              {totalUnread > 0 && (
                <Badge variant="default" className="bg-primary/90 text-[10px] px-1.5 h-5">
                  {totalUnread}
                </Badge>
              )}
            </h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/50 rounded-full" onClick={refetch}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search chat..."
              className="pl-9 h-9 bg-background/50 border-border/40 focus-visible:ring-primary/20 transition-all rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground p-4 text-center">
              <MessageCircle className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            <div className="flex flex-col p-2 gap-1">
              {filteredConversations.map((conv) => {
                const initial = (conv.user_name || conv.user_email || "?").charAt(0).toUpperCase();
                const isSelected = selectedConversation?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 group border relative overflow-hidden ${isSelected
                      ? 'bg-primary/10 border-primary/20 shadow-sm'
                      : 'border-transparent hover:bg-secondary/40 hover:border-border/30'
                      }`}
                  >
                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}

                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className={`h-10 w-10 border border-border/20 ${isSelected ? 'ring-2 ring-background' : ''}`}>
                          <AvatarFallback className={`${isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                            {initial}
                          </AvatarFallback>
                        </Avatar>
                        {conv.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-background">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium text-sm truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {conv.user_name || conv.user_email}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70 shrink-0">
                            {format(new Date(conv.last_message_at || conv.created_at), 'MMM d')}
                          </span>
                        </div>

                        <p className={`text-xs truncate ${conv.unread_count > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                          {conv.last_message || 'No messages yet'}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          {conv.status === 'closed' && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1 rounded-sm border-border/40 bg-secondary/30 text-muted-foreground">
                              Closed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-background/30 relative ${!selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 border-b border-border/30 flex items-center justify-between bg-background/40 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-8 w-8 -ml-2 rounded-full"
                  onClick={() => selectConversation(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <Avatar className="h-9 w-9 border border-border/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {(selectedConversation.user_name || selectedConversation.user_email || "?").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <span className="font-semibold text-sm leading-none">{selectedConversation.user_name || 'Anonymous'}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 max-w-[150px] sm:max-w-none truncate">
                    {selectedConversation.user_email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {selectedConversation.status === 'open' ? (
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-medium hover:bg-destructive/10 hover:text-destructive" onClick={handleClose}>
                    <X className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Close Ticket</span>
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-medium hover:bg-green-500/10 hover:text-green-600" onClick={handleReopen}>
                    <Check className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Reopen Ticket</span>
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.open(`mailto:${selectedConversation.user_email}`, "_blank")}>
                      <Mail className="h-4 w-4 mr-2" /> Email User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 overflow-y-auto p-4 space-y-6 scrollbar-thin hover:scrollbar-thumb-primary/20" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center opacity-60">
                    <div className="bg-secondary/50 p-6 rounded-full mb-4">
                      <MessageCircle className="h-10 w-10" />
                    </div>
                    <p className="text-sm font-medium">No messages yet</p>
                    <p className="text-xs mt-1">Start the conversation by sending a message below.</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isAdmin = message.sender_type === 'admin';
                    const showAvatar = index === 0 || messages[index - 1].sender_type !== message.sender_type;

                    return (
                      <div key={message.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                        <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'} ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                            {isAdmin ? <User className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </div>

                          <div className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap break-words ${isAdmin
                                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                                  : 'bg-secondary/80 backdrop-blur-sm text-foreground rounded-tl-none border border-border/10'
                                }`}
                            >
                              {message.content}
                              {renderFileAttachment(message)}
                            </div>
                            <span className={`text-[10px] text-muted-foreground mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                              {format(new Date(message.created_at), 'hh:mm a')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected File Preview */}
            {selectedFile && (
              <div className="px-4 py-2 border-t border-border/30 bg-background/40">
                <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
                  {isImageFile(selectedFile.type) ? (
                    <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <FileIcon className="h-4 w-4 text-primary shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-background/60 backdrop-blur-md border-t border-border/30">
              <div className="relative flex gap-2 items-end bg-secondary/30 p-1.5 rounded-2xl border border-border/20 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending || uploading || selectedConversation.status === 'closed'}
                  className="h-10 w-10 shrink-0 rounded-xl"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Reply to ${selectedConversation.user_name || 'user'}...`}
                  className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none min-h-[44px] max-h-[120px] py-3 text-sm"
                  disabled={sending || uploading || selectedConversation.status === 'closed'}
                  autoComplete="off"
                />
                <Button
                  onClick={handleSend}
                  disabled={(!inputValue.trim() && !selectedFile) || sending || uploading || selectedConversation.status === 'closed'}
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl mb-0.5 mr-0.5 transition-all active:scale-95"
                >
                  {sending || uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5 ml-0.5" />
                  )}
                </Button>
              </div>

              {selectedConversation.status === 'closed' && (
                <div className="mt-2 flex justify-center">
                  <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border/20 flex items-center gap-1.5">
                    <X className="h-3 w-3" />
                    Conversation is closed. Reopen to reply.
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-secondary/5">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/5 rotate-3">
              <MessageCircle className="h-10 w-10 text-primary opacity-80" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Admin Support Console</h3>
            <p className="text-muted-foreground max-w-sm mb-8 text-sm leading-relaxed">
              Select a conversation from the sidebar to view message history and send replies to your users.
            </p>
            <div className="hidden lg:flex items-center gap-6 opacity-40 grayscale">
              <div className="h-12 w-20 bg-background rounded-lg border border-border/50 shadow-sm" />
              <div className="h-20 w-32 bg-background rounded-lg border border-border/50 shadow-sm scale-110" />
              <div className="h-12 w-20 bg-background rounded-lg border border-border/50 shadow-sm" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
