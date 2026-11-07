import type { Lang } from "./i18n";

export const CATEGORIES = [
  { slug: "kasaysayan", label: "Kasaysayan", short: "KASAYSAYAN", en: "History", enShort: "HISTORY" },
  { slug: "kultura", label: "Kultura", short: "KULTURA", en: "Culture", enShort: "CULTURE" },
  { slug: "lugar", label: "Lugar at Heograpiya", short: "LUGAR", en: "Places and Geography", enShort: "PLACES" },
  { slug: "pagkain", label: "Pagkain", short: "PAGKAIN", en: "Food", enShort: "FOOD" },
  { slug: "hayop", label: "Hayop at Kalikasan", short: "HAYOP", en: "Animals and Nature", enShort: "NATURE" },
  { slug: "wika", label: "Wika", short: "WIKA", en: "Language", enShort: "LANGUAGE" },
  { slug: "tao", label: "Mga Bayani at Tao", short: "TAO", en: "Heroes and People", enShort: "PEOPLE" },
  { slug: "misteryo", label: "Misteryo", short: "MISTERYO", en: "Mystery", enShort: "MYSTERY" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
type Category = (typeof CATEGORIES)[number];

export const categoryOf = (slug: string) => CATEGORIES.find((c) => c.slug === slug)!;
export const catLabel = (c: Category, lang: Lang) => (lang === "en" ? c.en : c.label);
export const catShort = (c: Category, lang: Lang) => (lang === "en" ? c.enShort : c.short);
