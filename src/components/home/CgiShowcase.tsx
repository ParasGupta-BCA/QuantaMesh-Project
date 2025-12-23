import { useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { id: 1, type: "video", src: "/CGI Ads/1.mp4" },
  { id: 2, type: "video", src: "/CGI Ads/2.mp4" },
  { id: 3, type: "video", src: "/CGI Ads/3.mp4" },
  { id: 4, type: "video", src: "/CGI Ads/4.mp4" },
  { id: 5, type: "video", src: "/CGI Ads/5.mp4" },
  { id: 6, type: "video", src: "/CGI Ads/6.mp4" },
  { id: 7, type: "video", src: "/CGI Ads/7.mp4" },
  { id: 8, type: "video", src: "/CGI Ads/8.mp4" },
];

export function CgiShowcase() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black opacity-40 pointer-events-none" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            CGI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Masterpieces</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Elevate your brand with hyper-realistic 3D advertisements that capture attention and drive engagement.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {items.map((item) => (
            <VideoCard key={item.id} src={item.src} />
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoCard({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handleMouseEnter = () => {
    videoRef.current?.play();
    setIsPlaying(true);
  };

  const handleMouseLeave = () => {
    videoRef.current?.pause();
    if (videoRef.current) videoRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div
      className="relative group rounded-2xl overflow-hidden aspect-[9/16] bg-zinc-900 border border-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-purple-500/20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
      />

      {/* Overlay - Always visible initially, fades out on play */}
      <div className={cn(
        "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300",
        isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
          <Play className="w-5 h-5 text-white fill-white" />
        </div>
      </div>

      {/* Sound Control - Visible only when playing */}
      <button
        onClick={toggleMute}
        className={cn(
          "absolute bottom-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 transition-opacity duration-300 hover:bg-black/70",
          isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
