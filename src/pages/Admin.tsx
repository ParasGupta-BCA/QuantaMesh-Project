import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LayoutDashboard } from "lucide-react";
import { AdminChatPanel } from "@/components/chat/AdminChatPanel";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminMessages } from "@/components/admin/AdminMessages";
import { AdminReviews } from "@/components/admin/AdminReviews";
import { AdminLeads } from "@/components/admin/AdminLeads";
import { AdminEmailAnalytics } from "@/components/admin/AdminEmailAnalytics";
import { AdminVideos } from "@/components/admin/AdminVideos";
import { AdminBlog } from "@/components/admin/AdminBlog";
import { AdminAISettings } from "@/components/admin/AdminAISettings";
import { AdminColdOutreach } from "@/components/admin/AdminColdOutreach";
import { AdminColdEmailSettings } from "@/components/admin/AdminColdEmailSettings";
import { Order, ContactMessage, Review } from "@/types/admin";
import { getSafeErrorMessage, logError } from "@/lib/errorMessages";

interface AdminVideo {
  id: string;
  title: string;
  description: string | null;
  video_path: string;
  thumbnail_path: string | null;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

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
  opened_at: string | null;
  clicked_at: string | null;
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
  const [adminVideos, setAdminVideos] = useState<AdminVideo[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [activeTab, setActiveTab] = useState("dashboard");

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
      const [ordersResult, messagesResult, reviewsResult, leadsResult, emailsResult, videosResult] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("email_sequences").select("*").order("sent_at", { ascending: false }),
        supabase.from("admin_videos").select("*").order("display_order", { ascending: true }),
      ]);

      if (ordersResult.data) setOrders(ordersResult.data);
      if (messagesResult.data) setMessages(messagesResult.data);
      if (reviewsResult.data) setReviews(reviewsResult.data as Review[]);
      if (leadsResult.data) setLeads(leadsResult.data as Lead[]);
      if (emailsResult.data) setEmailSequences(emailsResult.data as EmailSequence[]);
      if (videosResult.data) setAdminVideos(videosResult.data as AdminVideo[]);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      <Helmet>
        <title>Admin Dashboard | QuantaMesh</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          orders: orders.length,
          messages: messages.length,
          reviews: reviews.length,
          leads: leads.length,
          videos: adminVideos.length
        }}
      >
        <AdminHeader title={activeTab === 'dashboard' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')} />

        <div className="flex-1 overflow-y-auto p-4 md:p-10 scrollbar-hide">
          <div className="mx-auto max-w-7xl space-y-8 pb-20">

            {/* Dashboard / Stats View */}
            {(activeTab === 'dashboard' || activeTab === 'orders') && (
              <>
                {activeTab === 'dashboard' && (
                  <div className="animate-fade-in">
                    <AdminStats orders={orders} messages={messages} />
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="animate-slide-up space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Recent Orders</h2>
                    </div>
                    <AdminOrders
                      orders={orders}
                      updateOrderStatus={updateOrderStatus}
                      loading={loadingData}
                    />
                  </div>
                )}
              </>
            )}

            {activeTab === 'messages' && (
              <div className="animate-slide-up">
                <AdminMessages
                  messages={messages}
                  updateMessageStatus={updateMessageStatus}
                  loading={loadingData}
                />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="animate-slide-up h-[calc(100vh-200px)]">
                <AdminChatPanel />
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-slide-up">
                <AdminReviews
                  reviews={reviews}
                  updateReviewApproval={updateReviewApproval}
                  loading={loadingData}
                />
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="animate-slide-up">
                <AdminLeads
                  leads={leads}
                  emailSequences={emailSequences}
                  loading={loadingData}
                  onRefresh={fetchData}
                  onUpdateStatus={updateLeadStatus}
                  onDeleteLead={deleteLead}
                />
              </div>
            )}

            {activeTab === 'email-analytics' && (
              <div className="animate-slide-up">
                <AdminEmailAnalytics emailSequences={emailSequences} />
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="animate-slide-up">
                <AdminVideos
                  videos={adminVideos}
                  onVideosChange={fetchData}
                />
              </div>
            )}

            {activeTab === 'blog' && (
              <div className="animate-slide-up">
                <AdminBlog />
              </div>
            )}

            {activeTab === 'cold-outreach' && (
              <div className="animate-slide-up space-y-8">
                <AdminColdOutreach />
                <AdminColdEmailSettings />
              </div>
            )}

            {activeTab === 'ai-settings' && (
              <div className="animate-slide-up">
                <AdminAISettings />
              </div>
            )}
          </div>
        </div>
      </AdminSidebar>
    </div>
  );
}