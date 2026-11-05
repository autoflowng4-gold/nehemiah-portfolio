import { useEffect, useState } from "react";
import video from "@/assets/tree-background.mp4.asset.json";
import poster from "@/assets/tree-poster.jpg.asset.json";

export function TreeBackground() {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    const update = () => setAnimate(!motion.matches && !connection?.saveData);
    update();
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);
  return (
    <div className="tree-background" aria-hidden="true">
      <img src={poster.url} alt="" className="tree-media" />
      {animate && (
        <video
          className="tree-media"
          src={video.url}
          poster={poster.url}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setAnimate(false)}
        />
      )}
      <div className="tree-overlay" />
    </div>
  );
}
