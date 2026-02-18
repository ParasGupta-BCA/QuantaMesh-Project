import { Link } from "react-router-dom";
import { ArrowRight, Smartphone, Film, Globe, Code2, Check } from "lucide-react";
import { CardSpotlight } from "@/components/ui/card-spotlight";

const services = [
  {
    icon: Smartphone,
    title: "App Publishing",
    subtitle: "Google Play & App Store",
    description: "Skip the $25 developer fee hassle. We publish your Android app to Google Play Store — fast, policy-compliant, and professionally optimized.",
    features: [
      "Metadata & ASO optimization",
      "Policy compliance pre-check",
      "Screenshots & listing setup",
      "Post-publish 48h support",
      "Free re-submission if rejected",
    ],
    cta: "Publish My App",
    href: "/order",
    gradient: "from-purple-500 to-violet-600",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    checkColor: "text-purple-400",
    price: "From $25",
  },
  {
    icon: Film,
    title: "CGI Ads",
    subtitle: "For Brands & Businesses",
    description: "Hyper-realistic 3D CGI video advertisements that stop the scroll. Perfect for social media campaigns, product launches, and brand storytelling.",
    features: [
      "Hyper-realistic 3D visuals",
      "Social media optimized formats",
      "Brand identity integration",
      "Multiple revisions included",
      "Fast turnaround delivery",
    ],
    cta: "Get CGI Ads",
    href: "/contact",
    gradient: "from-pink-500 to-rose-600",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-400",
    checkColor: "text-pink-400",
    price: "Custom Quote",
  },
  {
    icon: Globe,
    title: "Website Development",
    subtitle: "Modern & Responsive",
    description: "Beautiful, fast, and conversion-focused websites built with the latest technologies. From landing pages to full business portals.",
    features: [
      "Fully responsive design",
      "SEO-optimized structure",
      "Fast loading performance",
      "CMS & admin panel",
      "Ongoing maintenance support",
    ],
    cta: "Build My Website",
    href: "/contact",
    gradient: "from-cyan-500 to-blue-600",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    checkColor: "text-cyan-400",
    price: "Custom Quote",
  },
  {
    icon: Code2,
    title: "App Development",
    subtitle: "Mobile & Web Apps",
    description: "End-to-end custom app development — from idea to launch. We build scalable, modern apps for Android, iOS, and the web.",
    features: [
      "Android & iOS development",
      "Web app development",
      "Backend & API integration",
      "UI/UX design included",
      "Post-launch support",
    ],
    cta: "Start My App",
    href: "/contact",
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    checkColor: "text-emerald-400",
    price: "Custom Quote",
  },
];

export function Benefits() {
  return (
    <section className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Our Services</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Everything Your Business <span className="gradient-text">Needs</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            One agency, four powerful services. We handle the digital side so you can focus on what you do best.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <CardSpotlight key={index} className="group cursor-default">
              <div className="relative z-20 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${service.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <service.icon size={24} className={service.iconColor} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{service.title}</h3>
                      <p className={`text-xs font-medium ${service.iconColor}`}>{service.subtitle}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${service.iconBg} ${service.iconColor} border border-white/10 flex-shrink-0 ml-2`}>
                    {service.price}
                  </span>
                </div>

                {/* Description */}
                <p className="text-neutral-400 text-sm leading-relaxed mb-5">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-1">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-neutral-300">
                      <Check size={14} className={`${service.checkColor} flex-shrink-0`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Divider */}
                <div className="h-px bg-white/10 mb-5" />

                {/* CTA */}
                <Link
                  to={service.href}
                  className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-200`}
                >
                  {service.cta}
                  <ArrowRight size={14} className={`${service.iconColor} group-hover:translate-x-1 transition-transform`} />
                </Link>
              </div>
            </CardSpotlight>
          ))}
        </div>
      </div>
    </section>
  );
}
