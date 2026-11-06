"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LANG_COOKIE, LANGS, type Lang } from "@/lib/i18n";
import { useLang } from "./LangProvider";

/* FIL | EN segmented switch. Saves the choice in a cookie (so server-rendered pages follow it),
   flips client text instantly, then refreshes the server components in the background. */
export default function LangToggle({ className = "" }: { className?: string }) {
  const { lang, t, setLang } = useLang();
  const router = useRouter();
  const [pending, start] = useTransition();

  const choose = (next: Lang) => {
    if (next === lang) return;
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next === "en" ? "en" : "fil";
    setLang(next);
    start(() => router.refresh());
  };

  return (
    <div className={`lang-toggle ${pending ? "is-pending" : ""} ${className}`} role="group" aria-label={t.lang.label} data-lang={lang}>
      <span className="lang-thumb" aria-hidden />
      {LANGS.map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} lang={l === "en" ? "en" : "fil"} onClick={() => choose(l)} title={lang === l ? undefined : t.lang.switchTo}>
          {t.lang[l]}
        </button>
      ))}
    </div>
  );
}
