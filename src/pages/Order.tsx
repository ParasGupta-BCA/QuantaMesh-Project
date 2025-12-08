import { useState } from "react";
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
import {
  Upload,
  CheckCircle,
  ArrowRight,
  Shield,
  Clock,
  CreditCard
} from "lucide-react";

interface FormData {
  appName: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  email: string;
  name: string;
  privacyPolicyUrl: string;
  supportUrl: string;
  addOns: string[];
}

const addOnOptions = [
  { id: "feature-graphic", label: "Feature Graphic Design (+$15)", price: 15 },
  { id: "copywriting", label: "Store Listing Copywriting (+$20)", price: 20 },
  { id: "expedited", label: "Expedited Delivery (+$10)", price: 10 },
  { id: "screenshots", label: "Screenshot Enhancement (+$25)", price: 25 }
];

export default function Order() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    appName: "",
    shortDescription: "",
    fullDescription: "",
    category: "",
    email: "",
    name: "",
    privacyPolicyUrl: "",
    supportUrl: "",
    addOns: []
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
  const addOnsTotal = formData.addOns.reduce((sum, id) => {
    const addon = addOnOptions.find(a => a.id === id);
    return sum + (addon?.price || 0);
  }, 0);
  const totalPrice = basePrice + addOnsTotal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddOnToggle = (addonId: string) => {
    setFormData(prev => ({
      ...prev,
      addOns: prev.addOns.includes(addonId)
        ? prev.addOns.filter(id => id !== addonId)
        : [...prev.addOns, addonId]
    }));
  };

  const handleFileChange = (type: 'apk' | 'icon' | 'featureGraphic', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => ({ ...prev, screenshots: Array.from(e.target.files!) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        app_name: formData.appName,
        short_description: formData.shortDescription,
        full_description: formData.fullDescription || null,
        category: formData.category || null,
        email: formData.email,
        customer_name: formData.name,
        privacy_policy_url: formData.privacyPolicyUrl || null,
        support_url: formData.supportUrl || null,
        add_ons: formData.addOns,
        total_price: totalPrice,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Order Submitted!",
        description: "We'll contact you shortly with payment details.",
      });

      setStep(3);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.appName && formData.shortDescription && formData.email && formData.name;
  const isStep2Valid = files.apk && files.icon;

  return (
    <Layout>
      <Helmet>
        <title>Order App Publishing - Quanta Mesh</title>
        <meta name="description" content="Order your Android app publishing service. Complete the form, upload your assets, and we'll have your app on Google Play within 24-48 hours." />
      </Helmet>

      <section className="pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Publish Your <span className="gradient-text">App</span>
              </h1>
              <p className="text-muted-foreground">
                Complete the form below to get started
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-12">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {step > s ? <CheckCircle size={20} /> : s}
                  </div>
                  {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-secondary"}`} />}
                </div>
              ))}
            </div>

            {step === 3 ? (
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
                    <h2 className="text-xl font-bold mb-6">App Details</h2>
                    
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
                      <Label htmlFor="appName">App Name *</Label>
                      <Input
                        id="appName"
                        name="appName"
                        value={formData.appName}
                        onChange={handleInputChange}
                        placeholder="My Awesome App"
                        required
                      />
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
                      />
                    </div>

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
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
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
                    <h2 className="text-xl font-bold mb-6">Upload Files & Checkout</h2>

                    {/* File Uploads */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>App File (APK/AAB) *</Label>
                        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                          files.apk ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>App Icon (512x512 PNG) *</Label>
                          <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                            files.icon ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
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
                          <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                            files.featureGraphic ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
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
                        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                          files.screenshots.length > 0 ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
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

                    {/* Add-ons */}
                    <div className="space-y-4">
                      <Label>Optional Add-ons</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {addOnOptions.map((addon) => (
                          <div
                            key={addon.id}
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                              formData.addOns.includes(addon.id)
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => handleAddOnToggle(addon.id)}
                          >
                            <Checkbox
                              checked={formData.addOns.includes(addon.id)}
                              onCheckedChange={() => handleAddOnToggle(addon.id)}
                            />
                            <span className="text-sm">{addon.label}</span>
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
                        {formData.addOns.map((id) => {
                          const addon = addOnOptions.find(a => a.id === id);
                          return addon ? (
                            <div key={id} className="flex justify-between">
                              <span className="text-muted-foreground">{addon.label.split(' (+')[0]}</span>
                              <span>${addon.price}.00</span>
                            </div>
                          ) : null;
                        })}
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
          </div>
        </div>
      </section>
    </Layout>
  );
}
