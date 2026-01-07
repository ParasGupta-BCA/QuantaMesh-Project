import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, X, Loader2, Gift, CheckCircle2 } from "lucide-react";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Please enter a valid email").max(255, "Email too long"),
});

const POPUP_DISMISSED_KEY = "lead_popup_dismissed";
const POPUP_SUBMITTED_KEY = "lead_popup_submitted";

export function LeadCapturePopup() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const { toast } = useToast();

  const shouldShowPopup = useCallback(() => {
    const dismissed = localStorage.getItem(POPUP_DISMISSED_KEY);
    const submitted = localStorage.getItem(POPUP_SUBMITTED_KEY);
    return !dismissed && !submitted;
  }, []);

  // Timer trigger - after 5 seconds
  useEffect(() => {
    if (!shouldShowPopup()) return;
    
    const timer = setTimeout(() => {
      setOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [shouldShowPopup]);

  // Scroll trigger - after scrolling 50%
  useEffect(() => {
    if (!shouldShowPopup()) return;

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= 50) {
        setOpen(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shouldShowPopup]);

  // Exit intent trigger
  useEffect(() => {
    if (!shouldShowPopup()) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setOpen(true);
        document.removeEventListener("mouseout", handleMouseLeave);
      }
    };

    document.addEventListener("mouseout", handleMouseLeave);
    return () => document.removeEventListener("mouseout", handleMouseLeave);
  }, [shouldShowPopup]);

  const handleDismiss = () => {
    setOpen(false);
    localStorage.setItem(POPUP_DISMISSED_KEY, Date.now().toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = leadSchema.safeParse({ name, email });
    if (!validation.success) {
      const fieldErrors: { name?: string; email?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "name") fieldErrors.name = err.message;
        if (err.path[0] === "email") fieldErrors.email = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      // Insert lead into database
      const { error: insertError } = await supabase.from("leads").insert({
        name: validation.data.name,
        email: validation.data.email,
        source: "popup",
      });

      if (insertError) {
        if (insertError.code === "23505") {
          // Duplicate email
          toast({
            title: "Already subscribed!",
            description: "This email is already registered. We'll be in touch soon!",
          });
          setSubmitted(true);
          localStorage.setItem(POPUP_SUBMITTED_KEY, "true");
          return;
        }
        throw insertError;
      }

      // Trigger welcome email via edge function
      try {
        await supabase.functions.invoke("send-lead-email", {
          body: { 
            leadId: null, // Will be fetched by email
            email: validation.data.email,
            name: validation.data.name,
            sequenceType: "welcome" 
          },
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      setSubmitted(true);
      localStorage.setItem(POPUP_SUBMITTED_KEY, "true");
      
      toast({
        title: "🎉 Welcome aboard!",
        description: "Check your email for a special surprise!",
      });
    } catch (error) {
      console.error("Lead capture error:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {!submitted ? (
          <>
            <DialogHeader className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
                <Gift className="h-8 w-8 text-primary-foreground" />
              </div>
              <DialogTitle className="text-2xl font-bold">
                Get $5 OFF Your First App! 🚀
              </DialogTitle>
              <DialogDescription className="text-base">
                Join 500+ developers who publish apps without the hassle. Get exclusive tips & a discount code!
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="lead-name">Your Name</Label>
                <Input
                  id="lead-name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-email">Email Address</Label>
                <Input
                  id="lead-email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Claim My Discount
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                No spam, unsubscribe anytime. We respect your privacy.
              </p>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <DialogTitle className="text-2xl font-bold">
              You're In! 🎉
            </DialogTitle>
            <DialogDescription className="text-base">
              Check your inbox for your exclusive $5 discount code and welcome guide!
            </DialogDescription>
            <Button onClick={() => setOpen(false)} variant="outline" className="mt-4">
              Continue Browsing
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
