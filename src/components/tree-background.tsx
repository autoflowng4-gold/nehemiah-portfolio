import { useEffect, useRef, useState } from "react";
import video from "@/assets/tree-background.mp4.asset.json";
import poster from "@/assets/tree-poster.jpg.asset.json";

export function TreeBackground() {
  const [animate] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Always animate: this is a small, muted, looping background video with
  // no flashing/parallax, so it isn't worth gating on reduced-motion or
  // data-saver signals — those were silently disabling it for many real
  // visitors (including normal Chrome with Data Saver / Lite mode on).

  useEffect(() => {
    const el = videoRef.current;
    if (!animate || !el) return;

    // Some mobile Chrome builds render the <video> and show the first
    // frame, but then throttle/pause its internal clock (treating it as
    // background/non-essential media) without firing a `pause` event we
    // can easily see. A watchdog that checks `currentTime` is actually
    // advancing — and force-restarts playback if it has stalled — works
    // around that more reliably than a single play() call.
    let cancelled = false;
    const tryPlay = () => {
      // Guard against calling play() on a node that's no longer in the
      // document (can happen transiently during SSR hydration — the
      // server-rendered DOM gets swapped for the client one right as the
      // effect fires, aborting any in-flight play() request).
      if (cancelled || !el.isConnected) return;
      el.play().catch((err) => {
        if (cancelled) return;
        // AbortError from hydration churn is transient — retry shortly
        // once the DOM has settled, instead of giving up.
        if (err.name === "AbortError") {
          window.setTimeout(() => {
            if (!cancelled && el.isConnected) tryPlay();
          }, 300);
        } else {
          console.error("[TreeBackground] video play() failed:", err);
        }
      });
    };

    // Defer the first attempt a tick past mount so it runs after any
    // hydration-related DOM swap has finished, not in the middle of it.
    const raf = window.requestAnimationFrame(() => tryPlay());
    document.addEventListener("visibilitychange", tryPlay);

    let lastTime = el.currentTime;
    let stalledChecks = 0;
    const watchdog = window.setInterval(() => {
      if (el.paused || el.ended) {
        tryPlay();
        return;
      }
      if (el.currentTime === lastTime) {
        stalledChecks += 1;
        if (stalledChecks >= 2) {
          const t = el.currentTime;
          el.pause();
          el.currentTime = t;
          tryPlay();
          stalledChecks = 0;
        }
      } else {
        stalledChecks = 0;
      }
      lastTime = el.currentTime;
    }, 1500);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", tryPlay);
      window.clearInterval(watchdog);
    };
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
          }}
        />
      )}
      <div className="tree-overlay" />
    </div>
  );
}
