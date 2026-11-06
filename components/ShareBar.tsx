"use client";
import { useState } from "react";

export default function ShareBar({ url, title, card }: { url: string; title: string; card: string }) {
  const [copied, setCopied] = useState(false);
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
      <h2 style={{ fontSize: "1.3rem" }}>I-share sa barkada</h2>
      <div className="sharebar">
        <a className="btn btn-yellow btn-sm" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener">Facebook</a>
        <a className="btn btn-outline btn-sm" href={`fb-messenger://share/?link=${u}`}>Messenger</a>
        <a className="btn btn-outline btn-sm" href={`https://x.com/intent/post?url=${u}&text=${t}`} target="_blank" rel="noopener">X</a>
        <button className="btn btn-outline btn-sm" onClick={copy} aria-live="polite">{copied ? "Na-copy na! ✅" : "Copy link"}</button>
        <a className="btn btn-outline btn-sm" href={card} download>I-download ang fact card</a>
      </div>
    </div>
  );
}
