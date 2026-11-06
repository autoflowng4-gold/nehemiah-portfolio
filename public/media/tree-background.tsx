import { useEffect, useState } from "react";
import video from "@/assets/tree-background.mp4.asset.json";
import poster from "@/assets/tree-poster.jpg.asset.json";

export function TreeBackground() {
  const [animate, setAnimate] = useState(true);
  useEffect(() => {
    // Respect explicit data-saver mode, but don't silently disable the
    // background video just because the OS has reduced-motion on — many
    // phones enable that by default and this video is purely decorative
    // (ambient loop, no flashing/parallax), so we keep it playing.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    setAnimate(!connection?.saveData);
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
