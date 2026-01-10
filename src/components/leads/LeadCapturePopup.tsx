import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, X, Loader2, Gift, CheckCircle2, Rocket, Zap, Shield } from "lucide-react";
import { z } from "zod";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "motion/react";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Please enter a valid email").max(255, "Email too long"),
});

const POPUP_DISMISSED_KEY = "lead_popup_dismissed";
const POPUP_SUBMITTED_KEY = "lead_popup_submitted";

const features = [
  { icon: Rocket, text: "Fast Publishing" },
  { icon: Zap, text: "24hr Delivery" },
  { icon: Shield, text: "100% Safe" },
];

export function LeadCapturePopup() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
      const { error: insertError } = await supabase.from("leads").insert({
        name: validation.data.name,
        email: validation.data.email,
        source: "popup",
      });

      if (insertError) {
        if (insertError.code === "23505") {
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

      try {
        await supabase.functions.invoke("send-lead-email", {
          body: { 
            leadId: null,
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

  const PopupContent = () => (
    <div className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 p-5 sm:p-6"
          >
            {/* Close button - only for dialog on desktop */}
            {!isMobile && (
              <button
                onClick={handleDismiss}
                className="absolute right-4 top-4 rounded-full p-2 bg-muted/50 opacity-70 transition-all hover:opacity-100 hover:bg-muted focus:outline-none z-20"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            )}

            {/* Header with animated icon */}
            <div className="text-center space-y-3 mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/40"
              >
                <Gift className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
                  Get $5 OFF! 🚀
                </h2>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                  Join 500+ developers publishing apps hassle-free
                </p>
              </motion.div>
            </div>

            {/* Feature badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-2 sm:gap-3 mb-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                >
                  <feature.icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-[10px] sm:text-xs font-medium text-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="space-y-2">
                <Label htmlFor="lead-name" className="text-sm font-medium">Your Name</Label>
                <motion.div whileFocus={{ scale: 1.01 }}>
                  <Input
                    id="lead-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`h-12 text-base bg-muted/50 border-muted-foreground/20 focus:border-primary transition-all ${errors.name ? "border-destructive" : ""}`}
                  />
                </motion.div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-destructive"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-email" className="text-sm font-medium">Email Address</Label>
                <motion.div whileFocus={{ scale: 1.01 }}>
                  <Input
                    id="lead-email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`h-12 text-base bg-muted/50 border-muted-foreground/20 focus:border-primary transition-all ${errors.email ? "border-destructive" : ""}`}
                  />
                </motion.div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-destructive"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full gap-2 h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/30 transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                  Claim My Discount
                </Button>
              </motion.div>

              <p className="text-xs text-center text-muted-foreground pt-2">
                🔒 No spam, unsubscribe anytime. We respect your privacy.
              </p>
            </motion.form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative z-10 text-center py-8 sm:py-10 px-5 sm:px-6 space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold">You're In! 🎉</h2>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Check your inbox for your exclusive $5 discount code!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => setOpen(false)} 
                variant="outline" 
                className="mt-4 h-12 px-8 border-primary/30 hover:bg-primary/10"
              >
                Continue Browsing
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Use Drawer for mobile (swipe to dismiss), Dialog for desktop
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen} onClose={handleDismiss}>
        <DrawerContent className="border-t border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 max-h-[90vh]">
          <PopupContent />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 p-0 overflow-hidden">
        <PopupContent />
      </DialogContent>
    </Dialog>
  );
}
