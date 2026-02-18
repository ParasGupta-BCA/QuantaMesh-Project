import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Film, Globe, Code2 } from "lucide-react";

const serviceLinks = [
  { icon: Smartphone, label: "App Publishing", href: "/order", color: "text-purple-400" },
  { icon: Film, label: "CGI Ads", href: "/contact", color: "text-pink-400" },
  { icon: Globe, label: "Websites", href: "/contact", color: "text-cyan-400" },
  { icon: Code2, label: "App Dev", href: "/contact", color: "text-emerald-400" },
];

export function CTA() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(290,95%,55%)]/20 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="glass-card rounded-3xl p-8 md:p-16 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to <span className="gradient-text">Grow</span> Your Business?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Whether you need an app published, a viral CGI ad, a stunning website, or a custom app built from scratch — Quanta Mesh is your all-in-one digital partner.
          </p>

          {/* Service Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {serviceLinks.map((s, i) => (
              <Link
                key={i}
                to={s.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium ${s.color}`}
              >
                <s.icon size={14} />
                {s.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/order" className="group">
                Get Started Now
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="glass" size="lg" asChild>
              <Link to="/contact">Have Questions?</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
