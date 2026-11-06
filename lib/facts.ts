import fs from "node:fs";
import path from "node:path";
import { CATEGORIES, type CategorySlug } from "./categories";

const STORIES_DIR = path.join(process.cwd(), "content", "stories");

export type QuizQ = { q: string; options: string[]; answer: number };
export type Source = { label: string; url: string };

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
  script: string[]; // narration lines, in order
  paragraphs: string[]; // article body: one paragraph per scene, social CTAs removed
  caption: string; // caption without the Sources block
  sources: Source[];
  cards: string[]; // public paths of the scene cards
  thumbnail: string; // public path
};

type StoryJson = {
  title?: string;
  scenes: { image?: string; lines?: { text: string; say?: string }[] }[];
};

function parseCaption(raw: string): { caption: string; sources: Source[] } {
  const lines = raw.split(/\r?\n/);
  const idx = lines.findIndex((l) => /^\s*sources\s*:?\s*$/i.test(l));
  if (idx === -1) return { caption: raw.trim(), sources: [] };
  const sources: Source[] = [];
  for (const l of lines.slice(idx + 1)) {
    const m = l.match(/^\s*-\s*(.*?)\s*(https?:\/\/\S+)\s*$/);
    if (m) sources.push({ label: m[1].replace(/[:\-–\s]+$/, "") || m[2], url: m[2] });
  }
  return { caption: lines.slice(0, idx).join("\n").trim(), sources };
}

let cache: Fact[] | null = null;

export function getAllFacts(): Fact[] {
  if (cache) return cache;
  const folders = fs
    .readdirSync(STORIES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const facts: Fact[] = folders.map((folder) => {
    const dir = path.join(STORIES_DIR, folder);
    const story: StoryJson = JSON.parse(fs.readFileSync(path.join(dir, "story.json"), "utf-8"));
    const site = fs.existsSync(path.join(dir, "site.json"))
      ? JSON.parse(fs.readFileSync(path.join(dir, "site.json"), "utf-8"))
      : {};
    const captionRaw = fs.existsSync(path.join(dir, "caption.txt"))
      ? fs.readFileSync(path.join(dir, "caption.txt"), "utf-8")
      : "";
    const { caption, sources } = parseCaption(captionRaw);

    // Narration: always use `text` (never `say`, which is phonetic spelling for the voice).
    const script = story.scenes.flatMap((s) => (s.lines ?? []).map((l) => l.text));
    const isCta = (t: string) => /i-(comment|follow|share)|comment mo|follow si juan/i.test(t);
    const paragraphs = story.scenes
      .map((s) => (s.lines ?? []).map((l) => l.text).filter((t) => !isCta(t)).join(" ").trim())
      .filter(Boolean);

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

    return {
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
      thumbnail: cards[0] ?? `/juan/juan_profile.jpg`,
    };
  });

  // newest first
  cache = facts.sort((a, b) => b.number - a.number);
  return cache;
}

export function getFact(slug: string) {
  return getAllFacts().find((f) => f.slug === slug) ?? null;
}

export function getNeighbours(slug: string) {
  const list = [...getAllFacts()].sort((a, b) => a.number - b.number);
  const i = list.findIndex((f) => f.slug === slug);
  return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
}

export function getRelated(fact: Fact, n = 3) {
  const others = getAllFacts().filter((f) => f.slug !== fact.slug);
  const same = others.filter((f) => f.category === fact.category);
  const rest = others.filter((f) => f.category !== fact.category);
  return [...same, ...rest].slice(0, n);
}

export { pad, formatDate, SITE } from "./util";
