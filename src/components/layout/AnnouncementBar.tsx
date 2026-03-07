import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { X, Sparkles, ArrowRight, Snowflake, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────
//  SEASON DETECTION UTILITY
// ─────────────────────────────────────────────────────────────

/** List of IANA timezone prefixes that belong to the Southern Hemisphere */
const SOUTHERN_TIMEZONES = [
    "Australia", "Pacific/Auckland", "Pacific/Fiji", "Pacific/Apia",
    "America/Argentina", "America/Sao_Paulo", "America/Santiago",
    "America/Lima", "America/Bogota", "America/Montevideo",
    "America/Asuncion", "America/La_Paz", "America/Caracas",
    "Africa/Johannesburg", "Africa/Harare", "Africa/Nairobi",
    "Africa/Lagos", "Africa/Lusaka", "Africa/Maputo",
    "Indian/Mauritius", "Indian/Reunion",
];

function isSouthernHemisphere(timezone: string): boolean {
    return SOUTHERN_TIMEZONES.some((tz) => timezone.startsWith(tz));
}

type Season = "summer" | "winter";

function detectSeason(): Season {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const month = new Date().getMonth(); // 0 = Jan … 11 = Dec
    const isSouthern = isSouthernHemisphere(timezone);

    // Northern Hemisphere: Summer = Jun–Aug (5–7), Winter = Dec–Feb (11, 0, 1)
    // Southern Hemisphere: opposite
    const isNorthernSummer = month >= 5 && month <= 7;
    const isNorthernWinter = month === 11 || month <= 1;

    if (isSouthern) {
        // Flip the seasons
        if (isNorthernSummer) return "winter";
        if (isNorthernWinter) return "summer";
        // Spring/Autumn → use temperature leaning
        return month >= 2 && month <= 4 ? "winter" : "summer"; // Mar–May = Autumn in South
    } else {
        if (isNorthernSummer) return "summer";
        if (isNorthernWinter) return "winter";
        return month >= 2 && month <= 4 ? "summer" : "winter"; // Spring → trending warmer
    }
}

// ─────────────────────────────────────────────────────────────
//  THEME CONFIG
// ─────────────────────────────────────────────────────────────

const THEMES = {
    summer: {
        bg: "bg-orange-500/30",
        gradient: "from-amber-500/40 via-orange-500/40 to-yellow-500/40",
        badge: "SUMMER DEAL 🌞",
        badgeText: "text-amber-100",
        badgeBorder: "border-amber-300/30",
        btnText: "text-orange-600",
        btnHover: "hover:bg-amber-50",
        particleColor: (opacity: number) => `rgba(255, 200, 50, ${opacity})`,
        icon: Sun,
        iconClass: "text-amber-300 fill-amber-300",
        border: "border-b border-amber-300/20",
    },
    winter: {
        bg: "bg-violet-600/30",
        gradient: "from-violet-600/40 via-purple-600/40 to-indigo-600/40",
        badge: "LIMITED OFFER ❄️",
        badgeText: "text-yellow-100",
        badgeBorder: "border-white/20",
        btnText: "text-indigo-600",
        btnHover: "hover:bg-indigo-50",
        particleColor: (opacity: number) => `rgba(255, 255, 255, ${opacity})`,
        icon: Snowflake,
        iconClass: "text-blue-200 fill-blue-200",
        border: "border-b border-white/10",
    },
};

// ─────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────

interface AnnouncementBarProps {
    onDismiss: () => void;
}

export function AnnouncementBar({ onDismiss }: AnnouncementBarProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState("");
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);

    // Detect season once on mount
    const season = detectSeason();
    const theme = THEMES[season];
    const ThemeIcon = theme.icon;

    // ── Countdown ──────────────────────────────────────────────
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight.getTime() - now.getTime();
            if (diff > 0) {
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / 1000 / 60) % 60);
                const seconds = Math.floor((diff / 1000) % 60);
                return `${hours.toString().padStart(2, "0")}h ${minutes
                    .toString()
                    .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
            }
            return "00h 00m 00s";
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, []);

    // ── Seasonal Particle Canvas ────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const updateSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = canvas.parentElement?.offsetHeight || 48;
        };
        updateSize();

        // ------ Summer particles: rising glowing sparks ------
        // ------ Winter particles: drifting snowflakes    ------
        type Particle = {
            x: number; y: number; radius: number;
            speedX: number; speedY: number; opacity: number;
            angle: number; angleSpeed: number;
        };

        const COUNT = season === "summer" ? 40 : 55;
        const particles: Particle[] = [];

        const spawn = (fromBottom = false): Particle => ({
            x: Math.random() * canvas.width,
            y: fromBottom
                ? canvas.height + Math.random() * 10 // summer: start below
                : -5,                                 // winter: start above
            radius: Math.random() * 2.5 + 0.8,
            speedX: (Math.random() - 0.5) * (season === "summer" ? 0.6 : 0.4),
            speedY: season === "summer"
                ? -(Math.random() * 1.2 + 0.4)   // rises up
                : Math.random() * 1 + 0.3,        // falls down
            opacity: Math.random() * 0.55 + 0.25,
            angle: Math.random() * Math.PI * 2,
            angleSpeed: (Math.random() - 0.5) * 0.05,
        });

        for (let i = 0; i < COUNT; i++) {
            const p = spawn(season === "summer");
            p.y = Math.random() * canvas.height; // scatter initially
            particles.push(p);
        }

        const tick = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                ctx.save();
                ctx.globalAlpha = p.opacity;

                if (season === "summer") {
                    // Glowing sun spark
                    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.5);
                    grd.addColorStop(0, theme.particleColor(p.opacity));
                    grd.addColorStop(1, "rgba(255,160,0,0)");
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = grd;
                    ctx.fill();
                } else {
                    // Soft snowflake dot
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = theme.particleColor(p.opacity);
                    ctx.fill();
                }
                ctx.restore();

                // Move
                p.x += p.speedX + Math.sin(p.angle) * 0.4;
                p.y += p.speedY;
                p.angle += p.angleSpeed;

                // Recycle
                if (season === "summer" && p.y < -10) Object.assign(p, spawn(true));
                if (season === "winter" && p.y > canvas.height + 10) Object.assign(p, spawn(false));
            });
            animFrameRef.current = requestAnimationFrame(tick);
        };

        tick();

        const onResize = () => updateSize();
        window.addEventListener("resize", onResize);
        const ro = new ResizeObserver(updateSize);
        if (canvas.parentElement) ro.observe(canvas.parentElement);

        return () => {
            cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener("resize", onResize);
            ro.disconnect();
        };
    }, [season]);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`relative w-full ${theme.bg} backdrop-blur-xl ${theme.border} shadow-lg text-white overflow-hidden z-[60]`}
                >
                    {/* Seasonal gradient overlay */}
                    <div
                        className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} pointer-events-none`}
                    />

                    {/* Particle canvas */}
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
                    />

                    <div className="container mx-auto px-4 h-10 md:h-12 flex items-center justify-between relative z-10">
                        <div className="flex-1 flex items-center justify-center gap-2 md:gap-3 text-[11px] md:text-sm font-medium tracking-wide">
                            {/* Season Badge */}
                            <span
                                className={`hidden sm:flex items-center gap-1.5 md:gap-2 animate-pulse-glow bg-white/10 px-2 py-0.5 rounded-full border ${theme.badgeBorder}`}
                            >
                                <ThemeIcon size={12} className={theme.iconClass} />
                                <span className={`font-bold ${theme.badgeText}`}>
                                    {theme.badge}
                                </span>
                            </span>

                            <span className="hidden lg:inline text-white/90">
                                {season === "summer"
                                    ? "Hot Summer Deal — don't let it melt away!"
                                    : "Launch your dream app today!"}
                            </span>

                            <div className="flex items-center gap-2 group">
                                {/* Mobile */}
                                <span className="sm:hidden flex items-center gap-2 text-center truncate max-w-[200px] xs:max-w-none">
                                    <span className={`font-bold ${season === "summer" ? "text-amber-200" : "text-yellow-200"}`}>
                                        30% OFF
                                    </span>
                                    <span className="w-px h-3 bg-white/30 mx-0.5" />
                                    <span className="font-mono text-xs opacity-90 tracking-tight">
                                        {timeLeft}
                                    </span>
                                </span>

                                {/* Desktop */}
                                <span className="hidden sm:inline">
                                    Get{" "}
                                    <span className="font-bold text-white border-b border-white/40">
                                        30% OFF
                                    </span>{" "}
                                    App Publishing!
                                </span>

                                <Link
                                    to="/order"
                                    className={`inline-flex items-center gap-1 bg-white ${theme.btnText} px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold ${theme.btnHover} transition-colors shadow-lg shadow-black/10 group-hover:scale-105 duration-200 whitespace-nowrap`}
                                >
                                    <span className="sm:hidden">Claim</span>
                                    <span className="hidden sm:inline">Publish Now</span>
                                    <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>

                            {/* Countdown — desktop only */}
                            <span className="hidden md:flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 font-mono text-[11px] tracking-tight">
                                <span className="opacity-70">Ends in</span>
                                <span className="font-bold tabular-nums">{timeLeft}</span>
                            </span>
                        </div>

                        <button
                            onClick={handleDismiss}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                            aria-label="Dismiss announcement"
                        >
                            <X size={14} className="md:w-4 md:h-4 text-white/80 hover:text-white" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
