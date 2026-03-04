import { Link } from "react-router-dom";
import { Instagram, Mail, ExternalLink } from "lucide-react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background pt-12 pb-6 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Top Section - Links & Info */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-6 md:mb-10 w-full">
          <div className="max-w-sm w-full">
            <h3 className="text-2xl font-semibold mb-4 text-foreground">Build your<br />dream app.</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Professional Android app publishing service. Get your app on Google Play Store quickly and affordably.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/quantamesh/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-secondary/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="mailto:parasgupta4494@gmail.com"
                className="p-2 rounded-full bg-secondary/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-16 lg:gap-24 w-full lg:w-auto">
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link to="/services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Services</Link>
              <Link to="/portfolio" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Portfolio</Link>
              <Link to="/our-story" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Our Story</Link>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/order" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Order Now</Link>
              <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              <Link to="/terms-of-service" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/privacy-policy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/refund-policy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Refund</Link>
            </div>
          </div>
        </div>

        {/* Center Massive Text Hover Effect */}
        <div className="h-[6rem] sm:h-[10rem] md:h-[14rem] lg:h-[18rem] flex items-center justify-center w-full mb-6 relative z-10">
          <TextHoverEffect text="QUANTA MESH" />
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="font-bold text-lg">Quanta<span className="text-primary">Mesh</span></span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-xs sm:text-sm text-muted-foreground w-full md:w-auto">
            <span>© {new Date().getFullYear()} Quanta Mesh. All rights reserved.</span>
            <span className="hidden md:inline text-border">|</span>
            <span className="flex items-center gap-1 justify-center">Built with precision <ExternalLink size={12} className="text-primary" /></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
