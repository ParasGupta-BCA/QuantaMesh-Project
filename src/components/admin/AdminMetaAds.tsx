import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  Globe2,
  IndianRupee,
  DollarSign,
  BarChart3,
  Megaphone,
  Lightbulb,
  Copy,
  CheckCircle,
} from "lucide-react";

interface CampaignSuggestion {
  campaign_name: string;
  objective: string;
  target_audience: string;
  ad_copy: string;
  headline: string;
  cta: string;
  budget_daily: string;
  budget_monthly: string;
  expected_reach: string;
  expected_ctr: string;
  platforms: string[];
  regions: string[];
  tips: string[];
}

interface AnalysisResult {
  website_analysis: {
    strengths: string[];
    weaknesses: string[];
    usp: string;
    target_market: string;
  };
  campaigns: CampaignSuggestion[];
  overall_strategy: string;
  estimated_roi: string;
}

export function AdminMetaAds() {
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [budget, setBudget] = useState("500");
  const [currency, setCurrency] = useState("INR");
  const [targetRegion, setTargetRegion] = useState("india-global");
  const [businessGoal, setBusinessGoal] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("meta-ads-analyze", {
        body: {
          budget,
          currency,
          targetRegion,
          businessGoal,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data.analysis);
      toast({ title: "Analysis Complete! 🎯", description: "AI has generated your Meta Ads campaign strategy." });
    } catch (error) {
      console.error("Meta ads analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast({ title: "Copied!", description: "Ad copy copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          Meta Ads Campaign Analyzer
        </h2>
        <p className="text-sm text-muted-foreground">
          AI-powered campaign strategy generator for Facebook & Instagram ads
        </p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Campaign Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Monthly Budget</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="500"
                  className="flex-1"
                />
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ INR</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Target Region</Label>
              <Select value={targetRegion} onValueChange={setTargetRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="india">India Only</SelectItem>
                  <SelectItem value="global">Global Only</SelectItem>
                  <SelectItem value="india-global">India + Global</SelectItem>
                  <SelectItem value="us-uk">US & UK</SelectItem>
                  <SelectItem value="southeast-asia">Southeast Asia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Primary Goal</Label>
              <Select value={businessGoal || "leads"} onValueChange={setBusinessGoal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leads">Lead Generation</SelectItem>
                  <SelectItem value="sales">Direct Sales</SelectItem>
                  <SelectItem value="brand">Brand Awareness</SelectItem>
                  <SelectItem value="traffic">Website Traffic</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleAnalyze} disabled={analyzing} className="w-full gap-2">
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {analyzing ? "Analyzing Website & Generating Strategy..." : "Analyze & Generate Campaign Strategy"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
          {/* Website Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Website Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-green-500 uppercase tracking-wide">Strengths</h4>
                  <ul className="space-y-1">
                    {result.website_analysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Areas to Improve</h4>
                  <ul className="space-y-1">
                    {result.website_analysis.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <Lightbulb className="h-3.5 w-3.5 text-orange-500 mt-0.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-xs font-medium text-muted-foreground">USP</span>
                  <p className="text-sm mt-1">{result.website_analysis.usp}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 border border-border/30">
                  <span className="text-xs font-medium text-muted-foreground">Target Market</span>
                  <p className="text-sm mt-1">{result.website_analysis.target_market}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Strategy */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Overall Strategy</h3>
                  <p className="text-sm text-muted-foreground">{result.overall_strategy}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      {currency === "INR" ? <IndianRupee className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                      Est. ROI: {result.estimated_roi}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Suggestions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" />
              Campaign Suggestions ({result.campaigns.length})
            </h3>
            {result.campaigns.map((campaign, idx) => (
              <Card key={idx} className="overflow-hidden">
                <CardHeader className="pb-3 bg-primary/5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-sm">{campaign.campaign_name}</CardTitle>
                    <div className="flex gap-1.5 flex-wrap">
                      {campaign.platforms.map((p) => (
                        <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{campaign.objective}</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                      <p className="text-[10px] text-muted-foreground uppercase">Daily Budget</p>
                      <p className="font-bold text-sm">{campaign.budget_daily}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                      <p className="text-[10px] text-muted-foreground uppercase">Monthly Budget</p>
                      <p className="font-bold text-sm">{campaign.budget_monthly}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                      <p className="text-[10px] text-muted-foreground uppercase">Est. Reach</p>
                      <p className="font-bold text-sm">{campaign.expected_reach}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-secondary/30">
                      <p className="text-[10px] text-muted-foreground uppercase">Est. CTR</p>
                      <p className="font-bold text-sm">{campaign.expected_ctr}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Regions:</span>
                      <div className="flex gap-1 flex-wrap">
                        {campaign.regions.map((r) => (
                          <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Target Audience:</span>
                      <p className="text-sm mt-0.5">{campaign.target_audience}</p>
                    </div>
                  </div>

                  {/* Ad Copy */}
                  <div className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-primary">Ad Copy</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => copyToClipboard(`${campaign.headline}\n\n${campaign.ad_copy}\n\nCTA: ${campaign.cta}`, idx)}
                      >
                        {copiedIdx === idx ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copiedIdx === idx ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <p className="font-semibold text-sm">{campaign.headline}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaign.ad_copy}</p>
                    <Badge className="mt-1">{campaign.cta}</Badge>
                  </div>

                  {/* Tips */}
                  {campaign.tips.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">💡 Pro Tips</span>
                      {campaign.tips.map((tip, i) => (
                        <p key={i} className="text-xs text-muted-foreground pl-4">• {tip}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}