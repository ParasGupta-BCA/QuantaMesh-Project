import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    User,
    Mail,
    Calendar,
    ChevronUp,
    ChevronDown,
    Loader2,
    MessageSquare,
    Reply
} from "lucide-react";
import { ContactMessage } from "@/types/admin";

interface AdminMessagesProps {
    messages: ContactMessage[];
    updateMessageStatus: (messageId: string, newStatus: string) => Promise<void>;
    loading?: boolean;
}

const messageStatuses = [
    { value: "unread", label: "Unread", color: "bg-red-500/10 text-red-500 border-red-500/20" },
    { value: "read", label: "Read", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
    { value: "replied", label: "Replied", color: "bg-green-500/10 text-green-500 border-green-500/20" },
];

export function AdminMessages({ messages, updateMessageStatus, loading }: AdminMessagesProps) {
    const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

    const toggleMessageExpand = (messageId: string) => {
        setExpandedMessages((prev) => {
            const next = new Set(prev);
            if (next.has(messageId)) {
                next.delete(messageId);
            } else {
                next.add(messageId);
            }
            return next;
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = messageStatuses.find(s => s.value === status) ||
            { label: status, color: "bg-secondary text-secondary-foreground" };

        return (
            <Badge variant="outline" className={`${statusConfig.color} border font-medium px-2.5 py-0.5 rounded-full uppercase text-[10px] tracking-wider`}>
                {statusConfig.label}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <Card className="glass-card border-dashed">
                <CardContent className="py-20 flex flex-col items-center justify-center text-center text-muted-foreground gap-4">
                    <MessageSquare className="h-12 w-12 opacity-20" />
                    <p>No messages found in the database.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4 animate-slide-up">
            {messages.map((message, index) => (
                <Card
                    key={message.id}
                    className="glass-card glass-card-hover overflow-hidden transition-all duration-300 border-border/40 hover:border-primary/20"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <CardContent className="p-0">
                        {/* Message Header */}
                        <div
                            className={`p-4 md:p-6 cursor-pointer hover:bg-secondary/20 transition-colors ${message.status === 'unread' ? 'bg-primary/5' : ''}`}
                            onClick={() => toggleMessageExpand(message.id)}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl shrink-0 ${message.status === 'unread' ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-muted-foreground'}`}>
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <h3 className={`text-base font-semibold truncate ${message.status === 'unread' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {message.subject}
                                                </h3>
                                                {getStatusBadge(message.status)}
                                            </div>

                                            <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 opacity-70" />
                                                    {message.name}
                                                </span>
                                                <span className="flex items-center gap-1.5 hidden sm:flex">
                                                    <Mail className="h-3.5 w-3.5 opacity-70" />
                                                    <span className="truncate max-w-[150px]">{message.email}</span>
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 opacity-70" />
                                                    {new Date(message.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-4 ml-16 md:ml-0">
                                    {expandedMessages.has(message.id) ? (
                                        <div className="p-2 rounded-full hover:bg-secondary/50 transition-colors">
                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <div className="p-2 rounded-full hover:bg-secondary/50 transition-colors">
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expanded Message Details */}
                        {expandedMessages.has(message.id) && (
                            <div className="border-t border-border/30 bg-secondary/5 anim-expand-height">
                                {/* Actions Bar */}
                                <div className="p-4 bg-background/50 backdrop-blur-sm border-b border-border/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
                                    <div className="w-full sm:w-auto flex items-center gap-3">
                                        <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">Mark as:</span>
                                        <Select
                                            value={message.status}
                                            onValueChange={(value) => updateMessageStatus(message.id, value)}
                                        >
                                            <SelectTrigger className="w-full sm:w-[160px] h-9 bg-background/60">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {messageStatuses.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        size="sm"
                                        className="w-full sm:w-auto gap-2 h-9"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`mailto:${message.email}?subject=Re: ${message.subject}`, "_blank");
                                        }}
                                    >
                                        <Reply className="h-4 w-4" />
                                        Reply via Email
                                    </Button>
                                </div>

                                <div className="p-6 md:p-8 space-y-6">
                                    {/* Sender Details */}
                                    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-background/40 border border-border/30">
                                        <div className="flex-1 space-y-1">
                                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">From</div>
                                            <div className="font-medium text-foreground">{message.name}</div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Email</div>
                                            <div className="font-medium text-foreground select-all">{message.email}</div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Sent On</div>
                                            <div className="font-medium text-foreground">
                                                {new Date(message.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Content */}
                                    <div className="space-y-2">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Message Content</div>
                                        <div className="text-sm md:text-base leading-relaxed text-foreground/90 bg-background p-6 rounded-xl border border-border/30 shadow-sm whitespace-pre-wrap">
                                            {message.message}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-2 text-right">
                                        <span className="text-[10px] font-mono text-muted-foreground/40 select-all">Msg ID: {message.id}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
