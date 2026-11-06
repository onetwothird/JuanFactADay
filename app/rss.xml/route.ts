import { getAllFacts, SITE } from "@/lib/facts";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const items = getAllFacts()
    .map(
      (f) => `<item><title>${esc(f.title)}</title><link>${SITE.url}/facts/${f.slug}</link><guid>${SITE.url}/facts/${f.slug}</guid>${
        f.published ? `<pubDate>${new Date(f.published + "T19:30:00+08:00").toUTCString()}</pubDate>` : ""
      }<description>${esc(f.script.slice(0, 2).join(" "))}</description></item>`,
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE.name}</title><link>${SITE.url}</link><description>${esc(SITE.tagline)}</description><language>fil</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
