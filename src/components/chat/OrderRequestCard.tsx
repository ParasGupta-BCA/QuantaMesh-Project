import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, DollarSign, ExternalLink, Loader2, ShoppingCart, AlertCircle, Clock } from "lucide-react";
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
  payment_confirmed?: boolean;
  payment_clicked_at?: string;
}

interface OrderRequestCardProps {
  data: OrderRequestData;
  messageId: string;
  conversationId: string;
  isAdmin: boolean;
}

const PAYMENT_STORAGE_KEY = "order_payment_";

export function OrderRequestCard({ data, messageId, conversationId, isAdmin }: OrderRequestCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accepting, setAccepting] = useState(false);
  const [paymentClicked, setPaymentClicked] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  const status = data.status || "pending";
  const hasPaymentLink = !!data.payment_link;

  // Restore payment state from localStorage (persists across refreshes/navigation)
  useEffect(() => {
    if (!user || isAdmin) return;
    const stored = localStorage.getItem(`${PAYMENT_STORAGE_KEY}${messageId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.clicked) setPaymentClicked(true);
        if (parsed.confirmed) setPaymentConfirmed(true);
      } catch {}
    }
    // Also check metadata from server
    if (data.payment_confirmed) {
      setPaymentConfirmed(true);
      setPaymentClicked(true);
    }
  }, [messageId, user, isAdmin, data.payment_confirmed]);

  const savePaymentState = useCallback((clicked: boolean, confirmed: boolean) => {
    localStorage.setItem(
      `${PAYMENT_STORAGE_KEY}${messageId}`,
      JSON.stringify({ clicked, confirmed, timestamp: new Date().toISOString() })
    );
  }, [messageId]);

  const handlePayNow = () => {
    if (!data.payment_link) return;
    setPaymentClicked(true);
    savePaymentState(true, false);
    window.open(data.payment_link, "_blank");
    toast({
      title: "Payment window opened",
      description: "After completing payment, click 'I've Paid' to confirm.",
    });
  };

  const handleConfirmPayment = async () => {
    if (!user) return;
    setConfirmingPayment(true);
    try {
      // Update message metadata to record payment confirmation
      const { error } = await supabase
        .from("messages")
        .update({
          metadata: { ...data, payment_confirmed: true, payment_clicked_at: new Date().toISOString() },
        })
        .eq("id", messageId);

      if (error) throw error;

      setPaymentConfirmed(true);
      savePaymentState(true, true);

      // Send a confirmation message in chat
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_type: "client",
        content: `💳 I've completed the payment for "${data.package_name}" ($${data.price}). Confirming payment now.`,
        message_type: "text",
      });

      toast({
        title: "Payment Confirmed ✓",
        description: "You can now accept and place your order.",
      });
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast({
        title: "Error",
        description: "Failed to confirm payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleAccept = async () => {
    if (!user || isAdmin) return;

    // Guard: If payment link exists, payment must be confirmed first
    if (hasPaymentLink && !paymentConfirmed) {
      if (!paymentClicked) {
        toast({
          title: "Payment Required",
          description: "Please click 'Pay Now' to complete payment before placing your order.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Confirm Payment First",
          description: "Please click 'I've Paid' to confirm your payment before placing the order.",
          variant: "destructive",
        });
      }
      return;
    }

    setAccepting(true);
    try {
      // Double-check: Prevent duplicate orders by checking if order already exists
      const { data: existingOrders, error: checkError } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user.id)
        .ilike("app_name", `%${data.package_name}%`)
        .gte("created_at", new Date(Date.now() - 60000).toISOString()); // Within last minute

      if (checkError) throw checkError;
      if (existingOrders && existingOrders.length > 0) {
        toast({
          title: "Order Already Placed",
          description: "This order has already been created. Check your orders page.",
          variant: "destructive",
        });
        setAccepting(false);
        return;
      }

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

      // Update message status to accepted
      const { error: msgError } = await supabase
        .from("messages")
        .update({
          metadata: { ...data, status: "accepted", payment_confirmed: paymentConfirmed },
        })
        .eq("id", messageId);

      if (msgError) throw msgError;

      // Send confirmation message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_type: "client",
        content: `✅ I've accepted the "${data.package_name}" package for $${data.price}. Looking forward to working together!`,
        message_type: "text",
      });

      // Clean up localStorage
      localStorage.removeItem(`${PAYMENT_STORAGE_KEY}${messageId}`);

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

  // Determine if accept button should be enabled
  const canAccept = !hasPaymentLink || paymentConfirmed;
  const isAccepted = status === "accepted";

  return (
    <div className="my-2 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm overflow-hidden max-w-[300px]">
      {/* Header */}
      <div className="px-4 py-3 bg-primary/5 border-b border-border/30 flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold">Order Request</span>
        {isAccepted && (
          <Badge className="ml-auto bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
            Accepted
          </Badge>
        )}
        {!isAccepted && hasPaymentLink && paymentConfirmed && (
          <Badge className="ml-auto bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px]">
            Paid
          </Badge>
        )}
      </div>

      {/* Body */}
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

        {/* === Client-side action buttons === */}
        {!isAdmin && !isAccepted && (
          <div className="space-y-2">
            {/* Step 1: Pay Now (if payment link exists and not yet confirmed) */}
            {hasPaymentLink && !paymentConfirmed && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={handlePayNow}
                >
                  <CreditCard className="h-4 w-4" />
                  {paymentClicked ? "Pay Again" : "Pay Now"}
                  <ExternalLink className="h-3 w-3" />
                </Button>

                {/* Step 2: Confirm payment (only after clicking Pay Now) */}
                {paymentClicked && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-green-500/30 text-green-500 hover:bg-green-500/10"
                    onClick={handleConfirmPayment}
                    disabled={confirmingPayment}
                  >
                    {confirmingPayment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    I've Paid — Confirm Payment
                  </Button>
                )}

                {/* Info message */}
                <div className="flex items-start gap-1.5 p-2 rounded-lg bg-muted/50">
                  <AlertCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {!paymentClicked
                      ? "Complete payment first to place your order."
                      : "Click 'I've Paid' after completing payment to enable order placement."}
                  </p>
                </div>
              </>
            )}

            {/* Payment confirmed badge */}
            {hasPaymentLink && paymentConfirmed && (
              <div className="flex items-center gap-2 text-green-500 text-xs font-medium justify-center py-1">
                <CheckCircle className="h-3.5 w-3.5" /> Payment Confirmed
              </div>
            )}

            {/* Step 3: Accept & Place Order */}
            <Button
              onClick={canAccept ? handleAccept : handleAccept}
              disabled={accepting || !canAccept}
              className="w-full gap-2"
              size="sm"
              title={!canAccept ? "Complete payment first" : "Accept this order request"}
            >
              {accepting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : !canAccept ? (
                <Clock className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {!canAccept ? "Pay First to Accept" : "Accept & Place Order"}
            </Button>
          </div>
        )}

        {/* Admin view: show payment link if set */}
        {isAdmin && hasPaymentLink && !isAccepted && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <CreditCard className="h-3 w-3" />
            <span className="truncate">{data.payment_link}</span>
          </div>
        )}

        {/* Accepted state */}
        {isAccepted && (
          <div className="flex items-center gap-2 text-green-500 text-xs font-medium justify-center py-1">
            <CheckCircle className="h-4 w-4" /> Order Created
          </div>
        )}
      </div>
    </div>
  );
}
