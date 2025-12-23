import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AnnouncementBarProps {
    onDismiss: () => void;
}

export function AnnouncementBar({ onDismiss }: AnnouncementBarProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for animation to finish
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white overflow-hidden z-[60]"
                >
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>

                    <div className="container mx-auto px-4 h-10 md:h-12 flex items-center justify-between relative z-10">
                        <div className="flex-1 flex items-center justify-center gap-2 md:gap-3 text-[11px] md:text-sm font-medium tracking-wide">
                            <span className="flex items-center gap-1.5 md:gap-2 animate-pulse-glow bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
                                <Sparkles size={12} className="text-yellow-300 fill-yellow-300" />
                                <span className="font-bold text-yellow-100">LIMITED OFFER</span>
                            </span>

                            <span className="hidden md:inline text-white/90">
                                Launch your dream app today!
                            </span>

                            <div className="flex items-center gap-1.5 group">
                                <span className="md:hidden">Get 30% OFF App Publishing!</span>
                                <span className="hidden md:inline">Get <span className="font-bold text-white border-b border-white/40">30% OFF</span> App Publishing!</span>

                                <Link
                                    to="/order"
                                    className="inline-flex items-center gap-1 ml-1 md:ml-2 bg-white text-indigo-600 px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold hover:bg-indigo-50 transition-colors shadow-lg shadow-black/10 group-hover:scale-105 duration-200"
                                >
                                    Publish Now
                                    <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        <button
                            onClick={handleDismiss}
                            className="absolute right-2 md:right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
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
