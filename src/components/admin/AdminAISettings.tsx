import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Save, Loader2 } from 'lucide-react';

interface AISettings {
  id: string;
  personality: string;
  knowledge_base: string;
  greeting_message: string;
  max_response_length: number;
  is_active: boolean;
}

export function AdminAISettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setSettings(data as AISettings);
    } catch (error) {
      console.error('Error fetching AI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ai_settings')
        .update({
          personality: settings.personality,
          knowledge_base: settings.knowledge_base,
          greeting_message: settings.greeting_message,
          max_response_length: settings.max_response_length,
          is_active: settings.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;
      toast({ title: 'AI Settings Saved', description: 'Changes will take effect immediately.' });
    } catch (error) {
      console.error('Error saving AI settings:', error);
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (!settings) return <p className="text-muted-foreground text-center py-10">No AI settings found.</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Assistant Configuration</CardTitle>
              <CardDescription>Customize how the AI chatbot behaves and responds to clients.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30">
            <div>
              <Label className="text-sm font-medium">AI Assistant Active</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Toggle the AI auto-responder on/off</p>
            </div>
            <Switch
              checked={settings.is_active}
              onCheckedChange={(checked) => setSettings({ ...settings, is_active: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personality">Personality & Tone</Label>
            <Textarea
              id="personality"
              value={settings.personality}
              onChange={(e) => setSettings({ ...settings, personality: e.target.value })}
              placeholder="Describe the AI's personality..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Define how the AI should communicate (e.g., formal, casual, friendly)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="knowledge_base">Knowledge Base</Label>
            <Textarea
              id="knowledge_base"
              value={settings.knowledge_base}
              onChange={(e) => setSettings({ ...settings, knowledge_base: e.target.value })}
              placeholder="Add custom knowledge, FAQs, pricing details..."
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Custom information the AI will use to answer questions (services, pricing, policies, FAQs)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="greeting">Greeting Message</Label>
            <Input
              id="greeting"
              value={settings.greeting_message}
              onChange={(e) => setSettings({ ...settings, greeting_message: e.target.value })}
              placeholder="Hello! How can I help?"
            />
            <p className="text-xs text-muted-foreground">First message the AI sends to new conversations</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_length">Max Response Length (words)</Label>
            <Input
              id="max_length"
              type="number"
              min={50}
              max={500}
              value={settings.max_response_length}
              onChange={(e) => setSettings({ ...settings, max_response_length: parseInt(e.target.value) || 150 })}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
