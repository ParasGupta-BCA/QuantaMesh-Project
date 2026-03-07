import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2, DollarSign, Globe, Smartphone, Zap, Package } from "lucide-react";
import { getSafeErrorMessage, logError } from "@/lib/errorMessages";

interface ServicePricing {
  id: string;
  service_type: string;
  package_name: string;
  description: string | null;
  price: number;
  features: string[];
  is_active: boolean;
  display_order: number;
  payment_link: string | null;
  created_at: string;
}

const SERVICE_TYPES = [
  { value: "publishing", label: "App Publishing", icon: Package, color: "text-primary" },
  { value: "cgi", label: "CGI Video Ads", icon: Zap, color: "text-purple-400" },
  { value: "website", label: "Website Development", icon: Globe, color: "text-blue-400" },
  { value: "app-dev", label: "App Development", icon: Smartphone, color: "text-emerald-400" },
];

export function AdminServicePricing() {
  const { toast } = useToast();
  const [pricing, setPricing] = useState<ServicePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServicePricing | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    service_type: "website",
    package_name: "",
    description: "",
    price: "",
    features: "",
    payment_link: "",
    is_active: true,
    display_order: 0,
  });

  const fetchPricing = async () => {
    try {
      const { data, error } = await supabase
        .from("service_pricing")
        .select("*")
        .order("service_type")
        .order("display_order");

      if (error) throw error;
      setPricing(
        (data || []).map((p: any) => ({
          ...p,
          features: Array.isArray(p.features) ? p.features : [],
        }))
      );
    } catch (error) {
      logError("Fetch pricing", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({
      service_type: "website",
      package_name: "",
      description: "",
      price: "",
      features: "",
      payment_link: "",
      is_active: true,
      display_order: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (p: ServicePricing) => {
    setEditing(p);
    setForm({
      service_type: p.service_type,
      package_name: p.package_name,
      description: p.description || "",
      price: String(p.price),
      features: p.features.join("\n"),
      payment_link: p.payment_link || "",
      is_active: p.is_active,
      display_order: p.display_order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.package_name || !form.price) {
      toast({ title: "Error", description: "Package name and price are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        service_type: form.service_type,
        package_name: form.package_name,
        description: form.description || null,
        price: parseFloat(form.price),
        features: form.features.split("\n").filter((f) => f.trim()),
        payment_link: form.payment_link || null,
        is_active: form.is_active,
        display_order: form.display_order,
      };

      if (editing) {
        const { error } = await supabase
          .from("service_pricing")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Pricing Updated" });
      } else {
        const { error } = await supabase
          .from("service_pricing")
          .insert(payload);
        if (error) throw error;
        toast({ title: "Pricing Added" });
      }

      setDialogOpen(false);
      fetchPricing();
    } catch (error) {
      logError("Save pricing", error);
      toast({ title: "Error", description: getSafeErrorMessage(error, "Failed to save"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("service_pricing").delete().eq("id", id);
      if (error) throw error;
      setPricing((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Pricing Deleted" });
    } catch (error) {
      logError("Delete pricing", error);
      toast({ title: "Error", description: getSafeErrorMessage(error, "Failed to delete"), variant: "destructive" });
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("service_pricing")
        .update({ is_active: active })
        .eq("id", id);
      if (error) throw error;
      setPricing((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: active } : p)));
    } catch (error) {
      logError("Toggle pricing", error);
    }
  };

  const getServiceIcon = (type: string) => {
    const s = SERVICE_TYPES.find((t) => t.value === type);
    if (!s) return <Package className="h-4 w-4" />;
    const Icon = s.icon;
    return <Icon className={`h-4 w-4 ${s.color}`} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Service Pricing</h2>
          <p className="text-sm text-muted-foreground">Manage pricing packages for all services</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gap-2">
              <Plus className="h-4 w-4" /> Add Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Package" : "New Pricing Package"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Service Type</Label>
                <Select value={form.service_type} onValueChange={(v) => setForm((p) => ({ ...p, service_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Package Name</Label>
                <Input
                  value={form.package_name}
                  onChange={(e) => setForm((p) => ({ ...p, package_name: e.target.value }))}
                  placeholder="e.g. Basic, Standard, Premium"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of the package"
                  rows={2}
                />
              </div>
              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="99.00"
                />
              </div>
              <div>
                <Label>Features (one per line)</Label>
                <Textarea
                  value={form.features}
                  onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))}
                  placeholder="Responsive design&#10;SEO optimized&#10;Free hosting"
                  rows={4}
                />
              </div>
              <div>
                <Label>Payment Link (optional)</Label>
                <Input
                  value={form.payment_link}
                  onChange={(e) => setForm((p) => ({ ...p, payment_link: e.target.value }))}
                  placeholder="https://paypal.me/... or UPI link"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Auto-fills when sending order requests in chat</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    className="w-20"
                    value={form.display_order}
                    onChange={(e) => setForm((p) => ({ ...p, display_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label>Active</Label>
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))} />
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editing ? "Update" : "Create"} Package
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pricing.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No pricing packages yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pricing.map((p) => (
            <Card key={p.id} className={`relative transition-all ${!p.is_active ? "opacity-50" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getServiceIcon(p.service_type)}
                    <Badge variant="outline" className="text-xs">
                      {SERVICE_TYPES.find((t) => t.value === p.service_type)?.label || p.service_type}
                    </Badge>
                  </div>
                  <Switch
                    checked={p.is_active}
                    onCheckedChange={(v) => toggleActive(p.id, v)}
                  />
                </div>
                <CardTitle className="text-base mt-2">{p.package_name}</CardTitle>
                {p.description && (
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold">${Number(p.price).toFixed(2)}</div>
                {p.features.length > 0 && (
                  <ul className="space-y-1">
                    {p.features.map((f, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(p)}>
                    <Edit className="h-3 w-3" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
