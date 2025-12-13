import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Check,
  ArrowRight,
  FileText,
  Image,
  Zap,
  Shield,
  Clock,
  RefreshCw,
  Plus
} from "lucide-react";

const includedFeatures = [
  "App submission to Google Play Console",
  "Metadata entry (title, descriptions, category)",
  "Keyword optimization for discoverability",
  "Screenshot and graphics upload",
  "App icon setup (all required sizes)",
  "Content rating questionnaire completion",
  "Privacy policy linkage",
  "Pre-submission policy compliance check",
  "48-hour post-publish support"
];

const whatYouProvide = [
  {
    icon: FileText,
    title: "App File",
    description: "Your compiled APK or AAB file ready for distribution"
  },
  {
    icon: Image,
    title: "Visual Assets",
    description: "App icon (512x512), feature graphic (1024x500), 2-8 screenshots per device"
  },
  {
    icon: Shield,
    title: "Privacy Policy",
    description: "URL to your hosted privacy policy (required by Google)"
  },
  {
    icon: FileText,
    title: "App Details",
    description: "App name, descriptions, category, contact email, and support URL"
  }
];

const addOns = [
  {
    title: "Feature Graphic Design",
    price: "$15",
    description: "Professional 1024x500 feature graphic design"
  },
  {
    title: "Store Listing Copywriting",
    price: "$20",
    description: "SEO-optimized app descriptions written by professionals"
  },
  {
    title: "Expedited Delivery",
    price: "$10",
    description: "Priority processing - submission within 12 hours"
  },
  {
    title: "Screenshot Enhancement",
    price: "$25",
    description: "Professional mockups and frames for all your screenshots"
  }
];

export default function Services() {
  return (
    <Layout>
      <Helmet>
        <title>Android App Publishing Service | Google Play Console | $25 Package</title>
        <meta name="description" content="Get your Android app published on Google Play Store for just $25. Complete service includes metadata optimization, icon setup, and policy compliance. 24-48h delivery." />
        <link rel="canonical" href="https://quantamesh.com/services" />
      </Helmet>

      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                The Complete <span className="gradient-text">$25 Package</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                Everything you need to get your Android app published on Google Play Store, professionally handled from start to finish.
              </p>
              <Button variant="hero" size="xl" asChild>
                <Link to="/order" className="group">
                  Order Now
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <div className="relative animate-fade-in mx-auto w-full max-w-md lg:max-w-full">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border/50 bg-card/50 backdrop-blur-sm transform hover:scale-[1.02] transition-transform duration-500">
                <img
                  src="/Service 1.png"
                  alt="App Publishing Service Overview"
                  className="w-full h-auto object-cover"
                />
                {/* Overlay gradient for better blending */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none"></div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse-glow pointer-events-none"></div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse-glow pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                What's <span className="gradient-text">Included</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Our comprehensive package covers every aspect of the Google Play Store submission process.
              </p>
              <ul className="space-y-4">
                {includedFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={14} className="text-primary" />
                    </div>
                    <span className="text-foreground/90">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-8">
              <div className="text-center mb-8">
                <p className="text-muted-foreground mb-2">One-time payment</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl md:text-6xl font-bold gradient-text">$25</span>
                </div>
                <p className="text-muted-foreground mt-2">No hidden fees</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={18} className="text-primary" />
                  <span>24-48 hour submission</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RefreshCw size={18} className="text-primary" />
                  <span>Free re-submission if rejected</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield size={18} className="text-primary" />
                  <span>Policy compliance guaranteed</span>
                </div>
              </div>

              <Button variant="gradient" size="lg" className="w-full" asChild>
                <Link to="/order">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What You Provide */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What You <span className="gradient-text">Provide</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These are the materials we need from you to complete the submission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {whatYouProvide.map((item, index) => (
              <div key={index} className="glass-card rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Optional <span className="gradient-text">Add-ons</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enhance your listing with these premium services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {addOns.map((addon, index) => (
              <div key={index} className="glass-card-hover rounded-xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Plus size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{addon.title}</h3>
                    <span className="text-primary font-bold">{addon.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{addon.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery & Policies */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Delivery Time */}
              <div className="glass-card rounded-xl p-6" id="delivery">
                <div className="flex items-center gap-3 mb-4">
                  <Zap size={24} className="text-primary" />
                  <h3 className="text-xl font-bold">Delivery Time</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Standard delivery: 24-48 hours after receiving all assets.
                </p>
                <p className="text-muted-foreground">
                  Expedited delivery available: 12 hours (+$10)
                </p>
              </div>

              {/* Refund Policy */}
              <div className="glass-card rounded-xl p-6" id="refund">
                <div className="flex items-center gap-3 mb-4">
                  <RefreshCw size={24} className="text-primary" />
                  <h3 className="text-xl font-bold">Refund Policy</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Full refund if we can't submit your app within 72 hours.
                </p>
                <p className="text-muted-foreground">
                  Free re-submission if rejected for issues we can fix.
                </p>
              </div>
            </div>

            {/* Terms & Privacy */}
            <div className="mt-8 glass-card rounded-xl p-6" id="terms">
              <h3 className="text-xl font-bold mb-4">Terms of Service</h3>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>By using our service, you agree that:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>You own the rights to the app and all provided assets</li>
                  <li>Your app complies with Google Play Developer policies</li>
                  <li>You provide accurate contact and business information</li>
                  <li>Final approval is subject to Google's review process</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 glass-card rounded-xl p-6" id="privacy">
              <h3 className="text-xl font-bold mb-4">Privacy Policy</h3>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>We respect your privacy and protect your data:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Your app files are securely stored and deleted after 30 days</li>
                  <li>Contact information is used only for order communication</li>
                  <li>We never share your data with third parties</li>
                  <li>Payment processing is handled securely via Stripe/PayPal</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get <span className="gradient-text">Published</span>?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Start the process today and have your app on Google Play in no time.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/order" className="group">
              Place Your Order
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
