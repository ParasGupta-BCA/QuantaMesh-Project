import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export function Hero() {
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
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 sm:mb-8 animate-fade-in">
            <Sparkles size={14} className="text-primary sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium text-primary">Professional App Publishing</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 animate-slide-up leading-tight">
            <span className="text-foreground block">We Publish Your</span>
            <span className="gradient-text glow-text block my-1 sm:my-2">Android App</span>
            <span className="text-foreground block">to Google Play</span>
          </h1>

          {/* Price */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <span className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text">$25</span>
            <span className="text-muted-foreground text-sm sm:text-base md:text-lg">one-time fee</span>
          </div>

          {/* Subheadline */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-xl md:max-w-2xl mx-auto px-2 animate-slide-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
            Skip the $25 developer fee hassle. We handle everything from metadata optimization to Play Store policy compliance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-16 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="lg" className="w-full sm:w-auto text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-10" asChild>
              <Link to="/order" className="group">
                Publish My App
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="glass" size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8" asChild>
              <Link to="/services">Learn More</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col xs:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-10 animate-fade-in" style={{ animationDelay: "0.4s" }}>
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
