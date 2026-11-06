"use client";
import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";

export default function ShareBar({ url, title, card }: { url: string; title: string; card: string }) {
  const { t: tt } = useLang();
  const s = tt.share;
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator !== "undefined" && !!navigator.share), []);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(`${title} | Juan Fact a Day`);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.3rem" }}>{s.h}</h2>
      <div className="sharebar">
        <a className="btn btn-yellow btn-sm" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener">Facebook</a>
        {canShare && (
          <button className="btn btn-outline btn-sm" onClick={() => navigator.share({ title, url }).catch(() => {})}>
            {s.native}
          </button>
        )}
        <a className="btn btn-outline btn-sm" href={`https://x.com/intent/post?url=${u}&text=${t}`} target="_blank" rel="noopener">X</a>
        <button className="btn btn-outline btn-sm" onClick={copy} aria-live="polite">{copied ? s.copied : s.copy}</button>
        <a className="btn btn-outline btn-sm" href={card} download={`juan-fact-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.jpg`}>{s.download}</a>
      </div>
    </div>
  );
}
