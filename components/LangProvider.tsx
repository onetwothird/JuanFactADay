"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { dict, type Dict, type Lang } from "@/lib/i18n";

type Ctx = { lang: Lang; t: Dict; setLang: (l: Lang) => void };
const LangCtx = createContext<Ctx>({ lang: "fil", t: dict.fil, setLang: () => {} });

/* Holds the language for client components. `lang` comes from the server (cookie); setLang lets the
   switch flip client-rendered text instantly while the server re-renders the rest. */
export function LangProvider({ lang: initial, children }: { lang: Lang; children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(initial);
  useEffect(() => setLang(initial), [initial]);
  return <LangCtx.Provider value={{ lang, t: dict[lang], setLang }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
