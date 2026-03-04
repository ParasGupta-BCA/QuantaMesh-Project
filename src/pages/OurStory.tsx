import { Layout } from "@/components/layout/Layout";
import { Users, TrendingUp, ShieldCheck, Star, Award, Briefcase, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function OurStory() {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-10" />
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/10 blur-[100px] rounded-full -z-10" />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/20 blur-[100px] rounded-full -z-10" />

                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Meet The Founder</span>
                        </div>
                        <h1 className="mb-6 flex flex-col items-center justify-center gap-1 md:gap-4 px-2">
                            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">The Journey of</span>
                            <span className="text-[2.75rem] leading-none sm:text-5xl md:text-7xl lg:text-8xl font-extrabold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent pb-2 tracking-tighter whitespace-nowrap">
                                Paras Gupta
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
                            From a top-rated Fiverr freelancer to building Quanta Mesh — an agency dedicated to empowering businesses with premium digital solutions.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-16 md:py-24 relative bg-card/30">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* Left side: Images/Proof */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-background/50 backdrop-blur-sm p-2 group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="rounded-xl overflow-hidden relative border border-white/5">
                                    <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                                        <TrendingUp size={14} className="text-green-400" />
                                        <span className="text-xs font-medium text-white shadow-sm">Fiverr Earnings Proof</span>
                                    </div>
                                    {/* Image uploaded by user */}
                                    <img
                                        src="/fiverr-proof.jpeg"
                                        alt="Paras Gupta's Fiverr Earnings Proof"
                                        loading="lazy"
                                        className="w-full h-auto transform hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            // Fallback if image not found
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card p-4 rounded-xl text-center">
                                    <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                    <p className="font-bold text-xl">Top Rated</p>
                                    <p className="text-xs text-muted-foreground">Former Status</p>
                                </div>
                                <div className="glass-card p-4 rounded-xl text-center">
                                    <Briefcase className="w-8 h-8 text-primary mx-auto mb-2" />
                                    <p className="font-bold text-xl">10+</p>
                                    <p className="text-xs text-muted-foreground">Projects Delivered</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right side: Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Started</h2>
                                <div className="h-1 w-20 bg-gradient-to-r from-primary to-transparent rounded-full mb-6" />
                                <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                                    For years, I built a strong reputation as a top-rated freelancer on Fiverr, helping countless businesses bring their ideas to life. From intricate web development to complex app deployments, I dedicated myself to delivering excellence and pushing the boundaries of what was possible for my clients.
                                </p>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    However, in 2025, my Fiverr account was unexpectedly banned without a clear path to resolution. It was a massive setback, but it forced me to look at the bigger picture.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Birth of Quanta Mesh</h2>
                                <div className="h-1 w-20 bg-gradient-to-r from-primary to-transparent rounded-full mb-6" />
                                <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                                    Instead of starting over on another platform, I decided to build something bigger. I channeled all my experience, client insights, and technical expertise into creating my own agency: <span className="text-white font-semibold">Quanta Mesh</span>.
                                </p>
                                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                                    Today, Quanta Mesh isn't just me—it's a comprehensive digital agency. We've expanded our capabilities far beyond freelance gigs to offer enterprise-grade solutions. We specialize in not just building apps and websites, but handling the entire lifecycle.
                                </p>

                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                            <Zap size={12} className="text-primary" />
                                        </div>
                                        <div>
                                            <strong className="text-white">Seamless App Publishing:</strong>
                                            <p className="text-sm text-muted-foreground">Navigating Google Play and App Store approvals with a 100% success rate.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                            <Award size={12} className="text-primary" />
                                        </div>
                                        <div>
                                            <strong className="text-white">Full-Stack Development:</strong>
                                            <p className="text-sm text-muted-foreground">Building modern, scalable web and mobile applications from scratch.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck size={12} className="text-primary" />
                                        </div>
                                        <div>
                                            <strong className="text-white">CGI & UGI Ads:</strong>
                                            <p className="text-sm text-muted-foreground">Creating high-converting, hyper-realistic 3D marketing assets that drive sales.</p>
                                        </div>
                                    </li>
                                </ul>

                                <div className="mt-8 pt-6 border-t border-border/50">
                                    <p className="italic text-foreground mb-4">
                                        "The ban didn't stop me; it elevated me. Now, Quanta Mesh delivers the premium, restriction-free service that my clients always deserved."
                                    </p>
                                    <p className="font-bold">— Paras Gupta, Founder</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-2xl mx-auto space-y-6"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold">Ready to Work Together?</h2>
                        <p className="text-muted-foreground text-lg">
                            Experience the dedication and expertise that generated thousands of dollars in successful projects. Let's build your next big idea.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                            <Button size="lg" className="rounded-xl px-8" asChild>
                                <Link to="/order">Publish Your App</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-xl px-8 bg-background/50 backdrop-blur-sm" asChild>
                                <Link to="/contact">Get a Custom Quote</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
}
