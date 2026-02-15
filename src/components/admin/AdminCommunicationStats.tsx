import { useMemo } from "react";
import {
    LineChart,
    Line,
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
        <Card className="col-span-1 h-full min-h-[400px]">
            <CardHeader>
                <CardTitle>Communication Insights</CardTitle>
                <CardDescription>Messages & Email Performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col p-4 bg-muted/40 rounded-lg border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Mail className="h-4 w-4" /> Email Open Rate
                        </div>
                        <div className="text-2xl font-bold">{emailStats.openRate.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">
                            {emailStats.totalSent} sent
                        </div>
                    </div>
                    <div className="flex flex-col p-4 bg-muted/40 rounded-lg border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <MessageSquare className="h-4 w-4" /> Recent Messages
                        </div>
                        <div className="text-2xl font-bold">{messages.length}</div>
                        <div className="text-xs text-muted-foreground">
                            Total Inquiries
                        </div>
                    </div>
                </div>

                {/* Message Trend Chart */}
                <div className="h-[200px]">
                    <p className="text-sm font-medium mb-4">Message Volume (14 Days)</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={messageChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                labelStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="messages"
                                stroke="#8884d8"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
