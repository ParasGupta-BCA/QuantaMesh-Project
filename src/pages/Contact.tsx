import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { getSafeErrorMessage, logError } from "@/lib/errorMessages";
import {
  Mail,
  Instagram,
  Send,
  MessageCircle,
  Clock,
  CheckCircle,
  ShieldCheck
} from "lucide-react";

// reCAPTCHA site key from environment
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(2, "Subject must be at least 2 characters").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000, "Message must be less than 5000 characters")
});

export default function Contact() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  // Honeypot field for spam protection - bots will fill this, humans won't see it
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);

  // Load reCAPTCHA script
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      console.warn("reCAPTCHA site key not configured");
      return;
    }

    // Check if already loaded
    if (window.grecaptcha) {
      setRecaptchaLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.onload = () => {
      setRecaptchaLoaded(true);
    };
    script.onerror = () => {
      setRecaptchaError("Failed to load security verification");
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const executeRecaptcha = useCallback(async (): Promise<string | null> => {
    if (!RECAPTCHA_SITE_KEY || !window.grecaptcha) {
      return null;
    }

    try {
      await window.grecaptcha.ready(() => {});
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact_submit" });
      return token;
    } catch (error) {
      logError("reCAPTCHA execution", error);
      return null;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Honeypot check - if filled, silently reject (bot detected)
    if (honeypot) {
      // Pretend success to avoid giving bots information
      setIsSubmitted(true);
      return;
    }

    // Validate form data
    const result = contactSchema.safeParse(formData);
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

      // Execute reCAPTCHA if available
      if (RECAPTCHA_SITE_KEY && recaptchaLoaded) {
        const recaptchaToken = await executeRecaptcha();
        if (recaptchaToken) {
          // Verify reCAPTCHA on server
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-recaptcha", {
            body: { token: recaptchaToken }
          });

          if (verifyError || !verifyData?.success) {
            toast({
              title: "Security Check Failed",
              description: "Please try again or refresh the page.",
              variant: "destructive"
            });
            setIsSubmitting(false);
            return;
          }
        }
      }

      const { error } = await supabase.from('contact_messages').insert({
        user_id: user?.id || null,
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        status: 'unread'
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });

      setIsSubmitted(true);
    } catch (error: unknown) {
      logError('Contact form submission', error);
      toast({
        title: "Error",
        description: getSafeErrorMessage(error, "Failed to send message. Please try again."),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "For general inquiries",
      value: "parasgupta4494@gmail.com",
      link: "mailto:parasgupta4494@gmail.com"
    },
    {
      icon: Mail,
      title: "Business Email",
      description: "For partnerships",
      value: "Sanchitsaggi07@gmail.com",
      link: "mailto:Sanchitsaggi07@gmail.com"
    },
    {
      icon: Instagram,
      title: "Instagram",
      description: "Follow us for updates",
      value: "@quantamesh",
      link: "https://www.instagram.com/quantamesh/"
    }
  ];

  // Structured data for Contact page
  const contactStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "url": "https://www.quantamesh.store/contact",
        "name": "Contact Quanta Mesh",
        "description": "Get in touch with Quanta Mesh for Android app publishing and CGI video production inquiries.",
        "mainEntity": {
          "@type": "Organization",
          "name": "Quanta Mesh",
          "url": "https://www.quantamesh.store",
          "email": "parasgupta4494@gmail.com",
          "contactPoint": [
            {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "parasgupta4494@gmail.com",
              "availableLanguage": ["English", "Hindi"]
            },
            {
              "@type": "ContactPoint",
              "contactType": "sales",
              "email": "Sanchitsaggi07@gmail.com",
              "availableLanguage": ["English", "Hindi"]
            }
          ],
          "sameAs": ["https://www.instagram.com/quantamesh/"]
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.quantamesh.store"},
          {"@type": "ListItem", "position": 2, "name": "Contact", "item": "https://www.quantamesh.store/contact"}
        ]
      }
    ]
  };

  return (
    <Layout>
      <Helmet>
        <title>Contact Us - Get Help with App Publishing | Quanta Mesh</title>
        <meta name="description" content="Contact Quanta Mesh for Android app publishing and CGI video production inquiries. We respond within 24 hours. Email, Instagram, or use our contact form." />
        <meta name="keywords" content="contact quanta mesh, app publishing help, android app support, CGI video inquiry" />
        <link rel="canonical" href="https://www.quantamesh.store/contact" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify(contactStructuredData)}
        </script>
      </Helmet>

      <section className="pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Have questions about our app publishing service? We'd love to hear from you. Send us a message and we'll respond within 24 hours.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold mb-6">Contact Information</h2>
              
              {contactInfo.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target={item.link.startsWith("http") ? "_blank" : undefined}
                  rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="glass-card-hover rounded-xl p-4 flex items-start gap-4 block"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{item.description}</p>
                    <p className="text-sm text-primary">{item.value}</p>
                  </div>
                </a>
              ))}

              {/* Response Time */}
              <div className="glass-card rounded-xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-success" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Quick Response</h3>
                  <p className="text-sm text-muted-foreground">
                    We typically respond within 2-4 hours during business hours (9 AM - 6 PM IST).
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              {isSubmitted ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={32} className="text-success" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Message Sent!</h2>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. We've received your message and will get back to you at <strong>{formData.email}</strong> within 24 hours.
                  </p>
                  <Button variant="gradient" onClick={() => setIsSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageCircle size={24} className="text-primary" />
                    <h2 className="text-xl font-bold">Send us a Message</h2>
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
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="How can we help?"
                      maxLength={200}
                      required
                    />
                    {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us more about your project or question..."
                      rows={6}
                      maxLength={5000}
                      required
                    />
                    {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                  </div>

                  {/* Honeypot field - hidden from users, visible to bots */}
                  <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="text"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <Button
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting || (RECAPTCHA_SITE_KEY && !recaptchaLoaded)}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send size={18} className="ml-2" />
                      </>
                    )}
                  </Button>

                  {/* reCAPTCHA badge notice */}
                  {RECAPTCHA_SITE_KEY && (
                    <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1 mt-2">
                      <ShieldCheck size={14} />
                      Protected by reCAPTCHA
                    </p>
                  )}
                  {recaptchaError && (
                    <p className="text-xs text-warning text-center">{recaptchaError}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// Add grecaptcha type for TypeScript
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => Promise<void>;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}
