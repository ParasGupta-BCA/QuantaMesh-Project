import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex justify-start group">
      <div className="max-w-[80%] flex flex-col gap-1 items-start">
        <span className="text-[11px] text-muted-foreground/80 px-1 flex items-center gap-1">
          <Bot className="h-3 w-3" /> AI Assistant
        </span>
        <div className="rounded-2xl px-5 py-3 bg-card border border-border/50 text-card-foreground rounded-bl-sm shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
