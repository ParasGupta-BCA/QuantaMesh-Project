import { useRef, useState, useEffect, useMemo } from "react";
import { Play, Volume2, VolumeX, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { InstagramReelsViewer } from "./InstagramReelsViewer";
import { useAdminVideos } from "@/hooks/useAdminVideos";

// Static videos as fallback
const staticItems = [
  { id: "static-1", type: "video", src: "/CGI Ads/1.mp4" },
  { id: "static-2", type: "video", src: "/CGI Ads/2.mp4" },
  { id: "static-3", type: "video", src: "/CGI Ads/3.mp4" },
  { id: "static-4", type: "video", src: "/CGI Ads/4.mp4" },
  { id: "static-5", type: "video", src: "/CGI Ads/5.mp4" },
  { id: "static-6", type: "video", src: "/CGI Ads/6.mp4" },
  { id: "static-7", type: "video", src: "/CGI Ads/7.mp4" },
  { id: "static-8", type: "video", src: "/CGI Ads/8.mp4" },
];

export function CgiShowcase() {
  const [reelsOpen, setReelsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isMobile = useIsMobile();
  const { videos: adminVideos, loading, getVideoUrl } = useAdminVideos();

  // Combine admin-uploaded videos with static videos
  const items = useMemo(() => {
    const adminItems = adminVideos.map((video) => ({
      id: video.id,
      type: "video" as const,
      src: getVideoUrl(video.video_path),
      title: video.title,
    }));
    
    // Show admin videos first, then static ones
    return adminItems.length > 0 ? [...adminItems, ...staticItems] : staticItems;
  }, [adminVideos, getVideoUrl]);

  const handleVideoClick = (index: number) => {
    if (isMobile) {
      setSelectedIndex(index);
      setReelsOpen(true);
    }
  };

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black opacity-40 pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <a 
              href="https://www.instagram.com/quantamesh/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Instagram className="w-4 h-4" />
              Follow @quantamesh
            </a>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            CGI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Masterpieces</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Elevate your brand with hyper-realistic 3D advertisements that capture attention and drive engagement.
          </p>
          {isMobile && (
            <p className="text-white/50 text-sm">
              Tap to view in Reels format
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {items.map((item, index) => (
            <VideoCard 
              key={item.id} 
              src={item.src} 
              onClick={() => handleVideoClick(index)}
              isMobile={isMobile}
            />
          ))}
        </div>
        
        {/* Instagram CTA */}
        <div className="mt-12 text-center">
          <a 
            href="https://www.instagram.com/quantamesh/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <Instagram className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-left">
              <p className="font-semibold">View more on Instagram</p>
              <p className="text-white/60 text-sm">@quantamesh</p>
            </div>
          </a>
        </div>
      </div>

      {/* Instagram Reels Viewer (Mobile Only) */}
      <InstagramReelsViewer 
        videos={items}
        initialIndex={selectedIndex}
        isOpen={reelsOpen}
        onClose={() => setReelsOpen(false)}
      />
    </section>
  );
}

interface VideoCardProps {
  src: string;
  onClick: () => void;
  isMobile: boolean;
}

function VideoCard({ src, onClick, isMobile }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Intersection observer for autoplay on scroll
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) {
      videoRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleClick = () => {
    if (isMobile) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "relative group rounded-2xl overflow-hidden aspect-[9/16] bg-zinc-900 border border-white/10 shadow-2xl transition-all duration-500",
        isMobile 
          ? "active:scale-[0.98] cursor-pointer" 
          : "hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-purple-500/20"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
      />

      {/* Instagram-style gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Instagram Reels icon for mobile */}
      {isMobile && (
        <div className="absolute top-3 right-3 z-10">
          <svg className="w-6 h-6 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
      )}

      {/* Overlay - Always visible initially, fades out on play */}
      <div className={cn(
        "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300",
        isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
          <Play className="w-5 h-5 text-white fill-white" />
        </div>
      </div>

      {/* Sound Control - Visible only when playing (desktop only) */}
      {!isMobile && (
        <button
          onClick={toggleMute}
          className={cn(
            "absolute bottom-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 transition-opacity duration-300 hover:bg-black/70",
            isPlaying ? "opacity-100" : "opacity-0"
          )}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}
