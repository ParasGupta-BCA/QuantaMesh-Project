import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Mail,
  Instagram,
  Send,
  MessageCircle,
  Clock,
  CheckCircle
} from "lucide-react";

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('contact_messages').insert({
        user_id: user?.id || null,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'unread'
      });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });

      setIsSubmitted(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
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

  return (
    <Layout>
      <Helmet>
        <title>Contact Us - Quanta Mesh</title>
        <meta name="description" content="Get in touch with Quanta Mesh. We're here to help with your Android app publishing needs. Response within 24 hours." />
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
                        required
                      />
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
                        required
                      />
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
                      required
                    />
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
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting}
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
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
