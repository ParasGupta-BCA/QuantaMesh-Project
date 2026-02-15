import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Lead } from "@/types/admin";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { format, subDays, startOfDay, isSameDay } from "date-fns";

interface AdminLeadsGrowthChartProps {
    leads: Lead[];
}

export function AdminLeadsGrowthChart({ leads }: AdminLeadsGrowthChartProps) {
    const data = useMemo(() => {
        const days = 30;
        const endDate = startOfDay(new Date());
        const chartData = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(endDate, i);
            const leadsOnDay = leads.filter((lead) => {
                try {
                    return isSameDay(new Date(lead.created_at), date);
                } catch (e) {
                    console.error("Invalid date for lead:", lead);
                    return false;
                }
            });
            chartData.push({
                date: format(date, "MMM dd"),
                leads: leadsOnDay.length,
            });
        }
        return chartData;
    }, [leads]);

    return (
        <Card className="col-span-1 h-full min-h-[400px]">
            <CardHeader>
                <CardTitle>Leads Growth</CardTitle>
                <CardDescription>New leads over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                {leads.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ fill: "transparent" }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            New Leads
                                                        </span>
                                                        <span className="font-bold text-muted-foreground">
                                                            {payload[0].value}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="leads"
                                fill="#adfa1d"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        No recent leads data available
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
