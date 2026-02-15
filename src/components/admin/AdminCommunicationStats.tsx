import { useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ContactMessage } from "@/types/admin";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { Mail, MessageSquare } from "lucide-react";

interface EmailSequence {
    id: string;
    status: string;
    opened_at: string | null;
    clicked_at: string | null;
}

interface AdminCommunicationStatsProps {
    messages: ContactMessage[];
    emailSequences: EmailSequence[];
}

export function AdminCommunicationStats({ messages, emailSequences }: AdminCommunicationStatsProps) {
    const { messageChartData, emailStats } = useMemo(() => {
        // 1. Message Trend (Last 14 days)
        const days = 14;
        const endDate = startOfDay(new Date());
        const chartData = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(endDate, i);
            const msgsOnDay = messages.filter((msg) => {
                try {
                    return isSameDay(new Date(msg.created_at), date);
                } catch (e) { return false; }
            });
            chartData.push({
                date: format(date, "MMM dd"),
                messages: msgsOnDay.length,
            });
        }

        // 2. Email Stats
        const totalSent = emailSequences.length;
        const totalOpened = emailSequences.filter(e => e.opened_at).length;
        const totalClicked = emailSequences.filter(e => e.clicked_at).length;

        const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
        const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

        return {
            messageChartData: chartData,
            emailStats: { totalSent, openRate, clickRate }
        };
    }, [messages, emailSequences]);

    return (
        <Card className="col-span-1 h-full min-h-[450px] flex flex-col min-w-0 shadow-lg border-opacity-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Communication Insights
                </CardTitle>
                <CardDescription>Messages & Email Performance</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 gap-6 p-6 pt-2">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col p-4 bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-colors group">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <Mail className="h-4 w-4 text-primary" />
                            </div>
                            Email Open Rate
                        </div>
                        <div className="text-3xl font-bold text-primary">{emailStats.openRate.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground mt-1 font-medium">
                            {emailStats.totalSent} emails sent
                        </div>
                    </div>
                    <div className="flex flex-col p-4 bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-colors group">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <MessageSquare className="h-4 w-4 text-primary" />
                            </div>
                            Recent Messages
                        </div>
                        <div className="text-3xl font-bold text-primary">{messages.length}</div>
                        <div className="text-xs text-muted-foreground mt-1 font-medium">
                            Total Inquiries
                        </div>
                    </div>
                </div>

                {/* Message Trend Chart */}
                <div className="flex-1 w-full min-h-[250px] relative">
                    <p className="text-sm font-semibold mb-4 text-foreground/80">Message Volume (14 Days)</p>
                    <div className="absolute inset-0 top-8 bottom-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={messageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                <XAxis
                                    dataKey="date"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    minTickGap={30}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                    itemStyle={{ color: 'hsl(var(--primary))' }}
                                    labelStyle={{ color: 'hsl(var(--foreground))', marginBottom: '0.25rem' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="messages"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorMessages)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
