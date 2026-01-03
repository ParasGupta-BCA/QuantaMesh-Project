import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { getSafeErrorMessage, logError } from "@/lib/errorMessages";
import {
  Upload,
  CheckCircle,
  ArrowRight,
  Shield,
  Clock,
  CreditCard,
  LogIn,
  Package,
  Calendar,
  DollarSign,
  MessageCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Zap
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const orderSchema = z.object({
  appName: z.string().trim().min(1, "App name is required").max(50, "App name must be less than 50 characters"),
  shortDescription: z.string().trim().min(1, "Short description is required").max(80, "Short description must be 80 characters or less"),
  fullDescription: z.string().trim().max(4000, "Full description must be less than 4000 characters").optional().or(z.literal("")),
  category: z.string().optional().or(z.literal("")),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  privacyPolicyUrl: z.string().trim().max(500, "URL too long").refine(val => !val || /^https?:\/\/.+/.test(val), "Please enter a valid URL starting with http:// or https://").optional().or(z.literal("")),
  supportUrl: z.string().trim().max(500, "URL too long").refine(val => !val || /^https?:\/\/.+/.test(val), "Please enter a valid URL starting with http:// or https://").optional().or(z.literal("")),

});

const cgiOrderSchema = z.object({
  appName: z.string().trim().min(1, "Product/Brand name is required").max(100, "Name must be less than 100 characters"),
  shortDescription: z.string().trim().min(1, "Brief concept is required").max(200, "Concept must be 200 characters or less"),
  fullDescription: z.string().trim().max(4000, "Description must be less than 4000 characters").optional().or(z.literal("")),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
});

interface FormData {
  appName: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  email: string;
  name: string;
  privacyPolicyUrl: string;
  supportUrl: string;

}

interface OrderItem {
  id: string;
  created_at: string;
  app_name: string;
  status: string;
  total_price: number;
}

const includedFeatures = [
  "Professional Feature Graphic Design",
  "SEO-Optimized Store Listing Copywriting",
  "High-Quality Screenshot Enhancement",
  "Expedited Delivery (24-48 hours)"
];

export default function Order() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("new");
  const [serviceType, setServiceType] = useState<"publishing" | "cgi">("publishing");
  const [showFailedView, setShowFailedView] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    appName: "",
    shortDescription: "",
    fullDescription: "",
    category: "",
    email: "",
    name: "",
    privacyPolicyUrl: "",
    supportUrl: "",

  });
  const [files, setFiles] = useState<{
    apk: File | null;
    icon: File | null;
    featureGraphic: File | null;
    screenshots: File[];
  }>({
    apk: null,
    icon: null,
    featureGraphic: null,
    screenshots: []
  });

  const basePrice = 25;
  const totalPrice = basePrice;

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Check for tab parameter in URL or pending payment session
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const paymentParam = searchParams.get("payment");
    const isPendingPayment = sessionStorage.getItem("pendingPayment");

    if (tabParam === "history") {
      setActiveTab("history");
      sessionStorage.removeItem("pendingPayment"); // Clear flag on success
      if (user) fetchOrders();
      return;
    }

    // Check if explicitly failed OR if we have a pending payment flag (meaning they clicked back)
    if (paymentParam === "failed" || isPendingPayment) {
      setShowFailedView(true);
      // Ensure we are on the new order tab to show the message
      setActiveTab("new");
      sessionStorage.removeItem("pendingPayment"); // Clear flag so it doesn't persist
    }

    if (searchParams.get("service") === "cgi") {
      setServiceType("cgi");
    }
  }, [searchParams, user]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, app_name, status, total_price')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data as OrderItem[]);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };



  const handleFileChange = (type: 'apk' | 'icon' | 'featureGraphic', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  // Auto-save form data
  useEffect(() => {
    const savedData = localStorage.getItem("orderFormData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse saved form data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("orderFormData", JSON.stringify(formData));
  }, [formData]);

  // Calculate progress
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let completed = 0;
    const total = 6; // name, email, appName, shortDescription, apk, icon

    if (formData.name) completed++;
    if (formData.email) completed++;
    if (formData.appName) completed++;
    if (formData.shortDescription) completed++;
    if (files.apk) completed++;
    if (files.icon) completed++;

    setProgress((completed / total) * 100);
  }, [formData, files]);

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => ({ ...prev, screenshots: Array.from(e.target.files!) }));
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${folder}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('order-files')
      .upload(fileName, file);
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const schema = serviceType === 'publishing' ? orderSchema : cgiOrderSchema;
    const result = schema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast({
        title: "Validation Error",
        description: "Please check your input and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const validatedData = result.data;
      
      // Upload files if present (for publishing service)
      let apkFilePath: string | null = null;
      let iconFilePath: string | null = null;
      let featureGraphicPath: string | null = null;
      let screenshotPaths: string[] = [];

      if (serviceType === 'publishing') {
        if (files.apk) {
          apkFilePath = await uploadFile(files.apk, 'apk');
        }
        if (files.icon) {
          iconFilePath = await uploadFile(files.icon, 'icon');
        }
        if (files.featureGraphic) {
          featureGraphicPath = await uploadFile(files.featureGraphic, 'feature-graphic');
        }
        if (files.screenshots.length > 0) {
          const uploadPromises = files.screenshots.map(f => uploadFile(f, 'screenshots'));
          const results = await Promise.all(uploadPromises);
          screenshotPaths = results.filter((p): p is string => p !== null);
        }
      }

      const { error } = await supabase.from('orders').insert([{
        user_id: user!.id,
        app_name: validatedData.appName,
        short_description: validatedData.shortDescription,
        full_description: 'fullDescription' in validatedData ? validatedData.fullDescription || null : null,
        category: serviceType === 'publishing' ? (validatedData as any).category || null : 'CGI Ads',
        email: validatedData.email,
        customer_name: validatedData.name,
        privacy_policy_url: 'privacyPolicyUrl' in validatedData ? validatedData.privacyPolicyUrl || null : null,
        support_url: 'supportUrl' in validatedData ? validatedData.supportUrl || null : null,
        add_ons: [],
        total_price: serviceType === 'publishing' ? totalPrice : 0,
        status: 'pending',
        apk_file_path: apkFilePath,
        icon_file_path: iconFilePath,
        feature_graphic_path: featureGraphicPath,
        screenshot_paths: screenshotPaths.length > 0 ? screenshotPaths : null
      }] as any);

      if (error) throw error;

      localStorage.removeItem("orderFormData");

      if (serviceType === 'publishing') {
        toast({
          title: "Order Submitted!",
          description: "Redirecting to payment...",
        });

        // Redirect with tab query param and cancel url
        const baseUrl = "https://www.quantamesh.store/order";
        const successUrl = `${baseUrl}?tab=history`;
        const cancelUrl = `${baseUrl}?payment=failed`;

        const dodoUrl = `https://checkout.dodopayments.com/buy/pdt_0NUdtw0Ao78qIokxKSFMF?quantity=1&redirect_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;

        // Set session flag to detect "Back" button usage
        sessionStorage.setItem("pendingPayment", "true");

        window.location.href = dodoUrl;
      } else {
        // CGI Flow - No Payment
        toast({
          title: "Quote Request Sent!",
          description: "We will contact you shortly.",
        });
        setStep(3); // Show success view
      }

    } catch (error: unknown) {
      logError('Order submission', error);
      toast({
        title: "Error",
        description: getSafeErrorMessage(error, "Failed to submit order. Please try again."),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      appName: "",
      shortDescription: "",
      fullDescription: "",
      category: "",
      email: "",
      name: "",
      privacyPolicyUrl: "",
      supportUrl: "",
    });
    setFiles({
      apk: null,
      icon: null,
      featureGraphic: null,
      screenshots: []
    });
    setErrors({});
    localStorage.removeItem("orderFormData");

    toast({
      title: "Reset Successful",
      description: "Form has been cleared.",
    });
  };

  const isStep1Valid = formData.appName && formData.shortDescription && formData.email && formData.name;
  const isStep2Valid = files.apk && files.icon;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)] backdrop-blur-md border border-green-500/20';
      case 'submitted':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)] backdrop-blur-md border border-purple-500/20';
      case 'in progress':
      case 'processing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)] backdrop-blur-md border border-blue-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)] backdrop-blur-md border border-yellow-500/20';
      case 'rejected':
      case 'cancelled':
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)] backdrop-blur-md border border-red-500/20';
      case 'completed':
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 shadow-[0_0_10px_rgba(113,113,122,0.1)] backdrop-blur-md border border-zinc-500/20';
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] backdrop-blur-md border border-emerald-500/20';
      default:
        return 'bg-secondary/50 text-secondary-foreground border-border/20 backdrop-blur-md border';
    }
  };

  // Show login prompt if not authenticated
  if (!loading && !user) {
    return (
      <Layout>
        <Helmet>
          <title>Order App Publishing - Quanta Mesh</title>
          <meta name="description" content="Order your Android app publishing service. Sign in to get started." />
        </Helmet>

        <section className="pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <LogIn size={32} className="text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
                <p className="text-muted-foreground mb-6">
                  Please sign in or create an account to place an order. This helps us track your orders and provide better support.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="gradient" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/auth?signup=true">Create Account</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <Helmet>
          <title>Order App Publishing - Quanta Mesh</title>
        </Helmet>
        <section className="pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Order App Publishing - Start Your Launch Today | Quanta Mesh</title>
        <meta name="description" content="Ready to publish? Submit your Android app for $25. Secure payment, fast processing, and money-back guarantee. No Google Play Console account required." />
        <meta name="keywords" content="buy app publishing, order play store upload, pay for app submission, android app publishing cost" />
        <link rel="canonical" href="https://www.quantamesh.store/order" />
      </Helmet>

      <section className="pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {serviceType === 'publishing' ? (
                  <>Publish Your <span className="gradient-text">App</span></>
                ) : (
                  <>CGI Video <span className="gradient-text">Ads</span></>
                )}
              </h1>
              <p className="text-muted-foreground">
                {serviceType === 'publishing'
                  ? "Manage your orders and publish new apps"
                  : "Request a quote for premium 3D visual effects"}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="new">New Order</TabsTrigger>
                  <TabsTrigger value="history" onClick={fetchOrders}>My Orders</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="new" className="space-y-8 animate-in fade-in-50 duration-500">
                {serviceType === 'publishing' && (
                  <div className="glass-card rounded-xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 border-primary/20 bg-primary/5">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                      <div className="relative w-24 h-24 shrink-0">
                        <img
                          src="/chat-mascot.png"
                          alt="Chat with us"
                          className="w-full h-full object-contain relative z-10 animate-float"
                          style={{ animationDuration: '6s' }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Prefer to chat with us directly?</h3>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto sm:mx-0">
                          Skip the forms! Talk to our admin team to discuss your app publishing needs and get a custom quote.
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full sm:w-auto shrink-0 border-primary/50 hover:bg-primary/10 gap-2">
                      <Link to="/chat">
                        <MessageCircle size={16} />
                        Chat with Us
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Service Type Switcher */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div
                    onClick={() => setServiceType('publishing')}
                    className={`cursor-pointer rounded-xl p-4 border transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center ${serviceType === 'publishing'
                      ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]'
                      : 'bg-card/50 border-white/10 hover:border-white/20 hover:bg-white/5'
                      }`}
                  >
                    <Package size={24} className={serviceType === 'publishing' ? 'text-primary' : 'text-muted-foreground'} />
                    <span className={`font-semibold ${serviceType === 'publishing' ? 'text-foreground' : 'text-muted-foreground'}`}>App Publishing</span>
                  </div>
                  <div
                    onClick={() => setServiceType('cgi')}
                    className={`cursor-pointer rounded-xl p-4 border transition-all duration-300 flex flex-col items-center justify-center gap-2 text-center ${serviceType === 'cgi'
                      ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'bg-card/50 border-white/10 hover:border-white/20 hover:bg-white/5'
                      }`}
                  >
                    <Zap size={24} className={serviceType === 'cgi' ? 'text-purple-400' : 'text-muted-foreground'} />
                    <span className={`font-semibold ${serviceType === 'cgi' ? 'text-foreground' : 'text-muted-foreground'}`}>CGI Video Ads</span>
                  </div>
                </div>

                {serviceType === 'cgi' ? (
                  /* CGI Custom Flow */
                  <div className="glass-card rounded-2xl p-6 sm:p-8 text-center animate-fade-in border-purple-500/20 bg-purple-500/5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Let's Talk About Your Vision</h2>
                    <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg max-w-xl mx-auto">
                      Pricing for CGI Video Ads varies based on your specific requirements and complexity.
                      Please chat with us to discuss the details and place your order directly.
                    </p>

                    <Button asChild size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all duration-300 gap-2">
                      <Link to="/chat">
                        <MessageCircle size={20} />
                        Chat with Us for Details
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step >= s
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                            }`}>
                            {step > s ? <CheckCircle size={20} /> : s}
                          </div>
                          {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-secondary"}`} />}
                        </div>
                      ))}
                    </div>

                    {showFailedView ? (
                      /* Payment Failed View */
                      <div className="glass-card rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300 border-red-500/20 bg-red-500/5">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                          <XCircle size={40} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4 text-red-500">Payment Failed</h2>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                          It looks like you didn't complete your payment. Don't worry, if you submitted the order, it's saved as "Pending" in your order history.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowFailedView(false);
                              // Re-construct the checkout URL for retry
                              const baseUrl = "https://www.quantamesh.store/order";
                              const successUrl = `${baseUrl}?tab=history`;
                              const cancelUrl = `${baseUrl}?payment=failed`;
                              const dodoUrl = `https://checkout.dodopayments.com/buy/pdt_0NUdtw0Ao78qIokxKSFMF?quantity=1&redirect_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;

                              sessionStorage.setItem("pendingPayment", "true");
                              window.location.href = dodoUrl;
                            }}
                            className="gap-2"
                          >
                            <RefreshCw size={16} />
                            Retry Payment
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => {
                              setShowFailedView(false);
                              setActiveTab("history");
                              fetchOrders();
                            }}
                          >
                            Go to My Orders
                          </Button>
                        </div>
                      </div>
                    ) : step === 3 ? (
                      /* Confirmation */
                      <div className="glass-card rounded-2xl p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                          <CheckCircle size={40} className="text-success" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Order Received!</h2>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Thank you for your order! We've received your submission and will contact you at <strong>{formData.email}</strong> within 2-4 hours with payment instructions.
                        </p>
                        <div className="glass-card rounded-xl p-6 text-left mb-8">
                          <h3 className="font-semibold mb-4">What happens next?</h3>
                          <ol className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-xs font-bold">1</span>
                              <span>We'll review your submission and send a payment link</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-xs font-bold">2</span>
                              <span>After payment, we'll process your app within 24-48 hours</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-xs font-bold">3</span>
                              <span>You'll receive confirmation once submitted to Google Play</span>
                            </li>
                          </ol>
                        </div>
                        <Button variant="gradient" asChild>
                          <a href="/">Back to Home</a>
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit}>
                        {step === 1 && (
                          /* Step 1: App Details */
                          <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between gap-4 mb-6">
                              <h2 className="text-xl font-bold">App Details</h2>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  {formData.appName ? (
                                    <>
                                      <CheckCircle size={14} className="text-primary" />
                                      <span className="text-xs hidden sm:inline">Auto-saved</span>
                                    </>
                                  ) : null}
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* Mobile formatted progress */}
                                  <div className="flex items-center gap-2 py-1 px-2 rounded-full bg-secondary/30 border border-border/30">
                                    <div className="w-12 sm:w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="name">Your Name *</Label>
                                <Input
                                  id="name"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  placeholder="John Doe"
                                  maxLength={100}
                                  required
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  placeholder="john@example.com"
                                  maxLength={255}
                                  required
                                />
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="appName">App Name *</Label>
                              <Input
                                id="appName"
                                name="appName"
                                value={formData.appName}
                                onChange={handleInputChange}
                                placeholder="My Awesome App"
                                maxLength={50}
                                required
                              />
                              {errors.appName && <p className="text-xs text-destructive">{errors.appName}</p>}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="shortDescription">Short Description * (max 80 chars)</Label>
                              <Input
                                id="shortDescription"
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleInputChange}
                                placeholder="A brief description of your app"
                                maxLength={80}
                                required
                              />
                              <p className="text-xs text-muted-foreground">{formData.shortDescription.length}/80</p>
                              {errors.shortDescription && <p className="text-xs text-destructive">{errors.shortDescription}</p>}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="fullDescription">Full Description</Label>
                              <Textarea
                                id="fullDescription"
                                name="fullDescription"
                                value={formData.fullDescription}
                                onChange={handleInputChange}
                                placeholder="Detailed description of your app features..."
                                rows={5}
                                maxLength={4000}
                              />
                              {errors.fullDescription && <p className="text-xs text-destructive">{errors.fullDescription}</p>}
                            </div>

                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label htmlFor="category">Category</Label>
                                  <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground"
                                  >
                                    <option value="">Select a category</option>
                                    <option value="games">Games</option>
                                    <option value="business">Business</option>
                                    <option value="education">Education</option>
                                    <option value="entertainment">Entertainment</option>
                                    <option value="lifestyle">Lifestyle</option>
                                    <option value="productivity">Productivity</option>
                                    <option value="tools">Tools</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="privacyPolicyUrl">Privacy Policy URL</Label>
                                  <Input
                                    id="privacyPolicyUrl"
                                    name="privacyPolicyUrl"
                                    value={formData.privacyPolicyUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://yoursite.com/privacy"
                                    maxLength={500}
                                  />
                                  {errors.privacyPolicyUrl && <p className="text-xs text-destructive">{errors.privacyPolicyUrl}</p>}
                                </div>
                              </div>
                            </>

                            <div className="flex justify-between pt-4">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button type="button" variant="ghost" className="text-muted-foreground hover:text-destructive">
                                    Reset Form
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl">
                                  <AlertDialogHeader className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                                      <AlertTriangle className="h-6 w-6 text-red-500" />
                                    </div>
                                    <AlertDialogTitle className="text-xl">Reset Form?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-center">
                                      This will clear all your entries. Auto-saved data will also be deleted. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-3 mt-6 w-full">
                                    <AlertDialogCancel className="w-full sm:w-auto min-w-[100px] bg-white/5 hover:bg-white/10 border border-white/10 text-white focus-visible:ring-white/20 focus-visible:ring-offset-0">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleReset}
                                      className="w-full sm:w-auto min-w-[120px] bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] border-0 focus-visible:ring-red-500 focus-visible:ring-offset-0"
                                    >
                                      Reset Everything
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <Button
                                type="button"
                                variant="gradient"
                                onClick={() => setStep(2)}
                                disabled={!isStep1Valid}
                              >
                                Continue
                                <ArrowRight className="ml-2" size={18} />
                              </Button>
                            </div>
                          </div>
                        )}

                        {step === 2 && (
                          /* Step 2: Files & Payment */
                          <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between gap-4 mb-6">
                              <h2 className="text-xl font-bold">Upload Files</h2>
                              <div className="flex items-center gap-2 py-1 px-2 rounded-full bg-secondary/30 border border-border/30">
                                <div className="w-12 sm:w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
                              </div>
                            </div>

                            {/* File Uploads */}
                            <div className="space-y-6">
                              {serviceType === 'publishing' ? (
                                <div className="space-y-2">
                                  <Label>App File (APK/AAB) *</Label>
                                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${files.apk ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                    }`}>
                                    <input
                                      type="file"
                                      accept=".apk,.aab"
                                      onChange={(e) => handleFileChange('apk', e)}
                                      className="hidden"
                                      id="apk-upload"
                                    />
                                    <label htmlFor="apk-upload" className="cursor-pointer">
                                      {files.apk ? (
                                        <div className="flex items-center justify-center gap-2 text-primary">
                                          <CheckCircle size={20} />
                                          <span>{files.apk.name}</span>
                                        </div>
                                      ) : (
                                        <div className="text-muted-foreground">
                                          <Upload size={32} className="mx-auto mb-2" />
                                          <p>Click to upload APK or AAB</p>
                                        </div>
                                      )}
                                    </label>
                                  </div>
                                </div>
                              ) : null}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <Label>App Icon (512x512 PNG) *</Label>
                                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${files.icon ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                    }`}>
                                    <input
                                      type="file"
                                      accept="image/png"
                                      onChange={(e) => handleFileChange('icon', e)}
                                      className="hidden"
                                      id="icon-upload"
                                    />
                                    <label htmlFor="icon-upload" className="cursor-pointer text-sm">
                                      {files.icon ? (
                                        <span className="text-primary flex items-center justify-center gap-2">
                                          <CheckCircle size={16} />
                                          {files.icon.name}
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground">Upload Icon</span>
                                      )}
                                    </label>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Feature Graphic (1024x500)</Label>
                                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${files.featureGraphic ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                    }`}>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleFileChange('featureGraphic', e)}
                                      className="hidden"
                                      id="feature-upload"
                                    />
                                    <label htmlFor="feature-upload" className="cursor-pointer text-sm">
                                      {files.featureGraphic ? (
                                        <span className="text-primary flex items-center justify-center gap-2">
                                          <CheckCircle size={16} />
                                          {files.featureGraphic.name}
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground">Upload Graphic</span>
                                      )}
                                    </label>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Screenshots (2-8 images)</Label>
                                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${files.screenshots.length > 0 ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                  }`}>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleScreenshotsChange}
                                    className="hidden"
                                    id="screenshots-upload"
                                  />
                                  <label htmlFor="screenshots-upload" className="cursor-pointer">
                                    {files.screenshots.length > 0 ? (
                                      <div className="text-primary">
                                        <CheckCircle size={20} className="mx-auto mb-2" />
                                        <p>{files.screenshots.length} screenshot(s) selected</p>
                                      </div>
                                    ) : (
                                      <div className="text-muted-foreground">
                                        <Upload size={24} className="mx-auto mb-2" />
                                        <p>Upload screenshots</p>
                                      </div>
                                    )}
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Included Features */}
                            <div className="space-y-4">
                              <Label>What's Included in the Package</Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {includedFeatures.map((feature, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 cursor-default"
                                  >
                                    <div className="h-4 w-4 shrink-0 rounded-full bg-primary flex items-center justify-center">
                                      <CheckCircle className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                    <span className="text-sm font-medium">{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Summary */}
                            <div className="glass-card rounded-xl p-6">
                              <h3 className="font-semibold mb-4">Order Summary</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Base Package</span>
                                  <span>$25.00</span>
                                </div>
                                <div className="text-xs text-primary mt-2">
                                  + All premium features included
                                </div>
                                <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-lg">
                                  <span>Total</span>
                                  <span className="gradient-text">${totalPrice}.00</span>
                                </div>
                              </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Shield size={18} className="text-primary" />
                                <span>Secure Payment</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={18} className="text-primary" />
                                <span>24-48h Delivery</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CreditCard size={18} className="text-primary" />
                                <span>Stripe / PayPal</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="flex-1"
                              >
                                Back
                              </Button>
                              <Button
                                type="submit"
                                variant="hero"
                                disabled={!isStep2Valid || isSubmitting}
                                className="flex-1"
                              >
                                {isSubmitting ? "Submitting..." : `Submit Order - $${totalPrice}`}
                              </Button>
                            </div>
                          </div>
                        )}
                      </form>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-6 animate-in fade-in-50 duration-500">
                {loadingOrders ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="glass-card rounded-2xl p-8 text-center py-16">
                    <Package size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                      You haven't placed any orders yet. Start by filling out the form in the "New Order" tab.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-md shadow-lg hover:bg-white/10 transition-colors duration-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-lg font-bold text-white">
                            {order.app_name}
                          </CardTitle>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-2">
                            <div className="flex items-center gap-2 text-gray-300">
                              <Calendar size={14} />
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <DollarSign size={14} />
                              <span>${order.total_price}</span>
                            </div>
                            <div className="text-xs text-gray-400 font-mono truncate">
                              ID: {order.id}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </Layout>
  );
}
