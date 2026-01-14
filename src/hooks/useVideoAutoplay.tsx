import { useEffect, useRef, useState, useCallback } from "react";

interface UseVideoAutoplayOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useVideoAutoplay(options: UseVideoAutoplayOptions = {}) {
  const { threshold = 0.5, rootMargin = "0px" } = options;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          
          if (entry.isIntersecting) {
            video.play().then(() => {
              setIsPlaying(true);
            }).catch(() => {
              // Autoplay was prevented
              setIsPlaying(false);
            });
          } else {
            video.pause();
            video.currentTime = 0;
            setIsPlaying(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const play = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, []);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  return { videoRef, isInView, isPlaying, play, pause };
}
