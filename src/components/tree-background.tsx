import { useEffect, useRef, useState } from "react";
import video from "@/assets/tree-background.mp4.asset.json";
import poster from "@/assets/tree-poster.jpg.asset.json";

export function TreeBackground() {
  const [animate, setAnimate] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Respect explicit data-saver mode, but don't silently disable the
    // background video just because the OS has reduced-motion on — many
    // phones enable that by default and this video is purely decorative
    // (ambient loop, no flashing/parallax), so we keep it playing.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    setAnimate(!connection?.saveData);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!animate || !el) return;
    // Some mobile browsers don't honor the `autoPlay` attribute reliably,
    // especially right after mount/hydration, so kick playback explicitly.
    const tryPlay = () => {
      el.play().catch((err) => {
        console.error("[TreeBackground] video play() failed:", err);
      });
    };
    tryPlay();
    document.addEventListener("visibilitychange", tryPlay);
    return () => document.removeEventListener("visibilitychange", tryPlay);
  }, [animate]);

  return (
    <div className="tree-background" aria-hidden="true">
      <img src={poster.url} alt="" className="tree-media" />
      {animate && (
        <video
          ref={videoRef}
          className="tree-media"
          src={video.url}
          poster={poster.url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={(e) => {
            console.error("[TreeBackground] video error:", e.currentTarget.error);
            setAnimate(false);
          }}
        />
      )}
      <div className="tree-overlay" />
    </div>
  );
}
