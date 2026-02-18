import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Globe3D, GlobeMarker } from "@/components/ui/3d-globe";
import { useIsMobile } from "@/hooks/use-mobile";

const globeMarkers: GlobeMarker[] = [
  { lat: 40.7128, lng: -74.006, src: "https://assets.aceternity.com/avatars/1.webp", label: "New York" },
  { lat: 51.5074, lng: -0.1278, src: "https://assets.aceternity.com/avatars/2.webp", label: "London" },
  { lat: 35.6762, lng: 139.6503, src: "https://assets.aceternity.com/avatars/3.webp", label: "Tokyo" },
  { lat: -33.8688, lng: 151.2093, src: "https://assets.aceternity.com/avatars/4.webp", label: "Sydney" },
  { lat: 48.8566, lng: 2.3522, src: "https://assets.aceternity.com/avatars/5.webp", label: "Paris" },
  { lat: 28.6139, lng: 77.209, src: "https://assets.aceternity.com/avatars/6.webp", label: "New Delhi" },
  { lat: 55.7558, lng: 37.6173, src: "https://assets.aceternity.com/avatars/7.webp", label: "Moscow" },
  { lat: -22.9068, lng: -43.1729, src: "https://assets.aceternity.com/avatars/8.webp", label: "Rio de Janeiro" },
  { lat: 31.2304, lng: 121.4737, src: "https://assets.aceternity.com/avatars/9.webp", label: "Shanghai" },
  { lat: 25.2048, lng: 55.2708, src: "https://assets.aceternity.com/avatars/10.webp", label: "Dubai" },
  { lat: -34.6037, lng: -58.3816, src: "https://assets.aceternity.com/avatars/11.webp", label: "Buenos Aires" },
  { lat: 1.3521, lng: 103.8198, src: "https://assets.aceternity.com/avatars/12.webp", label: "Singapore" },
  { lat: 37.5665, lng: 126.978, src: "https://assets.aceternity.com/avatars/13.webp", label: "Seoul" },
];

const stats = [
  { value: "100+", label: "Clients Served" },
  { value: "13+", label: "Countries" },
  { value: "4", label: "Core Services" },
];

export function CTA() {
  const isMobile = useIsMobile();

  return (
    <section className="py-16 md:py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">

        {/* ── MOBILE LAYOUT ── */}
        {isMobile && (
          <div
            className="rounded-3xl border border-white/10 p-7 text-center"
            style={{
              background: "linear-gradient(135deg, hsl(260 25% 7%) 0%, hsl(270 20% 5%) 100%)",
            }}
          >
            {/* Glow blobs */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none" />

            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-5">
              🌍 Global Reach
            </span>

            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
              Ready to <span className="gradient-text">Grow Your</span> Business?
            </h2>

            <p className="text-white/55 text-sm leading-relaxed mb-7 max-w-sm mx-auto">
              From publishing your app to creating viral CGI ads, building websites, and developing
              custom apps — Quanta Mesh helps brands go global.
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-xl font-extrabold gradient-text">{s.value}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Link
                to="/order"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                  boxShadow: "0 0 20px rgba(168,85,247,0.35)",
                }}
              >
                Get Started Now
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white/80 text-sm border border-white/15 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                Have Questions?
              </Link>
            </div>
          </div>
        )}

        {/* ── DESKTOP LAYOUT (md+) — Globe visible ── */}
        {!isMobile && (
          <div
            className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10"
            style={{
              background: "linear-gradient(135deg, hsl(260 25% 7%) 0%, hsl(270 20% 5%) 100%)",
              minHeight: "420px",
            }}
          >
            {/* Glow blobs */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 left-1/3 w-60 h-60 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Text — left side */}
            <div className="relative z-10 p-14 max-w-xl">
              {/* Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-6">
                🌍 Global Reach
              </span>

              <h2 className="text-5xl font-extrabold text-white leading-tight mb-5">
                Ready to <span className="gradient-text">Grow Your</span>
                <br />Business?
              </h2>

              <p className="text-white/55 text-lg leading-relaxed mb-8 max-w-md">
                From publishing your app to creating viral CGI ads, building websites, and developing
                custom apps — Quanta Mesh helps brands go global.
              </p>

              <div className="flex gap-3">
                <Link
                  to="/order"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                    boxShadow: "0 0 20px rgba(168,85,247,0.35)",
                  }}
                >
                  Get Started Now
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white/80 text-sm border border-white/15 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  Have Questions?
                </Link>
              </div>
            </div>

            {/* Globe — desktop only, right side overflowing */}
            <div
              className="absolute z-10 pointer-events-auto"
              style={{
                right: "-80px",
                bottom: "-100px",
                width: "520px",
                height: "520px",
              }}
            >
              <Globe3D
                className="h-full w-full"
                markers={globeMarkers}
                config={{
                  showAtmosphere: false,
                  bumpScale: 5,
                  autoRotateSpeed: 0.4,
                }}
              />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
