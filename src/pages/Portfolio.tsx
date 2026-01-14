import { useState, useRef, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Play, Volume2, VolumeX, X, ChevronLeft, ChevronRight, Filter, Instagram, Share2, Check, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { InstagramReelsViewer } from "@/components/home/InstagramReelsViewer";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

// Video items with categories
const portfolioItems = [
  { id: 1, src: "/CGI Ads/1.mp4", category: "product", title: "Product Showcase" },
  { id: 2, src: "/CGI Ads/2.mp4", category: "brand", title: "Brand Identity" },
  { id: 3, src: "/CGI Ads/3.mp4", category: "product", title: "3D Product Ad" },
  { id: 4, src: "/CGI Ads/4.mp4", category: "motion", title: "Motion Graphics" },
  { id: 5, src: "/CGI Ads/5.mp4", category: "brand", title: "Brand Campaign" },
  { id: 6, src: "/CGI Ads/6.mp4", category: "motion", title: "Animated Promo" },
  { id: 7, src: "/CGI Ads/7.mp4", category: "product", title: "Product Launch" },
  { id: 8, src: "/CGI Ads/8.mp4", category: "brand", title: "Visual Identity" },
];

const categories = [
  { id: "all", label: "All" },
  { id: "product", label: "Product" },
  { id: "brand", label: "Brand" },
  { id: "motion", label: "Motion" },
];

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [reelsOpen, setReelsOpen] = useState(false);
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();

  // Handle deep linking to specific video
  useEffect(() => {
    const videoId = searchParams.get('video');
    if (videoId) {
      const index = portfolioItems.findIndex(item => item.id === parseInt(videoId));
      if (index !== -1) {
        setSelectedIndex(index);
        if (isMobile) {
          setReelsOpen(true);
        } else {
          setGalleryOpen(true);
        }
      }
    }
  }, [searchParams, isMobile]);

  const filteredItems = selectedCategory === "all" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  const handleVideoClick = (index: number) => {
    const actualIndex = portfolioItems.findIndex(item => item.id === filteredItems[index].id);
    setSelectedIndex(actualIndex);
    if (isMobile) {
      setReelsOpen(true);
    } else {
      setGalleryOpen(true);
    }
  };

  const handleShare = useCallback((videoId: number) => {
    const url = `${window.location.origin}/portfolio?video=${videoId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard!", {
        description: "Share this link to show this specific video",
      });
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>CGI Portfolio | Quanta Mesh - Premium 3D Advertisements</title>
        <meta name="description" content="Explore our collection of hyper-realistic CGI advertisements. From product showcases to brand campaigns, see how we bring ideas to life in stunning 3D." />
      </Helmet>

      <section className="min-h-screen bg-background pt-24 pb-16">
        <div className="container px-4 mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-4">
            <a 
              href="https://www.instagram.com/quantamesh/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-4 h-4" />
              Follow @quantamesh
            </a>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              CGI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Portfolio</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our collection of hyper-realistic 3D advertisements that captivate audiences and elevate brands.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <Filter className="w-4 h-4 text-muted-foreground mr-2" />
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "rounded-full transition-all",
                  selectedCategory === category.id && "bg-gradient-to-r from-purple-600 to-pink-600"
                )}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredItems.map((item, index) => (
              <PortfolioVideoCard
                key={item.id}
                id={item.id}
                src={item.src}
                title={item.title}
                category={item.category}
                onClick={() => handleVideoClick(index)}
                onShare={() => handleShare(item.id)}
                isMobile={isMobile}
              />
            ))}
          </div>

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No videos found in this category.</p>
            </div>
          )}

          {/* Instagram CTA */}
          <div className="mt-16 text-center">
            <a 
              href="https://www.instagram.com/quantamesh/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-card border border-border text-foreground hover:bg-accent hover:border-accent transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px] flex-shrink-0">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-foreground" />
                </div>
              </div>
              <div className="text-left">
                <p className="font-semibold">View more on Instagram</p>
                <p className="text-muted-foreground text-sm">@quantamesh</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Desktop Full-Screen Gallery */}
      {!isMobile && (
        <FullScreenGallery
          videos={portfolioItems}
          currentIndex={selectedIndex}
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          onNavigate={setSelectedIndex}
          onShare={handleShare}
        />
      )}

      {/* Mobile Reels Viewer */}
      <InstagramReelsViewer
        videos={portfolioItems}
        initialIndex={selectedIndex}
        isOpen={reelsOpen}
        onClose={() => setReelsOpen(false)}
      />
    </Layout>
  );
}

// Video Card with intersection observer autoplay and lazy loading
interface PortfolioVideoCardProps {
  id: number;
  src: string;
  title: string;
  category: string;
  onClick: () => void;
  onShare: () => void;
  isMobile: boolean;
}

function PortfolioVideoCard({ id, src, title, category, onClick, onShare, isMobile }: PortfolioVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [showShareConfirm, setShowShareConfirm] = useState(false);

  // Lazy loading: Only load video when in viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Autoplay when visible (after video is loaded)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isInView || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          } else {
            video.pause();
            video.currentTime = 0;
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isInView, isLoading]);

  const handleVideoLoaded = () => {
    setIsLoading(false);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare();
    setShowShareConfirm(true);
    setTimeout(() => setShowShareConfirm(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group rounded-2xl overflow-hidden aspect-[9/16] bg-muted border border-border shadow-2xl transition-all duration-500 cursor-pointer",
        isMobile 
          ? "active:scale-[0.98]" 
          : "hover:scale-[1.02] hover:border-primary/50 hover:shadow-primary/20"
      )}
      onClick={onClick}
    >
      {/* Skeleton loader */}
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-full rounded-2xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-muted-foreground/20 animate-pulse flex items-center justify-center">
              <Play className="w-5 h-5 text-muted-foreground/50" />
            </div>
          </div>
        </div>
      )}

      {/* Lazy loaded video */}
      {isInView && (
        <video
          ref={videoRef}
          src={src}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
          onLoadedData={handleVideoLoaded}
          onCanPlay={handleVideoLoaded}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Category badge */}
      <Badge 
        variant="secondary" 
        className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground capitalize z-20"
      >
        {category}
      </Badge>

      {/* Share button */}
      <button
        onClick={handleShareClick}
        className={cn(
          "absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-sm border border-white/10 transition-all",
          showShareConfirm 
            ? "bg-green-500/80 text-white" 
            : "bg-black/50 text-white hover:bg-black/70"
        )}
      >
        {showShareConfirm ? (
          <Check className="w-4 h-4" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </button>

      {/* Instagram Reels icon for mobile */}
      {isMobile && !showShareConfirm && (
        <div className="absolute top-12 right-3 z-10">
          <svg className="w-6 h-6 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
      )}

      {/* Play overlay when not playing */}
      {!isLoading && (
        <div className={cn(
          "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300",
          isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>
      )}

      {/* Title and mute button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between z-20">
        <p className="text-white font-medium text-sm truncate flex-1">{title}</p>
        {!isMobile && !isLoading && (
          <button
            onClick={toggleMute}
            className={cn(
              "p-2 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 transition-opacity duration-300 hover:bg-black/70 ml-2",
              isPlaying ? "opacity-100" : "opacity-0"
            )}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

// Full-Screen Gallery Component (Desktop)
interface FullScreenGalleryProps {
  videos: { id: number; src: string; title?: string; category?: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onShare: (videoId: number) => void;
}

function FullScreenGallery({ videos, currentIndex, isOpen, onClose, onNavigate, onShare }: FullScreenGalleryProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareConfirm, setShowShareConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen, currentIndex]);

  useEffect(() => {
    if (isOpen && videoRef.current && !isLoading) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isOpen, currentIndex, isLoading]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight' && currentIndex < videos.length - 1) onNavigate(currentIndex + 1);
        if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, currentIndex, videos.length, onClose, onNavigate]);

  const handleVideoLoaded = () => {
    setIsLoading(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(currentVideo.id);
    setShowShareConfirm(true);
    setTimeout(() => setShowShareConfirm(false), 2000);
  };

  if (!isOpen) return null;

  const currentVideo = videos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Share button */}
      <button
        onClick={handleShareClick}
        className={cn(
          "absolute top-6 right-20 p-3 rounded-full transition-all z-20 flex items-center gap-2",
          showShareConfirm 
            ? "bg-green-500/80 text-white" 
            : "bg-white/10 hover:bg-white/20 text-white"
        )}
      >
        {showShareConfirm ? (
          <>
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Copied!</span>
          </>
        ) : (
          <>
            <Link className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </>
        )}
      </button>

      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
      )}
      {currentIndex < videos.length - 1 && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      )}

      {/* Video container */}
      <div 
        className="relative max-w-4xl max-h-[90vh] aspect-[9/16] cursor-pointer"
        onClick={togglePlayPause}
      >
        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 z-10 rounded-2xl overflow-hidden">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse flex items-center justify-center">
                <Play className="w-10 h-10 text-white/50" />
              </div>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          src={currentVideo.src}
          className={cn(
            "w-full h-full object-contain rounded-2xl transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          loop
          muted={isMuted}
          playsInline
          autoPlay
          onLoadedData={handleVideoLoaded}
          onCanPlay={handleVideoLoaded}
        />

        {/* Play/Pause overlay */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
            <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
          <div>
            {currentVideo.title && (
              <p className="text-white font-semibold text-lg">{currentVideo.title}</p>
            )}
            {currentVideo.category && (
              <Badge variant="secondary" className="mt-1 capitalize">
                {currentVideo.category}
              </Badge>
            )}
          </div>
          <button
            onClick={toggleMute}
            className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 hover:bg-black/70 transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        {currentIndex + 1} / {videos.length}
      </div>

      {/* Thumbnail strip */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 pb-2">
        {videos.map((video, index) => (
          <button
            key={video.id}
            onClick={() => onNavigate(index)}
            className={cn(
              "w-12 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
              index === currentIndex ? "border-primary scale-110" : "border-transparent opacity-50 hover:opacity-80"
            )}
          >
            <video
              src={video.src}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
