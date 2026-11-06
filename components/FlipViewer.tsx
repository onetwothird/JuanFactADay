"use client";
import Image from "next/image";
import { useState } from "react";

/* Shows the video's scene cards one by one (no autoplay). If a video URL exists,
   the first frame becomes a click-to-load facade so nothing heavy loads up front. */
export default function FlipViewer({ cards, title, videoUrl }: { cards: string[]; title: string; videoUrl?: string }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const n = cards.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);

  if (playing && videoUrl) {
    return (
      <div className="flip">
        <iframe
          src={videoUrl}
          title={`Video: ${title}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flip">
        <Image
          src={cards[i]}
          alt={`${title}: card ${i + 1} ng ${n}`}
          fill
          sizes="(max-width: 900px) 360px, 340px"
          priority={i === 0}
        />
        {videoUrl && i === 0 && (
          <button className="vplay" style={{ inset: "auto auto 50% 50%", translate: "-50% 50%", width: 72, height: 72, cursor: "pointer" }} onClick={() => setPlaying(true)} aria-label="I-play ang video">
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden><path d="M6 3l15 9-15 9z" fill="#0A1640" /></svg>
          </button>
        )}
      </div>
      {n > 1 && (
        <div className="flip-ctrl">
          <button className="round-btn" onClick={() => go(-1)} aria-label="Nakaraang card">‹</button>
          <div className="flip-dots" role="group" aria-label="Mga card">
            {cards.map((_, k) => (
              <button key={k} aria-label={`Card ${k + 1}`} aria-current={k === i} onClick={() => setI(k)} />
            ))}
          </div>
          <button className="round-btn" onClick={() => go(1)} aria-label="Susunod na card">›</button>
        </div>
      )}
    </div>
  );
}
