import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Order, ContactMessage, Review } from "@/types/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ShoppingCart, MessageSquare, Star, UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define a unified Activity type
type ActivityType = "order" | "message" | "review" | "lead";

interface ActivityItem {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    timestamp: string;
    icon: React.ReactNode;
    userInitials: string;
}

interface Lead {
    id: string;
    name: string;
    created_at: string;
}

interface AdminRecentActivityProps {
    orders: Order[];
    messages: ContactMessage[];
    reviews: Review[];
    leads: Lead[];
}

export function AdminRecentActivity({
    orders,
    messages,
    reviews,
    leads,
}: AdminRecentActivityProps) {
    // Combine all data sources into a single list
    const activities: ActivityItem[] = [
        ...orders.map((order) => ({
            id: order.id,
            type: "order" as ActivityType,
            title: "New Order",
            description: `${order.customer_name} purchased ${order.app_name}`,
            timestamp: order.created_at,
            icon: <ShoppingCart className="h-4 w-4 text-blue-500" />,
            userInitials: getInitials(order.customer_name),
        })),
        ...messages.map((msg) => ({
            id: msg.id,
            type: "message" as ActivityType,
            title: "New Message",
            description: `${msg.name}: ${msg.subject}`,
            timestamp: msg.created_at,
            icon: <MessageSquare className="h-4 w-4 text-yellow-500" />,
            userInitials: getInitials(msg.name),
        })),
        ...reviews.map((review) => ({
            id: review.id,
            type: "review" as ActivityType,
            title: "New Review",
            description: `${review.customer_name} rated ${review.rating} stars`,
            timestamp: review.created_at,
            icon: <Star className="h-4 w-4 text-orange-500" />,
            userInitials: getInitials(review.customer_name),
        })),
        ...leads.map((lead) => ({
            id: lead.id,
            type: "lead" as ActivityType,
            title: "New Lead",
            description: `${lead.name} joined via signup`,
            timestamp: lead.created_at,
            icon: <UserPlus className="h-4 w-4 text-green-500" />,
            userInitials: getInitials(lead.name),
        })),
    ].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Take only the most recent 20 activities
    const recentActivities = activities.slice(0, 20);

    return (
        <Card className="col-span-1 h-full min-h-[400px] flex flex-col">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    Latest actions across your platform
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[350px] px-6">
                    <div className="space-y-8 pb-6">
                        {recentActivities.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No recent activity.
                            </p>
                        ) : (
                            recentActivities.map((activity) => (
                                <div key={`${activity.type}-${activity.id}`} className="flex items-start">
                                    <Avatar className="h-9 w-9 mt-0.5">
                                        <AvatarFallback className="text-xs">
                                            {activity.userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1 w-full">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium leading-none flex items-center gap-2">
                                                {activity.title}
                                                {activity.icon}
                                            </p>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(activity.timestamp), {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {activity.description}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function getInitials(name: string) {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
