import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Plus, Trash2, Loader2, Save, Users, Briefcase, Link, Tag } from "lucide-react";

interface PortfolioItem {
  name: string;
  desc: string;
}

interface TeamMember {
  name: string;
  role: string;
}

interface ColdEmailSettings {
  id: string;
  portfolio_items: PortfolioItem[];
  team_members: TeamMember[];
  cta_text: string;
  cta_url: string;
  tagline: string;
}

export function AdminColdEmailSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ColdEmailSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("cold_email_settings")
      .select("*")
      .limit(1)
      .single();

    if (!error && data) {
      setSettings({
        id: data.id,
        portfolio_items: data.portfolio_items as unknown as PortfolioItem[],
        team_members: data.team_members as unknown as TeamMember[],
        cta_text: data.cta_text,
        cta_url: data.cta_url,
        tagline: data.tagline,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("cold_email_settings")
        .update({
          portfolio_items: JSON.parse(JSON.stringify(settings.portfolio_items)),
          team_members: JSON.parse(JSON.stringify(settings.team_members)),
          cta_text: settings.cta_text,
          cta_url: settings.cta_url,
          tagline: settings.tagline,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id);

      if (error) throw error;
      toast({ title: "Settings Saved ✅", description: "Cold email template updated" });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updatePortfolioItem = (index: number, field: keyof PortfolioItem, value: string) => {
    if (!settings) return;
    const items = [...settings.portfolio_items];
    items[index] = { ...items[index], [field]: value };
    setSettings({ ...settings, portfolio_items: items });
  };

  const addPortfolioItem = () => {
    if (!settings) return;
    setSettings({ ...settings, portfolio_items: [...settings.portfolio_items, { name: "", desc: "" }] });
  };

  const removePortfolioItem = (index: number) => {
    if (!settings) return;
    setSettings({ ...settings, portfolio_items: settings.portfolio_items.filter((_, i) => i !== index) });
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    if (!settings) return;
    const members = [...settings.team_members];
    members[index] = { ...members[index], [field]: value };
    setSettings({ ...settings, team_members: members });
  };

  const addTeamMember = () => {
    if (!settings) return;
    setSettings({ ...settings, team_members: [...settings.team_members, { name: "", role: "" }] });
  };

  const removeTeamMember = (index: number) => {
    if (!settings) return;
    setSettings({ ...settings, team_members: settings.team_members.filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (!settings) return <p className="text-muted-foreground text-center py-8">No settings found.</p>;

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-5 w-5 text-primary" /> General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Tag className="h-4 w-4" /> Tagline</Label>
            <Input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} placeholder="DIGITAL GROWTH PARTNER" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Link className="h-4 w-4" /> CTA Button Text</Label>
              <Input value={settings.cta_text} onChange={(e) => setSettings({ ...settings, cta_text: e.target.value })} placeholder="Let's Talk Growth →" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Link className="h-4 w-4" /> CTA URL</Label>
              <Input value={settings.cta_url} onChange={(e) => setSettings({ ...settings, cta_url: e.target.value })} placeholder="https://quantamesh.lovable.app/contact" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Items */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-5 w-5 text-primary" /> Portfolio Items
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addPortfolioItem} className="gap-1">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.portfolio_items.map((item, i) => (
            <div key={i} className="flex gap-3 items-start p-3 rounded-lg border border-border/50 bg-muted/30">
              <div className="flex-1 space-y-2">
                <Input placeholder="Service name" value={item.name} onChange={(e) => updatePortfolioItem(i, "name", e.target.value)} />
                <Input placeholder="Short description" value={item.desc} onChange={(e) => updatePortfolioItem(i, "desc", e.target.value)} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removePortfolioItem(i)} className="mt-1 shrink-0">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {settings.portfolio_items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No portfolio items. Add one above.</p>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-primary" /> Team Members
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addTeamMember} className="gap-1">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.team_members.map((member, i) => (
            <div key={i} className="flex gap-3 items-start p-3 rounded-lg border border-border/50 bg-muted/30">
              <div className="flex-1 space-y-2">
                <Input placeholder="Full name" value={member.name} onChange={(e) => updateTeamMember(i, "name", e.target.value)} />
                <Input placeholder="Role / Title" value={member.role} onChange={(e) => updateTeamMember(i, "role", e.target.value)} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeTeamMember(i)} className="mt-1 shrink-0">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {settings.team_members.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No team members. Add one above.</p>
          )}
        </CardContent>
      </Card>

      {/* Save */}
      <Button onClick={handleSave} disabled={saving} className="w-full gap-2" size="lg">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Email Template Settings
      </Button>
    </div>
  );
}
