"use client";
import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);
  const { t } = useLang();
  useEffect(() => setLight(document.documentElement.dataset.theme === "light"), []);

  const apply = (next: boolean) => {
    if (next) document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next ? "#FFF8E7" : "#0F1A3C");
    try {
      localStorage.setItem("jfad-theme", next ? "light" : "dark");
    } catch {}
    setLight(next);
  };

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = !light;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduce) return apply(next);

    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = doc.startViewTransition(() => apply(next));
    t.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 520, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  };

  return (
    <button className={`theme-btn ${light ? "is-light" : ""}`} onClick={toggle} aria-label={light ? t.theme.toDark : t.theme.toLight} title={light ? "Dark mode" : "Light mode"}>
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <mask id="moon-cut">
          <rect width="24" height="24" fill="#fff" />
          <circle className="cut" cx="24" cy="4" r="8" fill="#000" />
        </mask>
        <circle className="core" cx="12" cy="12" r="5" fill="currentColor" mask="url(#moon-cut)" />
        <g className="rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
        </g>
      </svg>
    </button>
  );
}
