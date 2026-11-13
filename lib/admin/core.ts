/* Pure admin helpers. No imports, so `node --test` can load this file directly. */

export type UploadKind = "video" | "vtt" | "poster" | "thumbnail" | "card" | "story";
export const UPLOAD_KINDS: UploadKind[] = ["video", "vtt", "poster", "thumbnail", "card", "story"];

export function safeName(s: string): boolean {
  return typeof s === "string" && /^[a-z0-9][a-z0-9._-]*$/i.test(s) && !s.includes("..");
}

export function uploadTarget(kind: UploadKind, folder: string, slug: string, fileName: string): string {
  for (const n of [folder, slug, fileName]) if (!safeName(n)) throw new Error(`Invalid name: ${n}`);
  switch (kind) {
    case "video":
      return `public/videos/${slug}.mp4`;
    case "vtt":
      return `public/videos/${slug}.vtt`;
    case "poster":
      return `public/videos/${slug}-poster.jpg`;
    case "thumbnail":
      return `content/stories/${folder}/thumbnail.jpg`;
    case "story":
      return `content/stories/${folder}/story.json`;
    case "card":
      return `public/cards/${slug}/${fileName}`;
    default:
      throw new Error(`Unknown upload kind: ${kind}`);
  }
}

export function nextFolderName(existing: string[], slug: string): { folder: string; number: number } {
  const max = existing.reduce((m, f) => Math.max(m, parseInt(f, 10) || 0), 0);
  const number = max + 1;
  return { folder: `${String(number).padStart(3, "0")}_${slug.replace(/-/g, "_")}`, number };
}

export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** True when the caption has a "Sources" line followed by at least one "- ..." line with a URL. */
function hasSources(caption: string): boolean {
  const lines = caption.split(/\r?\n/);
  const idx = lines.findIndex((l) => /^\s*sources\b/i.test(l));
  if (idx === -1) return false;
  return lines.slice(idx + 1).some((l) => /^\s*-\s*.*https?:\/\//.test(l));
}

export function validateStory(
  s: { site: any; caption: string; hasStoryJson: boolean },
  categories: string[],
): string[] {
  const site = s.site ?? {};
  const errs: string[] = [];
  if (!String(site.title ?? "").trim()) errs.push("Title is required.");
  if (!safeName(String(site.slug ?? ""))) errs.push("Slug is required (letters, numbers and dashes only).");
  if (!categories.includes(site.category)) errs.push(`Category must be one of: ${categories.join(", ")}.`);
  if (!Number.isInteger(Number(site.number)) || Number(site.number) < 1) errs.push("Number must be a whole number of 1 or more.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(site.published ?? ""))) errs.push("Published date must look like 2026-11-13.");
  if (!hasSources(s.caption ?? "")) errs.push('Caption needs a "Sources" section with at least one "- ... https://..." line. No sources, no publish.');
  if (!s.hasStoryJson) errs.push("story.json is missing. Import it from the video project or upload it in the Media tab.");
  (site.quiz ?? []).forEach((q: any, i: number) => {
    const n = Array.isArray(q?.options) ? q.options.length : 0;
    if (!String(q?.q ?? "").trim()) errs.push(`Quiz question ${i + 1} has no text.`);
    if (n < 2) errs.push(`Quiz question ${i + 1} needs at least 2 options.`);
    if (!Number.isInteger(q?.answer) || q.answer < 0 || q.answer >= n) errs.push(`Quiz question ${i + 1} has no valid correct answer.`);
  });
  return errs;
}

export function publishPaths(folder: string, slug: string): string[] {
  return [
    `content/stories/${folder}`,
    `public/videos/${slug}.mp4`,
    `public/videos/${slug}.vtt`,
    `public/videos/${slug}-poster.jpg`,
    `public/cards/${slug}`,
  ];
}

export function commitMessage(number: number, slug: string): string {
  return `content: publish story ${String(number).padStart(3, "0")} ${slug}`;
}
