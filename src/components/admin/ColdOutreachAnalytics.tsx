import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { BarChart3, Eye, MousePointerClick, TrendingUp } from "lucide-react";

interface ColdProspect {
  id: string;
  status: string;
  emails_sent: number;
  last_sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
}

interface Props {
  prospects: ColdProspect[];
}

export function ColdOutreachAnalytics({ prospects }: Props) {
  const analytics = useMemo(() => {
    const totalSent = prospects.reduce((sum, p) => sum + p.emails_sent, 0);
    const totalOpened = prospects.filter(p => p.opened_at).length;
    const totalClicked = prospects.filter(p => p.clicked_at).length;
    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100) : 0;

    // Daily stats for last 14 days
    const days = 14;
    const dailyStats = Array.from({ length: days }, (_, i) => {
      const date = startOfDay(subDays(new Date(), days - 1 - i));
      const dateStr = format(date, "yyyy-MM-dd");
      const label = format(date, "MMM d");

      const sentOnDay = prospects.filter(p => {
        if (!p.last_sent_at) return false;
        return format(startOfDay(new Date(p.last_sent_at)), "yyyy-MM-dd") === dateStr;
      }).length;

      const openedOnDay = prospects.filter(p => {
        if (!p.opened_at) return false;
        return format(startOfDay(new Date(p.opened_at)), "yyyy-MM-dd") === dateStr;
      }).length;

      const clickedOnDay = prospects.filter(p => {
        if (!p.clicked_at) return false;
        return format(startOfDay(new Date(p.clicked_at)), "yyyy-MM-dd") === dateStr;
      }).length;

      return { date: label, sent: sentOnDay, opened: openedOnDay, clicked: clickedOnDay };
    });

    return { totalSent, totalOpened, totalClicked, openRate, clickRate, dailyStats };
  }, [prospects]);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><BarChart3 className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalSent}</p>
                <p className="text-xs text-muted-foreground">Total Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10"><Eye className="h-5 w-5 text-green-500" /></div>
              <div>
                <p className="text-2xl font-bold">{analytics.openRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Open Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10"><MousePointerClick className="h-5 w-5 text-purple-500" /></div>
              <div>
                <p className="text-2xl font-bold">{analytics.clickRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Click Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10"><TrendingUp className="h-5 w-5 text-emerald-500" /></div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalClicked}</p>
                <p className="text-xs text-muted-foreground">Total Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Cold Outreach Activity (14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyStats}>
                <defs>
                  <linearGradient id="coldSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="coldOpened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                <Area type="monotone" dataKey="sent" stroke="#6366f1" fill="url(#coldSent)" name="Sent" />
                <Area type="monotone" dataKey="opened" stroke="#22c55e" fill="url(#coldOpened)" name="Opened" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Opens & Clicks Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                <Line type="monotone" dataKey="opened" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Opens" />
                <Line type="monotone" dataKey="clicked" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} name="Clicks" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
