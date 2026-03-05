import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, DollarSign, ExternalLink, Loader2, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface OrderRequestData {
  service_type: string;
  package_name: string;
  price: number;
  description?: string;
  features?: string[];
  payment_link?: string;
  status?: "pending" | "accepted" | "declined";
}

interface OrderRequestCardProps {
  data: OrderRequestData;
  messageId: string;
  conversationId: string;
  isAdmin: boolean;
}

export function OrderRequestCard({ data, messageId, conversationId, isAdmin }: OrderRequestCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accepting, setAccepting] = useState(false);
  const status = data.status || "pending";

  const handleAccept = async () => {
    if (!user || isAdmin) return;
    setAccepting(true);
    try {
      const { error: orderError } = await supabase.from("orders").insert({
        user_id: user.id,
        app_name: `${data.package_name} - ${data.service_type}`,
        short_description: data.description || data.package_name,
        email: user.email || "",
        customer_name: user.user_metadata?.full_name || user.email || "Client",
        total_price: data.price,
        category: data.service_type,
        status: "pending",
        add_ons: data.features || [],
      });

      if (orderError) throw orderError;

      const { error: msgError } = await supabase
        .from("messages")
        .update({
          metadata: { ...data, status: "accepted" },
        })
        .eq("id", messageId);

      if (msgError) throw msgError;

      const { error: replyError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_type: "client",
        content: `✅ I've accepted the "${data.package_name}" package for $${data.price}. Looking forward to working together!`,
        message_type: "text",
      });

      toast({
        title: "Order Accepted! 🎉",
        description: `Your order for "${data.package_name}" has been created.`,
      });
    } catch (error) {
      console.error("Error accepting order:", error);
      toast({
        title: "Error",
        description: "Failed to accept order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="my-2 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm overflow-hidden max-w-[300px]">
      <div className="px-4 py-3 bg-primary/5 border-b border-border/30 flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold">Order Request</span>
        {status === "accepted" && (
          <Badge className="ml-auto bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
            Accepted
          </Badge>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="font-semibold text-sm">{data.package_name}</p>
          <p className="text-xs text-muted-foreground capitalize">{data.service_type.replace("-", " ")}</p>
        </div>
        {data.description && (
          <p className="text-xs text-muted-foreground">{data.description}</p>
        )}
        <div className="text-xl font-bold flex items-center gap-1">
          <DollarSign className="h-5 w-5" />
          {Number(data.price).toFixed(2)}
        </div>
        {data.features && data.features.length > 0 && (
          <ul className="space-y-1">
            {data.features.slice(0, 5).map((f, i) => (
              <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1">
                <span className="text-primary">✓</span> {f}
              </li>
            ))}
          </ul>
        )}

        {/* Payment link button */}
        {data.payment_link && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => window.open(data.payment_link, "_blank")}
          >
            <CreditCard className="h-4 w-4" />
            Pay Now
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}

        {!isAdmin && status === "pending" && (
          <Button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full gap-2"
            size="sm"
          >
            {accepting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Accept & Place Order
          </Button>
        )}
        {status === "accepted" && (
          <div className="flex items-center gap-2 text-green-500 text-xs font-medium justify-center py-1">
            <CheckCircle className="h-4 w-4" /> Order Created
          </div>
        )}
      </div>
    </div>
  );
}