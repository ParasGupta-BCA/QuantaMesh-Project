import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Package,
  MessageSquare,
  DollarSign,
  ExternalLink,
  Mail,
  User,
  Calendar,
  FileText,
  Tag,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  email: string;
  app_name: string;
  short_description: string;
  full_description: string | null;
  category: string | null;
  privacy_policy_url: string | null;
  support_url: string | null;
  add_ons: string[] | null;
  status: string;
  total_price: number;
  created_at: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const orderStatuses = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "submitted", label: "Submitted to Play Store" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

const messageStatuses = [
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
];

const addOnLabels: Record<string, string> = {
  "feature-graphic": "Feature Graphic Design",
  "copywriting": "Store Listing Copywriting",
  "expedited": "Expedited Delivery",
  "screenshots": "Screenshot Enhancement",
};

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

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

      setOrders(prev =>
        prev.map(order =>
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

      setMessages(prev =>
        prev.map(msg =>
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

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const toggleMessageExpand = (messageId: string) => {
    setExpandedMessages(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
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
    return null;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      in_progress: "default",
      submitted: "default",
      published: "default",
      completed: "default",
      rejected: "destructive",
      unread: "destructive",
      read: "outline",
      replied: "default",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const unreadMessages = messages.filter(m => m.status === "unread").length;

  return (
    <Layout>
      <Helmet>
        <title>Admin Dashboard | QuantaMesh</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage orders and messages</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">{pendingOrders} pending</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{messages.length}</div>
                <p className="text-xs text-muted-foreground">{unreadMessages} unread</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${orders.reduce((sum, order) => sum + Number(order.total_price), 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${orders.length > 0 
                    ? (orders.reduce((sum, order) => sum + Number(order.total_price), 0) / orders.length).toFixed(2)
                    : "0.00"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="bg-secondary">
              <TabsTrigger value="orders" className="gap-2">
                <Package className="h-4 w-4" />
                Orders ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages ({messages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              {loadingData ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No orders yet
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="glass-card overflow-hidden">
                      <CardContent className="p-0">
                        {/* Order Header */}
                        <div
                          className="p-4 md:p-6 cursor-pointer hover:bg-secondary/30 transition-colors"
                          onClick={() => toggleOrderExpand(order.id)}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-lg truncate">{order.app_name}</h3>
                                {getStatusBadge(order.status)}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {order.customer_name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {order.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(order.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-primary text-xl">${order.total_price}</span>
                              {expandedOrders.has(order.id) ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Order Details */}
                        {expandedOrders.has(order.id) && (
                          <div className="border-t border-border p-4 md:p-6 bg-secondary/20 space-y-6">
                            {/* Status Management */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <span className="text-sm font-medium">Update Status:</span>
                              <Select
                                value={order.status}
                                onValueChange={(value) => updateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-full sm:w-[200px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {orderStatuses.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`mailto:${order.email}`, "_blank")}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Email Customer
                              </Button>
                            </div>

                            {/* App Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">App Information</h4>
                                
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <FileText className="h-3 w-3" /> Short Description
                                    </span>
                                    <p className="text-sm mt-1">{order.short_description}</p>
                                  </div>

                                  {order.full_description && (
                                    <div>
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <FileText className="h-3 w-3" /> Full Description
                                      </span>
                                      <p className="text-sm mt-1 whitespace-pre-wrap">{order.full_description}</p>
                                    </div>
                                  )}

                                  {order.category && (
                                    <div>
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Tag className="h-3 w-3" /> Category
                                      </span>
                                      <p className="text-sm mt-1 capitalize">{order.category}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Links & Add-ons</h4>
                                
                                <div className="space-y-3">
                                  {order.privacy_policy_url && (
                                    <div>
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <LinkIcon className="h-3 w-3" /> Privacy Policy
                                      </span>
                                      <a
                                        href={order.privacy_policy_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                                      >
                                        {order.privacy_policy_url}
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </div>
                                  )}

                                  {order.support_url && (
                                    <div>
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <LinkIcon className="h-3 w-3" /> Support URL
                                      </span>
                                      <a
                                        href={order.support_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                                      >
                                        {order.support_url}
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </div>
                                  )}

                                  {order.add_ons && order.add_ons.length > 0 && (
                                    <div>
                                      <span className="text-xs text-muted-foreground">Add-ons Selected</span>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {order.add_ons.map((addon) => (
                                          <Badge key={addon} variant="outline">
                                            {addOnLabels[addon] || addon}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Order ID */}
                            <div className="pt-4 border-t border-border">
                              <span className="text-xs text-muted-foreground">Order ID: {order.id}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="messages">
              {loadingData ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No messages yet
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <Card key={message.id} className="glass-card overflow-hidden">
                      <CardContent className="p-0">
                        {/* Message Header */}
                        <div
                          className="p-4 md:p-6 cursor-pointer hover:bg-secondary/30 transition-colors"
                          onClick={() => toggleMessageExpand(message.id)}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold truncate">{message.subject}</h3>
                                {getStatusBadge(message.status)}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {message.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {message.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(message.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div>
                              {expandedMessages.has(message.id) ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Message Details */}
                        {expandedMessages.has(message.id) && (
                          <div className="border-t border-border p-4 md:p-6 bg-secondary/20 space-y-4">
                            {/* Status Management */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <span className="text-sm font-medium">Update Status:</span>
                              <Select
                                value={message.status}
                                onValueChange={(value) => updateMessageStatus(message.id, value)}
                              >
                                <SelectTrigger className="w-full sm:w-[200px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {messageStatuses.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`mailto:${message.email}?subject=Re: ${message.subject}`, "_blank")}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Reply via Email
                              </Button>
                            </div>

                            {/* Message Content */}
                            <div>
                              <span className="text-xs text-muted-foreground">Message</span>
                              <p className="text-sm mt-2 whitespace-pre-wrap bg-background/50 p-4 rounded-lg">
                                {message.message}
                              </p>
                            </div>

                            {/* Message ID */}
                            <div className="pt-4 border-t border-border">
                              <span className="text-xs text-muted-foreground">Message ID: {message.id}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}