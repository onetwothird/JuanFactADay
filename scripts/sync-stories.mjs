// Copies only the web-safe files of each story from the video project into content/stories/.
// Usage: npm run sync -- ../juan_fact_a_day/stories   (default path shown)
import fs from "node:fs";
import path from "node:path";

const src = path.resolve(process.argv[2] ?? "../juan_fact_a_day/stories");
const dst = path.resolve("content/stories");
const KEEP = ["story.json", "caption.txt", "site.json", "thumbnail.jpg"];

if (!fs.existsSync(src)) {
  console.error(`Source folder not found: ${src}`);
  process.exit(1);
}
let n = 0;
for (const d of fs.readdirSync(src, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const from = path.join(src, d.name);
  if (!fs.existsSync(path.join(from, "story.json"))) continue;
  const to = path.join(dst, d.name);
  fs.mkdirSync(to, { recursive: true });
  for (const f of KEEP) {
    if (fs.existsSync(path.join(from, f))) fs.copyFileSync(path.join(from, f), path.join(to, f));
  }
  // scene cards -> public/cards/<slug>/ (used by the fact page flip-viewer)
  const site = fs.existsSync(path.join(from, "site.json")) ? JSON.parse(fs.readFileSync(path.join(from, "site.json"), "utf-8")) : {};
  const slug = site.slug ?? d.name.replace(/^\d+_/, "");
  const cardsSrc = path.join(from, "cards");
  if (fs.existsSync(cardsSrc)) {
    const cardsDst = path.resolve("public/cards", slug);
    fs.mkdirSync(cardsDst, { recursive: true });
    for (const c of fs.readdirSync(cardsSrc)) if (/\.(jpe?g|png|webp)$/i.test(c)) fs.copyFileSync(path.join(cardsSrc, c), path.join(cardsDst, c));
  }
  n++;
}
console.log(`Synced ${n} stories into ${dst}`);
