import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, MessageSquare, MessagesSquare } from "lucide-react";
import { AdminChatPanel } from "@/components/chat/AdminChatPanel";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminMessages } from "@/components/admin/AdminMessages";
import { Order, ContactMessage } from "@/types/admin";

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!adminLoading && !isAdmin && user) {
      navigate("/");
      return;
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;

      try {
        const [ordersResult, messagesResult] = await Promise.all([
          supabase.from("orders").select("*").order("created_at", { ascending: false }),
          supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        ]);

        if (ordersResult.data) setOrders(ordersResult.data);
        if (messagesResult.data) setMessages(messagesResult.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status: newStatus })
        .eq("id", messageId);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: newStatus } : msg
        )
      );

      toast({
        title: "Status Updated",
        description: `Message marked as ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  if (authLoading || adminLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <p className="text-xl font-semibold">Not Authorized</p>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Admin Dashboard | QuantaMesh</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex-1 w-full bg-background text-foreground py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-7xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage orders, messages, and support inquiries
              </p>
            </div>
          </div>

          <AdminStats orders={orders} messages={messages} />

          <Tabs defaultValue="orders" className="space-y-6">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              <TabsList className="bg-secondary/50 p-1 rounded-xl h-auto flex-nowrap w-max md:w-auto inline-flex">
                <TabsTrigger value="orders" className="gap-2 rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  <Package className="h-4 w-4" />
                  Orders <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[1.25rem] text-[10px] pointer-events-none">{orders.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="messages" className="gap-2 rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  <MessageSquare className="h-4 w-4" />
                  Messages <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[1.25rem] text-[10px] pointer-events-none">{messages.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-2 rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  <MessagesSquare className="h-4 w-4" />
                  Live Chat
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="orders" className="outline-none focus:ring-0">
              <AdminOrders
                orders={orders}
                updateOrderStatus={updateOrderStatus}
                loading={loadingData}
              />
            </TabsContent>

            <TabsContent value="messages" className="outline-none focus:ring-0">
              <AdminMessages
                messages={messages}
                updateMessageStatus={updateMessageStatus}
                loading={loadingData}
              />
            </TabsContent>

            <TabsContent value="chat" className="outline-none focus:ring-0">
              <AdminChatPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}