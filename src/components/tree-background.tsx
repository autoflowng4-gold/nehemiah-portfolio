import { useEffect, useRef, useState } from "react";
import video from "@/assets/tree-background.mp4.asset.json";
import poster from "@/assets/tree-poster.jpg.asset.json";

export function TreeBackground() {
  const [animate, setAnimate] = useState(true);
  const [debug, setDebug] = useState("init");
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
    setDebug(`effect ran | animate=${animate} el=${el ? "found" : "NULL"}`);
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
      el.play()
        .then(() => {
          if (!cancelled) setDebug(`play() ok | paused=${el.paused} readyState=${el.readyState}`);
        })
        .catch((err) => {
          if (cancelled) return;
          setDebug(`play() FAILED: ${err.name}: ${err.message}`);
          // AbortError from hydration churn is transient — retry shortly
          // once the DOM has settled, instead of giving up.
          if (err.name === "AbortError") {
            window.setTimeout(() => {
              if (!cancelled && el.isConnected) tryPlay();
            }, 300);
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
      setDebug(
        `t=${el.currentTime.toFixed(2)} paused=${el.paused} ended=${el.ended} readyState=${el.readyState} networkState=${el.networkState} muted=${el.muted}`,
      );
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
            setAnimate(false);
          }}
        />
      )}
      <div className="tree-overlay" />
      {/* TEMPORARY DEBUG OVERLAY — remove once the playback issue is diagnosed */}
      <div
        style={{
          position: "fixed",
          bottom: 8,
          left: 8,
          zIndex: 999,
          background: "rgba(0,0,0,0.85)",
          color: "#0f0",
          font: "11px monospace",
          padding: "6px 8px",
          borderRadius: 4,
          maxWidth: "90vw",
          wordBreak: "break-all",
          pointerEvents: "none",
        }}
      >
        {debug}
      </div>
    </div>
  );
}
