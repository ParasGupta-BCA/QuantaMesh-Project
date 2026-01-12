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
  Sparkles
} from "lucide-react";

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

    return {
      totalSent,
      totalOpened,
      totalClicked,
      openRate,
      clickRate,
      clickToOpenRate,
      topicStats,
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
