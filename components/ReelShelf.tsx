"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReelPlayer from "./ReelPlayer";
import { useLang } from "./LangProvider";

export type ReelItem = {
  slug: string;
  number: number;
  title: string;
  category: string;
  poster: string;
  video: string | null;
  captions: string | null;
  duration: number | null;
};

const pad = (n: number) => `#${String(n).padStart(3, "0")}`;
const mmss = (s: number | null) => (s ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}` : "");

export default function ReelShelf({ reels, layout = "shelf" }: { reels: ReelItem[]; layout?: "shelf" | "grid" }) {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(null);
  const playable = reels.filter((r) => r.video);
  const touchY = useRef<number | null>(null);

  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + playable.length) % playable.length)), [playable.length]);

  useEffect(() => {
    if (open === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(-1);
    };
    document.addEventListener("keydown", key);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = "";
    };
  }, [open, go]);

  const cur = open !== null ? playable[open] : null;

  return (
    <>
      <ul className={layout === "grid" ? "reel-grid" : "reel-shelf"} role="list">
        {reels.map((r) => {
          const idx = playable.findIndex((p) => p.slug === r.slug);
          return (
            <li key={r.slug} className="reel-card">
              <button className="reel-thumb" onClick={() => (idx >= 0 ? setOpen(idx) : null)} aria-label={t.reel.watch(r.title)} disabled={idx < 0}>
                <Image src={r.poster} alt="" fill sizes="(max-width: 640px) 70vw, 260px" style={{ objectFit: "cover" }} />
                <span className="route num">{pad(r.number)}</span>
                {r.duration && <span className="dur">{mmss(r.duration)}</span>}
                <span className="play-small" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
                  </svg>
                </span>
              </button>
              <Link href={`/facts/${r.slug}`} className="reel-meta">
                <span className="reel-cat">{r.category}</span>
                <span className="reel-title">{r.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {cur &&
        createPortal(
        <div
          className="viewer"
          role="dialog"
          aria-modal="true"
          aria-label={cur.title}
          onClick={(e) => e.target === e.currentTarget && setOpen(null)}
          onTouchStart={(e) => (touchY.current = e.touches[0].clientY)}
          onTouchEnd={(e) => {
            if (touchY.current === null) return;
            const dy = e.changedTouches[0].clientY - touchY.current;
            if (Math.abs(dy) > 70) go(dy < 0 ? 1 : -1);
            touchY.current = null;
          }}
        >
          <button className="viewer-close" onClick={() => setOpen(null)} aria-label={t.reel.close}>
            ✕
          </button>
          <div className="viewer-stage">
            <ReelPlayer key={cur.slug} src={cur.video!} poster={cur.poster} captions={cur.captions} title={cur.title} autoPlayWithSound onEnded={() => go(1)} />
            <div className="viewer-info">
              <span className="route">{pad(cur.number)}</span>
              <h2>{cur.title}</h2>
              <Link href={`/facts/${cur.slug}`} className="btn btn-yellow btn-sm" onClick={() => setOpen(null)}>
                {t.reel.readFull}
              </Link>
              {playable.length > 1 && (
                <div className="viewer-nav">
                  <button className="round-btn" onClick={() => go(-1)} aria-label={t.reel.prev}>‹</button>
                  <span>
                    {open! + 1} / {playable.length}
                  </span>
                  <button className="round-btn" onClick={() => go(1)} aria-label={t.reel.next}>›</button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
