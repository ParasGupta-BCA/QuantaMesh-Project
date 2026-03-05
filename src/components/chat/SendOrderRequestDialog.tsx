import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ServicePricing {
  id: string;
  service_type: string;
  package_name: string;
  description: string | null;
  price: number;
  features: string[];
}

interface SendOrderRequestDialogProps {
  onSend: (content: string, metadata: any) => Promise<void>;
  disabled?: boolean;
}

export function SendOrderRequestDialog({ onSend, disabled }: SendOrderRequestDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [packages, setPackages] = useState<ServicePricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [customMode, setCustomMode] = useState(false);
  const [custom, setCustom] = useState({
    service_type: "website",
    package_name: "",
    description: "",
    price: "",
    features: "",
    payment_link: "",
  });

  useEffect(() => {
    if (open) {
      setLoading(true);
      supabase
        .from("service_pricing")
        .select("*")
        .eq("is_active", true)
        .order("display_order")
        .then(({ data }) => {
          setPackages(
            (data || []).map((p: any) => ({
              ...p,
              features: Array.isArray(p.features) ? p.features : [],
            }))
          );
          setLoading(false);
        });
    }
  }, [open]);

  const handleSend = async () => {
    setSending(true);
    try {
      let orderData: any;

      if (customMode) {
        if (!custom.package_name || !custom.price) {
          toast({ title: "Error", description: "Name and price required", variant: "destructive" });
          setSending(false);
          return;
        }
        orderData = {
          service_type: custom.service_type,
          package_name: custom.package_name,
          description: custom.description,
          price: parseFloat(custom.price),
          features: custom.features.split("\n").filter((f) => f.trim()),
          payment_link: custom.payment_link || undefined,
          status: "pending",
        };
      } else {
        const pkg = packages.find((p) => p.id === selectedPackageId);
        if (!pkg) {
          toast({ title: "Error", description: "Please select a package", variant: "destructive" });
          setSending(false);
          return;
        }
        orderData = {
          service_type: pkg.service_type,
          package_name: pkg.package_name,
          description: pkg.description,
          price: pkg.price,
          features: pkg.features,
          status: "pending",
        };
      }

      const content = `📦 Order Request: ${orderData.package_name} — $${Number(orderData.price).toFixed(2)}`;
      await onSend(content, orderData);
      setOpen(false);
      setSelectedPackageId("");
      setCustom({ service_type: "website", package_name: "", description: "", price: "", features: "" });
      toast({ title: "Order request sent!" });
    } catch (error) {
      console.error("Error sending order request:", error);
      toast({ title: "Error", description: "Failed to send", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-10 w-10 shrink-0 rounded-xl"
          title="Send Order Request"
        >
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Send Order Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex gap-2">
            <Button
              variant={!customMode ? "default" : "outline"}
              size="sm"
              onClick={() => setCustomMode(false)}
            >
              From Packages
            </Button>
            <Button
              variant={customMode ? "default" : "outline"}
              size="sm"
              onClick={() => setCustomMode(true)}
            >
              Custom Quote
            </Button>
          </div>

          {!customMode ? (
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : packages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No packages available. Create one in Service Pricing settings.
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPackageId === pkg.id
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{pkg.package_name}</span>
                        <span className="font-bold text-sm">${Number(pkg.price).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">{pkg.service_type.replace("-", " ")}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Service Type</Label>
                <Select value={custom.service_type} onValueChange={(v) => setCustom((p) => ({ ...p, service_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website Dev</SelectItem>
                    <SelectItem value="app-dev">App Dev</SelectItem>
                    <SelectItem value="cgi">CGI Ads</SelectItem>
                    <SelectItem value="publishing">Publishing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Package Name</Label>
                <Input
                  value={custom.package_name}
                  onChange={(e) => setCustom((p) => ({ ...p, package_name: e.target.value }))}
                  placeholder="e.g. Custom Website Package"
                />
              </div>
              <div>
                <Label className="text-xs">Price ($)</Label>
                <Input
                  type="number"
                  value={custom.price}
                  onChange={(e) => setCustom((p) => ({ ...p, price: e.target.value }))}
                  placeholder="199.00"
                />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input
                  value={custom.description}
                  onChange={(e) => setCustom((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description"
                />
              </div>
              <div>
                <Label className="text-xs">Features (one per line)</Label>
                <Textarea
                  value={custom.features}
                  onChange={(e) => setCustom((p) => ({ ...p, features: e.target.value }))}
                  placeholder="Feature 1&#10;Feature 2"
                  rows={3}
                />
              </div>
            </div>
          )}

          <Button onClick={handleSend} disabled={sending} className="w-full gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            Send Order Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
