"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Juan from "./Juan";

const FB = "https://www.facebook.com/juanfactaday";
const MSG = "https://m.me/juanfactaday";

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [light, setLight] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setLight(document.documentElement.dataset.theme === "light"), []);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const toggleTheme = () => {
    const next = !light;
    setLight(next);
    if (next) document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("jfad-theme", next ? "light" : "dark");
    } catch {}
  };

  const cur = (p: string) => (path === p || (p !== "/" && path.startsWith(p)) ? "page" : undefined);

  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="logo" aria-label="Juan Fact a Day, home">
          <Juan pose="peek" size={44} title="" />
          <span>
            Juan Fact <span className="y">a Day</span>
          </span>
        </Link>
        <nav className="nav" aria-label="Pangunahing menu">
          <Link href="/facts" aria-current={cur("/facts")}>Facts</Link>
          <Link href="/quiz" aria-current={cur("/quiz")}>Quiz</Link>
          <Link href="/tungkol" aria-current={cur("/tungkol")}>Tungkol</Link>
        </nav>
        <button className="theme-btn" onClick={toggleTheme} aria-label={light ? "Gawing dark mode" : "Gawing light mode"} title="Palitan ang kulay">
          {light ? (
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><path d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11z" fill="currentColor" /></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="5" fill="currentColor" /><g stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></g></svg>
          )}
        </button>
        <div className="follow-wrap" ref={menuRef}>
          <button className="btn btn-yellow btn-sm" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}>
            I-follow
          </button>
          {open && (
            <div className="follow-menu" role="menu">
              <a role="menuitem" href={FB} target="_blank" rel="noopener">Facebook: Juan Fact a Day</a>
              <a role="menuitem" href={MSG} target="_blank" rel="noopener">Messenger: i-message si Juan</a>
              <span className="soon">Instagram at TikTok: malapit na!</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
