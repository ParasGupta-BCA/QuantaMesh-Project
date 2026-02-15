import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Order } from "@/types/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startOfDay, subDays, format, isSameDay } from "date-fns";

interface AdminRevenueChartProps {
  orders: Order[];
}

export function AdminRevenueChart({ orders }: AdminRevenueChartProps) {
  const [timeRange, setTimeRange] = useState("30");

  const chartData = useMemo(() => {
    const days = parseInt(timeRange);
    const endDate = startOfDay(new Date());
    const startDate = subDays(endDate, days - 1); // -1 to include today as one of the days

    const data: { date: string; revenue: number }[] = [];

    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, days - 1 - i);
      const ordersOnDay = orders.filter((order) =>
        isSameDay(new Date(order.created_at), date)
      );
      // Filter for 'completed' or valid orders if needed. Assuming all orders count for now.
      // You might want to filter by order.status === 'completed'
      const dailyRevenue = ordersOnDay.reduce(
        (acc, order) => acc + (order.total_price || 0), // Handle potential null total_price
        0
      );
      data.push({
        date: format(date, "MMM dd"),
        revenue: dailyRevenue,
      });
    }
    return data;
  }, [orders, timeRange]);

  const totalRevenue = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.revenue, 0),
    [chartData]
  );

  return (
    <Card className="col-span-1 h-full min-h-[400px] min-w-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-normal text-muted-foreground">
            Total Revenue
          </CardTitle>
          <div className="text-2xl font-bold">
            ${totalRevenue.toFixed(2)}
          </div>
          <CardDescription>
            In the last {timeRange} days
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Revenue
                          </span>
                          <span className="font-bold text-muted-foreground">
                            ${payload[0].value}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
