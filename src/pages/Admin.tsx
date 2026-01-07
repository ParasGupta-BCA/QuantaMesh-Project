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
import { Loader2, Package, MessageSquare, MessagesSquare, LayoutDashboard, Star, Users } from "lucide-react";
import { AdminChatPanel } from "@/components/chat/AdminChatPanel";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminMessages } from "@/components/admin/AdminMessages";
import { AdminReviews } from "@/components/admin/AdminReviews";
import { AdminLeads } from "@/components/admin/AdminLeads";
import { Order, ContactMessage, Review } from "@/types/admin";
import { getSafeErrorMessage, logError } from "@/lib/errorMessages";

interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  status: string;
  niche: string | null;
  notes: string | null;
  created_at: string;
  last_contacted_at: string | null;
}

interface EmailSequence {
  id: string;
  lead_id: string;
  sequence_type: string;
  subject: string;
  content: string;
  sent_at: string;
  status: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [emailSequences, setEmailSequences] = useState<EmailSequence[]>([]);
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

  const fetchData = async () => {
    if (!isAdmin) return;

    try {
      const [ordersResult, messagesResult, reviewsResult, leadsResult, emailsResult] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("email_sequences").select("*").order("sent_at", { ascending: false }),
      ]);

      if (ordersResult.data) setOrders(ordersResult.data);
      if (messagesResult.data) setMessages(messagesResult.data);
      if (reviewsResult.data) setReviews(reviewsResult.data as Review[]);
      if (leadsResult.data) setLeads(leadsResult.data as Lead[]);
      if (emailsResult.data) setEmailSequences(emailsResult.data as EmailSequence[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("leads").update({ status: newStatus }).eq("id", leadId);
      if (error) throw error;
      setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead)));
      toast({ title: "Lead Updated", description: `Status changed to ${newStatus}` });
    } catch (error: unknown) {
      logError("Update lead status", error);
      toast({ title: "Error", description: getSafeErrorMessage(error, "Failed to update"), variant: "destructive" });
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase.from("leads").delete().eq("id", leadId);
      if (error) throw error;
      setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
      toast({ title: "Lead Deleted" });
    } catch (error: unknown) {
      logError("Delete lead", error);
      toast({ title: "Error", description: getSafeErrorMessage(error, "Failed to delete"), variant: "destructive" });
    }
  };

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
    } catch (error: unknown) {
      logError('Update order status', error);
      toast({
        title: "Error",
        description: getSafeErrorMessage(error, "Failed to update status"),
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
    } catch (error: unknown) {
      logError('Update message status', error);
      toast({
        title: "Error",
        description: getSafeErrorMessage(error, "Failed to update status"),
        variant: "destructive",
      });
    }
  };

  const updateReviewApproval = async (reviewId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved: approved })
        .eq("id", reviewId);

      if (error) throw error;

      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, is_approved: approved } : review
        )
      );

      toast({
        title: approved ? "Review Approved" : "Review Unapproved",
        description: approved ? "Review is now visible on the website" : "Review has been hidden",
      });
    } catch (error: unknown) {
      logError("Update review approval", error);
      toast({
        title: "Error",
        description: getSafeErrorMessage(error, "Failed to update review"),
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

      <div className="flex-1 w-full bg-background text-foreground py-6 md:py-10 pb-20">
        <div className="container mx-auto px-4 max-w-7xl space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col gap-2 animate-fade-in relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 w-fit text-primary font-medium text-xs mb-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Control Center</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              Overview of your application's performance, orders, and customer messages.
            </p>
          </div>

          <AdminStats orders={orders} messages={messages} />

          <Tabs defaultValue="orders" className="space-y-6">
            <div className="sticky top-[60px] z-30 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4 md:mx-0 md:px-0 border-b border-border/50 md:border-none md:static md:bg-transparent md:backdrop-blur-none transition-all">
              <TabsList className="bg-secondary/40 p-1 rounded-2xl h-auto flex-nowrap w-full md:w-fit overflow-x-auto scrollbar-hide justify-start">
                <TabsTrigger 
                  value="orders" 
                  className="gap-2 rounded-xl px-4 py-2.5 flex-1 md:flex-none text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Package className="h-4 w-4" />
                  Orders <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[1.25rem] text-[10px] pointer-events-none bg-primary/10 text-primary border-none">{orders.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="messages" 
                  className="gap-2 rounded-xl px-4 py-2.5 flex-1 md:flex-none text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[1.25rem] text-[10px] pointer-events-none bg-primary/10 text-primary border-none">{messages.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  className="gap-2 rounded-xl px-4 py-2.5 flex-1 md:flex-none text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <MessagesSquare className="h-4 w-4" />
                  Live Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews" 
                  className="gap-2 rounded-xl px-4 py-2.5 flex-1 md:flex-none text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Star className="h-4 w-4" />
                  Reviews <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[1.25rem] text-[10px] pointer-events-none bg-primary/10 text-primary border-none">{reviews.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="leads" 
                  className="gap-2 rounded-xl px-4 py-2.5 flex-1 md:flex-none text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Users className="h-4 w-4" />
                  Leads <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[1.25rem] text-[10px] pointer-events-none bg-primary/10 text-primary border-none">{leads.length}</Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="orders" className="outline-none focus:ring-0 animate-slide-up">
              <AdminOrders
                orders={orders}
                updateOrderStatus={updateOrderStatus}
                loading={loadingData}
              />
            </TabsContent>

            <TabsContent value="messages" className="outline-none focus:ring-0 animate-slide-up">
              <AdminMessages
                messages={messages}
                updateMessageStatus={updateMessageStatus}
                loading={loadingData}
              />
            </TabsContent>

            <TabsContent value="chat" className="outline-none focus:ring-0 animate-slide-up">
              <AdminChatPanel />
            </TabsContent>

            <TabsContent value="reviews" className="outline-none focus:ring-0 animate-slide-up">
              <AdminReviews
                reviews={reviews}
                updateReviewApproval={updateReviewApproval}
                loading={loadingData}
              />
            </TabsContent>

            <TabsContent value="leads" className="outline-none focus:ring-0 animate-slide-up">
              <AdminLeads
                leads={leads}
                emailSequences={emailSequences}
                loading={loadingData}
                onRefresh={fetchData}
                onUpdateStatus={updateLeadStatus}
                onDeleteLead={deleteLead}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}