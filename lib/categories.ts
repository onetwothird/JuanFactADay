export const CATEGORIES = [
  { slug: "kasaysayan", label: "Kasaysayan", short: "KASAYSAYAN" },
  { slug: "kultura", label: "Kultura", short: "KULTURA" },
  { slug: "lugar", label: "Lugar at Heograpiya", short: "LUGAR" },
  { slug: "pagkain", label: "Pagkain", short: "PAGKAIN" },
  { slug: "hayop", label: "Hayop at Kalikasan", short: "HAYOP" },
  { slug: "wika", label: "Wika", short: "WIKA" },
  { slug: "tao", label: "Mga Bayani at Tao", short: "TAO" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const categoryOf = (slug: string) => CATEGORIES.find((c) => c.slug === slug)!;
