import { Card, CardContent } from "@/components/ui/card";
import { Package, MessageSquare, DollarSign, TrendingUp } from "lucide-react";
import { Order, ContactMessage } from "@/types/admin";

interface AdminStatsProps {
    orders: Order[];
    messages: ContactMessage[];
}

export function AdminStats({ orders, messages }: AdminStatsProps) {
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const unreadMessages = messages.filter((m) => m.status === "unread").length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_price), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    const stats = [
        {
            title: "Total Revenue",
            value: `$${totalRevenue.toFixed(2)}`,
            subtext: "Lifetime earnings",
            icon: DollarSign,
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "border-green-500/20",
        },
        {
            title: "Total Orders",
            value: orders.length,
            subtext: `${pendingOrders} pending orders`,
            subtextClass: pendingOrders > 0 ? "text-orange-400 font-medium" : "",
            icon: Package,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
        },
        {
            title: "Messages",
            value: messages.length,
            subtext: `${unreadMessages} unread messages`,
            subtextClass: unreadMessages > 0 ? "text-red-400 font-medium" : "",
            icon: MessageSquare,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
        },
        {
            title: "Avg Order Value",
            value: `$${avgOrderValue.toFixed(2)}`,
            subtext: "Per order average",
            icon: TrendingUp,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
            {stats.map((stat, index) => (
                <Card
                    key={index}
                    className="glass-card overflow-hidden border-border/50 hover:border-border transition-all duration-300 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            {index === 0 && <div className="text-xs font-mono px-2 py-1 rounded bg-secondary text-secondary-foreground">+12%</div>}
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-sm font-medium text-muted-foreground tracking-wide">{stat.title}</h3>
                            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                            <p className={`text-xs text-muted-foreground ${stat.subtextClass}`}>
                                {stat.subtext}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
