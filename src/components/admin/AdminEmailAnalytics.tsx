import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mail, 
  Eye, 
  MousePointerClick, 
  TrendingUp,
  BarChart3,
  Sparkles,
  CalendarDays
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { format, subDays, parseISO, startOfDay, isWithinInterval } from "date-fns";

interface EmailSequence {
  id: string;
  lead_id: string;
  sequence_type: string;
  subject: string;
  content: string;
  sent_at: string;
  status: string;
  opened_at?: string | null;
  clicked_at?: string | null;
}

interface AdminEmailAnalyticsProps {
  emailSequences: EmailSequence[];
}

interface TopicStats {
  name: string;
  displayName: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

interface DailyStats {
  date: string;
  displayDate: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

const TOPIC_DISPLAY_NAMES: Record<string, string> = {
  welcome: "Welcome Email",
  follow_up: "Follow-up 1 (Day 3)",
  follow_up_2: "Follow-up 2 (Day 7)",
  follow_up_3: "Follow-up 3 (Day 14)",
  tip_aso: "ASO Tips",
  tip_screenshots: "Screenshot Tips",
  tip_description: "Description Tips",
  tip_keywords: "Keyword Tips",
  tip_updates: "Update Strategy",
  tip_reviews: "Reviews Tips",
  tip_monetization: "Monetization Tips",
};

export function AdminEmailAnalytics({ emailSequences }: AdminEmailAnalyticsProps) {
  const analytics = useMemo(() => {
    const totalSent = emailSequences.length;
    const totalOpened = emailSequences.filter((e) => e.opened_at).length;
    const totalClicked = emailSequences.filter((e) => e.clicked_at).length;

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const clickToOpenRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

    // Group by topic/sequence type
    const topicMap = new Map<string, TopicStats>();
    
    emailSequences.forEach((email) => {
      const existing = topicMap.get(email.sequence_type) || {
        name: email.sequence_type,
        displayName: TOPIC_DISPLAY_NAMES[email.sequence_type] || email.sequence_type,
        sent: 0,
        opened: 0,
        clicked: 0,
        openRate: 0,
        clickRate: 0,
      };
      
      existing.sent += 1;
      if (email.opened_at) existing.opened += 1;
      if (email.clicked_at) existing.clicked += 1;
      
      topicMap.set(email.sequence_type, existing);
    });

    // Calculate rates and sort by performance
    const topicStats = Array.from(topicMap.values())
      .map((topic) => ({
        ...topic,
        openRate: topic.sent > 0 ? (topic.opened / topic.sent) * 100 : 0,
        clickRate: topic.sent > 0 ? (topic.clicked / topic.sent) * 100 : 0,
      }))
      .sort((a, b) => b.clickRate - a.clickRate);

    // Calculate daily trends for the last 14 days
    const today = startOfDay(new Date());
    const dailyStats: DailyStats[] = [];
    
    for (let i = 13; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const nextDate = subDays(today, i - 1);
      
      const dayEmails = emailSequences.filter((email) => {
        try {
          const sentDate = startOfDay(parseISO(email.sent_at));
          return isWithinInterval(sentDate, { start: date, end: date });
        } catch {
          return false;
        }
      });
      
      const sent = dayEmails.length;
      const opened = dayEmails.filter((e) => e.opened_at).length;
      const clicked = dayEmails.filter((e) => e.clicked_at).length;
      
      dailyStats.push({
        date: dateStr,
        displayDate: format(date, "MMM d"),
        sent,
        opened,
        clicked,
        openRate: sent > 0 ? (opened / sent) * 100 : 0,
        clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
      });
    }

    return {
      totalSent,
      totalOpened,
      totalClicked,
      openRate,
      clickRate,
      clickToOpenRate,
      topicStats,
      dailyStats,
    };
  }, [emailSequences]);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalSent}</p>
                <p className="text-xs text-muted-foreground">Emails Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Eye className="h-5 w-5 text-green-500" />
              </div>
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
              <div className="p-2 rounded-lg bg-purple-500/10">
                <MousePointerClick className="h-5 w-5 text-purple-500" />
              </div>
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
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.clickToOpenRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Click-to-Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Volume Trend Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Email Activity (Last 14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.dailyStats.every((d) => d.sent === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No email activity in the last 14 days</p>
            </div>
          ) : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sent"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSent)"
                    name="Sent"
                  />
                  <Area
                    type="monotone"
                    dataKey="opened"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOpened)"
                    name="Opened"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Engagement Rate Trend Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Engagement Rate Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.dailyStats.every((d) => d.sent === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Send emails to see engagement trends</p>
            </div>
          ) : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    className="text-muted-foreground"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="openRate"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Open Rate"
                  />
                  <Line
                    type="monotone"
                    dataKey="clickRate"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={{ fill: '#a855f7', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Click Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Topic Performance */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Email Topic Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.topicStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No email data yet</p>
              <p className="text-sm">Send emails to see analytics</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead className="text-center">Sent</TableHead>
                    <TableHead className="text-center">Opens</TableHead>
                    <TableHead className="text-center">Clicks</TableHead>
                    <TableHead>Open Rate</TableHead>
                    <TableHead>Click Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.topicStats.map((topic, index) => (
                    <TableRow key={topic.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index === 0 && topic.clickRate > 0 && (
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="font-medium">{topic.displayName}</span>
                          {topic.name.startsWith("tip_") && (
                            <Badge variant="outline" className="text-xs">
                              Daily Tip
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{topic.sent}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-500">{topic.opened}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-purple-500">{topic.clicked}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={topic.openRate} 
                            className="h-2 w-20"
                          />
                          <span className="text-sm text-muted-foreground w-12">
                            {topic.openRate.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={topic.clickRate} 
                            className="h-2 w-20"
                          />
                          <span className="text-sm text-muted-foreground w-12">
                            {topic.clickRate.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Performance Insights</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                {analytics.openRate < 20 && (
                  <li>• Open rate is below 20%. Try more compelling subject lines.</li>
                )}
                {analytics.openRate >= 20 && analytics.openRate < 40 && (
                  <li>• Good open rate! Industry average is around 20-25%.</li>
                )}
                {analytics.openRate >= 40 && (
                  <li>• Excellent open rate! Your subject lines are working great.</li>
                )}
                {analytics.clickRate < 3 && analytics.totalSent > 0 && (
                  <li>• Click rate is low. Consider stronger CTAs and clearer value props.</li>
                )}
                {analytics.clickRate >= 3 && (
                  <li>• Good click rate! Your CTAs are effective.</li>
                )}
                {analytics.topicStats.length > 0 && (
                  <li>
                    • Best performing topic:{" "}
                    <strong>{analytics.topicStats[0]?.displayName}</strong>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
