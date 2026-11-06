"use client";
import { useEffect, useRef, useState } from "react";
import { useLang } from "./LangProvider";

/* Vertical video in a phone frame. `ambient` = muted autoplay loop that only plays while on screen
   (hero). Otherwise it's a normal player that loads nothing until the viewer taps play. */
export default function ReelPlayer({
  src,
  poster,
  captions,
  title,
  ambient = false,
  autoPlayWithSound = false,
  onEnded,
}: {
  src: string;
  poster: string;
  captions?: string | null;
  title: string;
  ambient?: boolean;
  autoPlayWithSound?: boolean;
  onEnded?: () => void;
}) {
  const { t } = useLang();
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(ambient);
  const [started, setStarted] = useState(autoPlayWithSound);

  useEffect(() => {
    const v = ref.current;
    if (!v || !ambient) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [ambient]);

  useEffect(() => {
    if (autoPlayWithSound) ref.current?.play().catch(() => setStarted(false));
  }, [autoPlayWithSound, src]);

  return (
    <div className="phone">
      <div className="phone-screen">
        <video
          ref={ref}
          key={src}
          src={started || ambient ? src : undefined}
          poster={poster}
          muted={muted}
          playsInline
          loop={ambient}
          controls={!ambient && started}
          preload={ambient ? "metadata" : "none"}
          onEnded={onEnded}
          aria-label={`Video: ${title}`}
        >
          {captions && <track kind="captions" src={captions} srcLang="fil" label="Filipino" />}
        </video>
        {!ambient && !started && (
          <button
            className="play-big"
            onClick={() => {
              setStarted(true);
              requestAnimationFrame(() => ref.current?.play().catch(() => {}));
            }}
            aria-label={t.reel.play(title)}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden>
              <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
            </svg>
          </button>
        )}
        {ambient && (
          <button
            className="sound-chip"
            onClick={() => {
              const v = ref.current;
              if (!v) return;
              v.muted = !v.muted;
              setMuted(v.muted);
              if (v.paused) v.play().catch(() => {});
              if (!v.muted) v.currentTime = 0;
            }}
            aria-label={muted ? t.reel.soundOn : t.reel.mute}
          >
            {muted ? t.reel.tapSound : t.reel.hasSound}
          </button>
        )}
      </div>
    </div>
  );
}
