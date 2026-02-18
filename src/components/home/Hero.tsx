import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Zap, Smartphone, Film, Globe, Code2 } from "lucide-react";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { MorPankh } from "@/components/MorPankh";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Autoplay } from "swiper/modules";
import { useIsMobile } from "@/hooks/use-mobile";
import "swiper/css";
import "swiper/css/effect-cards";

const services = [
  {
    icon: Smartphone,
    title: "App Publishing",
    description: "Publish your Android & iOS app to Google Play & App Store — fast, compliant, and hassle-free.",
    color: "from-purple-600/40 to-violet-800/40",
    border: "border-purple-500/40",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/15",
    tag: "$25 one-time",
    tagColor: "text-purple-300 bg-purple-500/15 border-purple-500/30",
    glow: "shadow-purple-500/20",
  },
  {
    icon: Film,
    title: "CGI Ads",
    description: "Hyper-realistic 3D CGI video ads that make your brand go viral on social media.",
    color: "from-pink-600/40 to-rose-800/40",
    border: "border-pink-500/40",
    iconColor: "text-pink-400",
    iconBg: "bg-pink-500/15",
    tag: "For Brands",
    tagColor: "text-pink-300 bg-pink-500/15 border-pink-500/30",
    glow: "shadow-pink-500/20",
  },
  {
    icon: Globe,
    title: "Website Development",
    description: "Modern, fast, and responsive websites that convert visitors into customers.",
    color: "from-cyan-600/40 to-blue-800/40",
    border: "border-cyan-500/40",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
    tag: "Custom Design",
    tagColor: "text-cyan-300 bg-cyan-500/15 border-cyan-500/30",
    glow: "shadow-cyan-500/20",
  },
  {
    icon: Code2,
    title: "App Development",
    description: "Full-stack mobile & web app development tailored to your business needs.",
    color: "from-emerald-600/40 to-teal-800/40",
    border: "border-emerald-500/40",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
    tag: "End-to-End",
    tagColor: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
    glow: "shadow-emerald-500/20",
  },
];

// Swiper card carousel for mobile
function MobileServiceCarousel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="flex flex-col items-center w-full mb-10"
    >
      <p className="text-xs text-white/40 mb-5 tracking-wider uppercase">Swipe to explore</p>
      <Swiper
        effect="cards"
        grabCursor={true}
        loop={true}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        modules={[EffectCards, Autoplay]}
        className="w-[260px] h-[200px]"
      >
        {services.map((service, index) => (
          <SwiperSlide key={index} className="rounded-2xl overflow-hidden">
            <div
              className={`relative h-full w-full bg-gradient-to-br ${service.color} border ${service.border} backdrop-blur-sm p-5 flex flex-col shadow-xl ${service.glow}`}
            >
              {/* Tag */}
              <span className={`absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${service.tagColor}`}>
                {service.tag}
              </span>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${service.iconBg} flex items-center justify-center mb-3`}>
                <service.icon size={20} className={service.iconColor} />
              </div>

              {/* Text */}
              <h3 className="text-base font-bold text-white mb-1.5">{service.title}</h3>
              <p className="text-xs text-white/60 leading-relaxed">{service.description}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}

// Static grid for desktop/tablet
function DesktopServiceGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14 animate-fade-in" style={{ animationDelay: "0.4s" }}>
      {services.map((service, index) => (
        <div
          key={index}
          className={`relative group rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${service.color} border ${service.border} backdrop-blur-sm hover:scale-[1.03] transition-all duration-300 text-left cursor-default`}
        >
          {/* Tag */}
          <span className={`absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${service.tagColor}`}>
            {service.tag}
          </span>

          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl ${service.iconBg} flex items-center justify-center mb-3`}>
            <service.icon size={20} className={service.iconColor} />
          </div>

          {/* Text */}
          <h3 className="text-sm sm:text-base font-bold text-white mb-1.5">{service.title}</h3>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{service.description}</p>
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  const isMobile = useIsMobile();

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden px-4">
      {/* Animated Dotted Background */}
      <DottedGlowBackground
        className="pointer-events-none"
        opacity={0.8}
        gap={16}
        radius={1.5}
        darkColor="rgba(168, 85, 247, 0.7)"
        darkGlowColor="rgba(168, 85, 247, 0.9)"
        color="rgba(168, 85, 247, 0.5)"
        glowColor="rgba(168, 85, 247, 0.85)"
        backgroundOpacity={0}
        speedMin={0.3}
        speedMax={1.2}
        speedScale={1}
      />

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/20 rounded-full blur-[100px] md:blur-[128px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-[hsl(200,95%,55%)]/20 rounded-full blur-[100px] md:blur-[128px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="container mx-auto py-12 sm:py-16 md:py-20 relative z-10">
        <div className="max-w-6xl mx-auto text-center">

          {/* Badge */}
          <div className="relative inline-block mb-6 sm:mb-8 animate-fade-in group">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 ml-6 w-24 h-24 -rotate-12 pointer-events-none transition-transform duration-700 ease-in-out group-hover:rotate-0">
              <MorPankh className="w-full h-full drop-shadow-lg opacity-90" />
            </div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm relative z-10">
              <Sparkles size={14} className="text-primary sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium text-primary">Your All-in-One Digital Partner</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 animate-slide-up leading-tight">
            <span className="text-foreground block">We Build, Launch &</span>
            <span className="gradient-text glow-text block my-1 sm:my-2">Grow Your Brand</span>
            <span className="text-foreground block">Digitally</span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-xl md:max-w-2xl mx-auto px-2 animate-slide-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
            From publishing your app to creating viral CGI ads, building websites, and developing custom apps — we are your complete digital solution.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="lg" className="w-full sm:w-auto text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-10" asChild>
              <Link to="/order" className="group">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="glass" size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8" asChild>
              <Link to="/services">View All Services</Link>
            </Button>
          </div>

          {/* Service Cards — Swiper on mobile, grid on desktop */}
          {isMobile ? <MobileServiceCarousel /> : <DesktopServiceGrid />}

          {/* Trust Indicators */}
          <div className="flex flex-col xs:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-10 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            {[
              { icon: Zap, text: "24-48h Delivery" },
              { icon: Shield, text: "Policy Compliant" },
              { icon: Sparkles, text: "100% Success Rate" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <item.icon size={16} className="text-primary sm:w-[18px] sm:h-[18px]" />
                <span className="text-xs sm:text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
