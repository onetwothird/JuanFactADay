"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { LANG_COOKIE, LANGS, type Lang } from "@/lib/i18n";
import { useLang } from "./LangProvider";

// Matches the .lang-thumb transition in globals.css. The heavy work (re-rendering every client text
// and refreshing the server components) waits until the thumb has finished sliding, so the slide
// never shares the main thread with it and doesn't drop frames.
const SLIDE_MS = 350;

/* FIL | EN segmented switch. Saves the choice in a cookie (so server-rendered pages follow it),
   slides the thumb first, then flips client text and refreshes the server components. */
export default function LangToggle({ className = "" }: { className?: string }) {
  const { lang, t, setLang } = useLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [shown, setShown] = useState<Lang>(lang); // what the thumb points at
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => setShown(lang), [lang]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const choose = (next: Lang) => {
    if (next === shown) return;
    setShown(next);
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      document.documentElement.lang = next === "en" ? "en" : "fil";
      setLang(next);
      start(() => router.refresh());
    }, reduce ? 0 : SLIDE_MS);
  };

  return (
    <div className={`lang-toggle ${pending ? "is-pending" : ""} ${className}`} role="group" aria-label={t.lang.label} data-lang={shown}>
      <span className="lang-thumb" aria-hidden />
      {LANGS.map((l) => (
        <button key={l} type="button" aria-pressed={shown === l} lang={l === "en" ? "en" : "fil"} onClick={() => choose(l)} title={shown === l ? undefined : t.lang.switchTo}>
          {t.lang[l]}
        </button>
      ))}
    </div>
  );
}
