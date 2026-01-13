import { useState, useRef, useEffect, useCallback } from "react";
import { X, Volume2, VolumeX, Heart, MessageCircle, Send, Bookmark, Play, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReelViewerProps {
  videos: { id: number; src: string }[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function InstagramReelsViewer({ videos, initialIndex, isOpen, onClose }: ReelViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Minimum swipe distance
  const minSwipeDistance = 50;

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isOpen, currentIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const goToNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, videos.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;
    
    if (isUpSwipe) {
      goToNext();
    } else if (isDownSwipe) {
      goToPrev();
    }
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

  if (!isOpen) return null;

  const currentVideo = videos[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black"
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Instagram-style header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <span className="text-white text-xs font-bold">QM</span>
              </div>
            </div>
            <div>
              <a 
                href="https://www.instagram.com/quantamesh/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white font-semibold text-sm hover:underline"
              >
                quantamesh
              </a>
              <p className="text-white/60 text-xs">CGI Advertisement</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Video */}
      <div className="absolute inset-0 flex items-center justify-center" onClick={togglePlayPause}>
        <video
          ref={videoRef}
          src={currentVideo.src}
          className="w-full h-full object-contain md:object-cover"
          loop
          muted={isMuted}
          playsInline
          autoPlay
        />
        
        {/* Play/Pause indicator */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Instagram-style right sidebar actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-20">
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
            <Heart className="w-6 h-6 text-white group-hover:text-red-500 transition-colors" />
          </div>
          <span className="text-white text-xs">2.4K</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs">128</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
            <Send className="w-6 h-6 text-white" />
          </div>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
        </button>
        <button 
          onClick={toggleMute}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* Navigation indicators (mobile) */}
      {isMobile && (
        <>
          {currentIndex > 0 && (
            <button 
              onClick={goToPrev}
              className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 top-20 p-2 rounded-full bg-white/10 backdrop-blur-sm z-20"
            >
              <ChevronUp className="w-6 h-6 text-white" />
            </button>
          )}
          {currentIndex < videos.length - 1 && (
            <button 
              onClick={goToNext}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 p-2 rounded-full bg-white/10 backdrop-blur-sm z-20 animate-bounce"
            >
              <ChevronDown className="w-6 h-6 text-white" />
            </button>
          )}
        </>
      )}

      {/* Progress indicators */}
      <div className="absolute top-16 left-4 right-4 flex gap-1 z-20">
        {videos.map((_, index) => (
          <div 
            key={index}
            className={cn(
              "h-0.5 flex-1 rounded-full transition-colors",
              index === currentIndex ? "bg-white" : index < currentIndex ? "bg-white/60" : "bg-white/30"
            )}
          />
        ))}
      </div>

      {/* Bottom caption area */}
      <div className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
        <p className="text-white text-sm mb-2">
          <span className="font-semibold">quantamesh</span>{" "}
          Elevate your brand with hyper-realistic CGI advertisements ✨
        </p>
        <a 
          href="https://www.instagram.com/quantamesh/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-white/80 text-xs hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          View on Instagram
        </a>
      </div>
    </div>
  );
}
