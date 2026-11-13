import fs from "node:fs";
import path from "node:path";
import { CATEGORIES, type CategorySlug } from "./categories";
import type { Lang } from "./i18n";

const STORIES_DIR = path.join(process.cwd(), "content", "stories");

export type QuizQ = { q: string; options: string[]; answer: number };
export type Source = { label: string; urls: string[] };

export type Fact = {
  folder: string;
  number: number;
  slug: string;
  title: string;
  category: CategorySlug;
  tags: string[];
  published: string;
  verified: string;
  bigNumber: string | null;
  bigNumberLabel: string | null;
  takeaways: string[];
  extra: string[];
  quiz: QuizQ[];
  links: { facebook?: string; tiktok?: string; instagram?: string; video?: string };
  video: string | null; // public path of the self-hosted MP4
  captions: string | null; // public path of the .vtt
  poster: string;
  duration: number | null; // seconds
  script: string[]; // narration lines, in order
  paragraphs: string[]; // article body: one paragraph per scene, social CTAs removed
  caption: string; // caption without the Sources block
  sources: Source[];
  cards: string[]; // public paths of the scene cards
  thumbnail: string; // public path
  translated: boolean; // true when the text comes from site.en.json (English view)
};

/* English overlay, from content/stories/<folder>/site.en.json. Every field is optional; whatever is
   missing stays in Filipino. Quiz items only carry text (q/options): the answer index comes from site.json. */
type FactEn = {
  title?: string;
  big_number_label?: string;
  takeaways?: string[];
  extra?: string[];
  paragraphs?: string[];
  quiz?: { q: string; options: string[] }[];
};
const english = new Map<string, FactEn>(); // by slug

type StoryJson = {
  title?: string;
  scenes: { image?: string; lines?: { text: string; say?: string }[] }[];
};

function parseCaption(raw: string): { caption: string; sources: Source[] } {
  const lines = raw.split(/\r?\n/);
  const idx = lines.findIndex((l) => /^\s*sources\b/i.test(l));
  if (idx === -1) return { caption: raw.trim(), sources: [] };
  const sources: Source[] = [];
  for (const l of lines.slice(idx + 1)) {
    const m = l.match(/^\s*-\s*(.+)$/);
    if (!m) continue;
    const urls = m[1].match(/https?:\/\/[^\s,]+/g) ?? [];
    const label = m[1].replace(/https?:\/\/[^\s,]+/g, "").replace(/[\s,:]+$/g, "").replace(/\s+,/g, ",").trim();
    sources.push({ label, urls });
  }
  return { caption: lines.slice(0, idx).join("\n").trim(), sources };
}

let cache: Fact[] | null = null;
// In dev the admin page edits content while the server runs, so always re-read it.
const DEV = process.env.NODE_ENV === "development";

export function getAllFacts(): Fact[] {
  if (cache && !DEV) return cache;
  english.clear();
  const folders = fs
    .readdirSync(STORIES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  // A story folder with "draft": true in site.json is skipped (handy for work in progress).
  const live = folders.filter((folder) => {
    const p = path.join(STORIES_DIR, folder, "site.json");
    if (fs.existsSync(p) && JSON.parse(fs.readFileSync(p, "utf-8")).draft === true) return false;
    // A folder without a usable story.json (e.g. a half-made story) is skipped, not allowed to break every page.
    try {
      const story = JSON.parse(fs.readFileSync(path.join(STORIES_DIR, folder, "story.json"), "utf-8"));
      if (Array.isArray(story?.scenes)) return true;
    } catch {}
    console.warn(`[facts] Skipping ${folder}: story.json is missing or has no "scenes" list.`);
    return false;
  });

  const facts: Fact[] = live.map((folder) => {
    const dir = path.join(STORIES_DIR, folder);
    const story: StoryJson = JSON.parse(fs.readFileSync(path.join(dir, "story.json"), "utf-8"));
    const site = fs.existsSync(path.join(dir, "site.json"))
      ? JSON.parse(fs.readFileSync(path.join(dir, "site.json"), "utf-8"))
      : {};
    const captionRaw = fs.existsSync(path.join(dir, "caption.txt"))
      ? fs.readFileSync(path.join(dir, "caption.txt"), "utf-8")
      : "";
    const { caption, sources } = parseCaption(captionRaw);
    const enPath = path.join(dir, "site.en.json");

    // Narration: always use `text` (never `say`, which is phonetic spelling for the voice).
    const script = story.scenes.flatMap((s) => (s.lines ?? []).map((l) => l.text));
    const isCta = (t: string) => /i-(comment|follow|share)|comment mo|follow si juan/i.test(t);
    const sceneTexts = story.scenes
      .map((s) => (s.lines ?? []).map((l) => l.text).filter((t) => !isCta(t)).join(" ").trim())
      .filter(Boolean);
    const paragraphs: string[] = [];
    for (let i = 0; i < sceneTexts.length; i += 3) paragraphs.push(sceneTexts.slice(i, i + 3).join(" "));

    const slug: string = site.slug ?? folder.replace(/^\d+_/, "");
    const cardDir = path.join(process.cwd(), "public", "cards", slug);
    const cards = fs.existsSync(cardDir)
      ? story.scenes
          .map((s) => path.basename(s.image ?? "", path.extname(s.image ?? "")))
          .filter((n) => n && fs.existsSync(path.join(cardDir, `${n}.jpg`)))
          .map((n) => `/cards/${slug}/${n}.jpg`)
      : [];

    const number = Number(site.number ?? parseInt(folder, 10));
    const category = (site.category ?? "kultura") as CategorySlug;
    if (!CATEGORIES.find((c) => c.slug === category)) {
      throw new Error(`Unknown category "${category}" in ${folder}/site.json`);
    }

    if (fs.existsSync(enPath)) english.set(slug, JSON.parse(fs.readFileSync(enPath, "utf-8")));

    return {
      translated: false,
      folder,
      number,
      slug,
      title: site.title ?? story.title ?? folder,
      category,
      tags: site.tags ?? [],
      published: site.published ?? "",
      verified: site.verified ?? site.published ?? "",
      bigNumber: site.big_number ?? null,
      bigNumberLabel: site.big_number_label ?? null,
      takeaways: site.takeaways ?? [],
      extra: site.extra ?? [],
      quiz: site.quiz ?? [],
      links: site.links ?? {},
      script,
      paragraphs,
      caption,
      sources,
      cards,
      thumbnail: fs.existsSync(path.join(process.cwd(), "public", "videos", `${slug}-poster.jpg`)) ? `/videos/${slug}-poster.jpg` : cards[0] ?? `/juan/juan_profile.jpg`,
      video: fs.existsSync(path.join(process.cwd(), "public", "videos", `${slug}.mp4`)) ? `/videos/${slug}.mp4` : null,
      captions: fs.existsSync(path.join(process.cwd(), "public", "videos", `${slug}.vtt`)) ? `/videos/${slug}.vtt` : null,
      poster: fs.existsSync(path.join(process.cwd(), "public", "videos", `${slug}-poster.jpg`)) ? `/videos/${slug}-poster.jpg` : cards[0] ?? `/juan/juan_profile.jpg`,
      duration: site.duration ?? null,
    };
  });

  const seen = new Set<string>();
  for (const f of facts) {
    if (seen.has(f.slug)) throw new Error(`Duplicate slug "${f.slug}" in content/stories. Delete the old folder or mark it "draft": true.`);
    seen.add(f.slug);
  }

  // newest first
  cache = facts.sort((a, b) => b.number - a.number);
  return cache;
}

/* Facts in the requested language (English overlay applied where available). */
const byLang = new Map<Lang, Fact[]>();
export function getFacts(lang: Lang): Fact[] {
  const base = getAllFacts();
  if (lang === "fil") return base;
  const hit = byLang.get(lang);
  if (hit && !DEV) return hit;
  const list = base.map((f) => {
    const e = english.get(f.slug);
    if (!e) return f;
    return {
      ...f,
      translated: true,
      title: e.title ?? f.title,
      bigNumberLabel: e.big_number_label ?? f.bigNumberLabel,
      takeaways: e.takeaways ?? f.takeaways,
      extra: e.extra ?? f.extra,
      paragraphs: e.paragraphs ?? f.paragraphs,
      // keep the Filipino answer index; only swap text when the item lines up
      quiz: f.quiz.map((q, k) => (e.quiz?.[k] && e.quiz[k].options.length === q.options.length ? { ...q, q: e.quiz[k].q, options: e.quiz[k].options } : q)),
    };
  });
  byLang.set(lang, list);
  return list;
}

export function getFact(slug: string, lang: Lang = "fil") {
  return getFacts(lang).find((f) => f.slug === slug) ?? null;
}

export function getNeighbours(slug: string, lang: Lang = "fil") {
  const list = [...getFacts(lang)].sort((a, b) => a.number - b.number);
  const i = list.findIndex((f) => f.slug === slug);
  return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
}

export function getRelated(fact: Fact, n = 3, lang: Lang = "fil") {
  const others = getFacts(lang).filter((f) => f.slug !== fact.slug);
  const same = others.filter((f) => f.category === fact.category);
  const rest = others.filter((f) => f.category !== fact.category);
  return [...same, ...rest].slice(0, n);
}

export { pad, formatDate, SITE } from "./util";

import { categoryOf as _cat, catLabel as _catLabel } from "./categories";
import type { ReelItem } from "@/components/ReelShelf";
export function toReel(f: Fact, lang: Lang = "fil"): ReelItem {
  return { slug: f.slug, number: f.number, title: f.title, category: _catLabel(_cat(f.category), lang), poster: f.poster, video: f.video, captions: f.captions, duration: f.duration };
}
