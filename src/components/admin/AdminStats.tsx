import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, MessageSquare, DollarSign } from "lucide-react";
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

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 animate-slide-up">
            {/* Total Orders */}
            <Card className="glass-card glass-card-hover animate-fade-in" style={{ animationDelay: "0ms" }}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                    <div className="p-2 rounded-full bg-primary/10">
                        <Package className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold gradient-text">{orders.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        <span className={pendingOrders > 0 ? "text-orange-400 font-medium" : ""}>
                            {pendingOrders} pending
                        </span>
                    </p>
                </CardContent>
            </Card>

            {/* Messages */}
            <Card className="glass-card glass-card-hover animate-fade-in" style={{ animationDelay: "100ms" }}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Messages</CardTitle>
                    <div className="p-2 rounded-full bg-blue-500/10">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold gradient-text">{messages.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        <span className={unreadMessages > 0 ? "text-red-400 font-medium" : ""}>
                            {unreadMessages} unread
                        </span>
                    </p>
                </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="glass-card glass-card-hover animate-fade-in" style={{ animationDelay: "200ms" }}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                    <div className="p-2 rounded-full bg-green-500/10">
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold gradient-text">
                        ${totalRevenue.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Lifetime earnings
                    </p>
                </CardContent>
            </Card>

            {/* Avg Order Value */}
            <Card className="glass-card glass-card-hover animate-fade-in" style={{ animationDelay: "300ms" }}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
                    <div className="p-2 rounded-full bg-purple-500/10">
                        <DollarSign className="h-4 w-4 text-purple-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold gradient-text">
                        ${avgOrderValue.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Per order
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
