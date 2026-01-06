import { X, Reply, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReplyTo } from '@/hooks/useChat';

interface ReplyPreviewProps {
  replyTo: ReplyTo;
  onClear: () => void;
  variant?: 'input' | 'message';
  className?: string;
}

export function ReplyPreview({ replyTo, onClear, variant = 'input', className = '' }: ReplyPreviewProps) {
  const isClient = replyTo.sender_type === 'client';
  const truncatedContent = replyTo.content.length > 100 
    ? replyTo.content.substring(0, 100) + '...' 
    : replyTo.content;

  if (variant === 'message') {
    // Compact inline preview shown inside a message bubble
    return (
      <div className={`flex items-start gap-2 p-2 rounded-lg bg-background/30 border-l-2 border-primary/50 mb-2 ${className}`}>
        <Reply className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0 rotate-180" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-muted-foreground">
            {isClient ? 'You' : 'Admin'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {truncatedContent}
          </p>
        </div>
      </div>
    );
  }

  // Input bar preview (larger, dismissible)
  return (
    <div className={`flex items-center gap-2 p-2.5 bg-secondary/50 rounded-lg border border-border/30 ${className}`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isClient ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
          <Reply className="h-4 w-4 rotate-180" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            Replying to {isClient ? 'yourself' : 'Admin'}
          </p>
          <p className="text-sm truncate">
            {truncatedContent}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={onClear}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
