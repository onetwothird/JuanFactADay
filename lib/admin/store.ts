/* Node-only file and git operations for the dev admin page. */
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { CATEGORIES } from "@/lib/categories";
import { SITE } from "@/lib/util";
import {
  branchError,
  commitMessage,
  saveErrors,
  storyJsonError,
  nextFolderName,
  publishPaths,
  safeName,
  slugify,
  uploadTarget,
  validateStory,
  type UploadKind,
} from "./core";

const ROOT = process.cwd();
const STORIES = path.join(ROOT, "content", "stories");

export type StoryRecord = {
  folder: string;
  site: any;
  siteEn: any;
  caption: string;
  hasStoryJson: boolean;
  media: { video: boolean; vtt: boolean; poster: boolean; thumbnail: boolean; cards: string[] };
};

const readJson = (p: string) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf-8")) : null);
// Keep the line endings a file already has (Windows checkouts use CRLF) so saves do not churn git diffs.
function writeText(p: string, text: string) {
  const crlf = fs.existsSync(p) && fs.readFileSync(p, "utf-8").includes("\r\n");
  const norm = text.replace(/\r\n/g, "\n");
  fs.writeFileSync(p, crlf ? norm.replace(/\n/g, "\r\n") : norm, "utf-8");
}
// Same layout as the existing files: 1-space indent, no trailing newline.
const writeJson = (p: string, v: unknown) => writeText(p, JSON.stringify(v, null, 1));
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

function storyDir(folder: string): string {
  if (!safeName(folder)) throw new Error("Invalid story folder.");
  return path.join(STORIES, folder);
}

function slugOf(folder: string): string {
  const site = readJson(path.join(storyDir(folder), "site.json")) ?? {};
  return site.slug ?? folder.replace(/^\d+_/, "");
}

function storyJsonOk(p: string): boolean {
  try {
    return storyJsonError(JSON.parse(fs.readFileSync(p, "utf-8"))) === null;
  } catch {
    return false;
  }
}

export function readStory(folder: string): StoryRecord {
  const dir = storyDir(folder);
  if (!fs.existsSync(dir)) throw new Error(`Story folder not found: ${folder}`);
  const site = readJson(path.join(dir, "site.json")) ?? {};
  const slug = site.slug ?? folder.replace(/^\d+_/, "");
  const vid = (f: string) => fs.existsSync(path.join(ROOT, "public", "videos", f));
  const cardDir = path.join(ROOT, "public", "cards", slug);
  return {
    folder,
    site,
    siteEn: readJson(path.join(dir, "site.en.json")) ?? {},
    caption: fs.existsSync(path.join(dir, "caption.txt")) ? fs.readFileSync(path.join(dir, "caption.txt"), "utf-8") : "",
    hasStoryJson: storyJsonOk(path.join(dir, "story.json")),
    media: {
      video: vid(`${slug}.mp4`),
      vtt: vid(`${slug}.vtt`),
      poster: vid(`${slug}-poster.jpg`),
      thumbnail: fs.existsSync(path.join(dir, "thumbnail.jpg")),
      cards: fs.existsSync(cardDir) ? fs.readdirSync(cardDir).filter((c) => /\.(jpe?g|png|webp)$/i.test(c)).sort() : [],
    },
  };
}

export function listStories(): StoryRecord[] {
  return fs
    .readdirSync(STORIES, { withFileTypes: true })
    .filter((d) => d.isDirectory() && safeName(d.name))
    .map((d) => d.name)
    .sort()
    .map(readStory);
}

export function createStory(title: string): StoryRecord {
  const slug = slugify(title);
  if (!slug) throw new Error("Give the story a title first.");
  const existing = fs.readdirSync(STORIES, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  if (existing.some((f) => slugOf(f) === slug)) throw new Error(`A story with the slug "${slug}" already exists.`);
  const { folder, number } = nextFolderName(existing, slug);
  fs.mkdirSync(path.join(STORIES, folder), { recursive: true });
  writeJson(path.join(STORIES, folder, "site.json"), {
    number,
    slug,
    title: title.trim(),
    category: "kultura",
    tags: [],
    published: today(),
    verified: today(),
    draft: true,
    takeaways: [],
    quiz: [],
    links: { facebook: SITE.facebook },
  });
  return readStory(folder);
}

const hasContent = (v: unknown): boolean =>
  Array.isArray(v) ? v.some(hasContent) : v && typeof v === "object" ? Object.values(v).some(hasContent) : typeof v === "string" ? v.trim() !== "" : v != null;

export function saveStory(folder: string, data: { site: any; siteEn: any; caption: string }): StoryRecord {
  const dir = storyDir(folder);
  if (!fs.existsSync(dir)) throw new Error(`Story folder not found: ${folder}`);
  const others = fs
    .readdirSync(STORIES, { withFileTypes: true })
    .filter((d) => d.isDirectory() && safeName(d.name))
    .map((d) => ({ folder: d.name, slug: slugOf(d.name) }));
  const errs = saveErrors(folder, data.site, storyJsonOk(path.join(dir, "story.json")), others);
  if (errs.length) throw new Error(errs.join("\n"));
  writeJson(path.join(dir, "site.json"), data.site);
  if (hasContent(data.siteEn) || fs.existsSync(path.join(dir, "site.en.json"))) writeJson(path.join(dir, "site.en.json"), data.siteEn ?? {});
  writeText(path.join(dir, "caption.txt"), data.caption ?? "");
  return readStory(folder);
}

export function saveUpload(folder: string, kind: UploadKind, fileName: string, bytes: Buffer): string {
  storyDir(folder);
  const rel = uploadTarget(kind, folder, slugOf(folder), fileName);
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, bytes);
  return rel;
}

export function deleteCard(folder: string, fileName: string): void {
  const abs = path.join(ROOT, uploadTarget("card", folder, slugOf(folder), fileName));
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
}

type Run = { code: number; out: string };
function run(cmd: string, args: string[]): Promise<Run> {
  return new Promise((resolve) => {
    execFile(cmd, args, { cwd: ROOT, maxBuffer: 10 * 1024 * 1024, windowsHide: true }, (err, stdout, stderr) => {
      const code = err ? (typeof (err as any).code === "number" ? (err as any).code : 1) : 0;
      resolve({ code, out: `$ ${cmd} ${args.join(" ")}\n${stdout}${stderr}${err && !stdout && !stderr ? String(err.message) + "\n" : ""}` });
    });
  });
}

export async function runSync(source: string): Promise<{ ok: boolean; log: string }> {
  if (!source || !fs.existsSync(source)) return { ok: false, log: `Folder not found: ${source || "(empty)"}` };
  const r = await run(process.execPath, [path.join(ROOT, "scripts", "sync-stories.mjs"), source]);
  return { ok: r.code === 0, log: r.out };
}

export async function publish(folder: string): Promise<{ ok: boolean; errors: string[]; log: string }> {
  const story = readStory(folder);
  const errors = validateStory(story, CATEGORIES.map((c) => c.slug));
  const branch = (await run("git", ["rev-parse", "--abbrev-ref", "HEAD"])).out.split("\n")[1]?.trim() ?? "";
  const wrongBranch = branchError(branch);
  if (wrongBranch) errors.push(wrongBranch);
  if (errors.length) return { ok: false, errors, log: "" };

  // Commits already waiting on main get pushed too: say so, so nothing goes out unnoticed.
  const pending = (await run("git", ["log", "--oneline", "@{u}..HEAD"])).out.split("\n").slice(1).filter(Boolean);

  // Only this story's paths: anything that exists on disk, or is tracked (so deletions are committed too).
  const paths: string[] = [];
  for (const p of publishPaths(folder, story.site.slug)) {
    if (fs.existsSync(path.join(ROOT, p))) paths.push(p);
    else if ((await run("git", ["ls-files", "--", p])).out.split("\n").slice(1).join("").trim()) paths.push(p);
  }
  let log = "";
  const step = async (args: string[]) => {
    const r = await run("git", args);
    log += r.out;
    return r.code;
  };

  if ((await step(["add", "-A", "--", ...paths])) !== 0) return { ok: false, errors: [], log };
  const changed = (await run("git", ["diff", "--cached", "--quiet", "--", ...paths])).code !== 0;
  if (changed) {
    if ((await step(["commit", "-m", commitMessage(Number(story.site.number), story.site.slug), "--", ...paths])) !== 0)
      return { ok: false, errors: [], log };
  } else {
    log += "Nothing new to commit for this story. Pushing anything not yet on GitHub.\n";
  }
  if (pending.length) log += `\nAlso sent to GitHub (commits you made earlier that were not pushed yet):\n${pending.join("\n")}\n\n`;
  const pushed = (await step(["push"])) === 0;
  if (!pushed) log += "\nThe commit is saved on your computer but did not reach GitHub. Fix the problem above and click Publish again.\n";
  return { ok: pushed, errors: [], log };
}
