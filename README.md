# Juan Fact a Day: website

Isang kaalaman tungkol sa Pilipinas, araw-araw. 🇵🇭
The website for the **Juan Fact a Day** Facebook page: a searchable archive of every fact, with full sources, a quiz, and a page for each fact that Google can find.

Built with **Next.js 15 (App Router) + React + TypeScript**. Every page is pre-rendered to static HTML; there is no database.

## Run it on your computer

You need [Node.js 20+](https://nodejs.org).

```bash
npm install
npm run dev        # open http://localhost:3000
```

To check the production build: `npm run build && npm start`.

## Add a new fact

Each fact is one folder in `content/stories/`:

```
content/stories/004_tarsier/
├── story.json      # the video script (scenes[].lines[].text is used as the article)
├── caption.txt     # social caption; lines after "Sources" that start with "- " become the source list
├── site.json       # website info: number, slug, title, category, tags, dates, takeaways, quiz, links
└── thumbnail.jpg   # optional; the first scene card is used if missing
```

Scene cards go in `public/cards/<slug>/` with the same names as the `image` files in `story.json`
(for example `cards/v1_0.jpg` → `public/cards/<slug>/v1_0.jpg`). They power the card viewer on the fact page.

Copy `content/stories/001_7641-na-isla/site.json` as a starting point. Categories:
`kasaysayan`, `kultura`, `lugar`, `pagkain`, `hayop`, `wika`, `tao`.

If your video project keeps stories elsewhere, `npm run sync -- <path-to-stories>` copies only the web files
(`story.json`, `caption.txt`, `site.json`, `thumbnail.jpg`, `cards/`). Videos (`.mp4`) are never committed.

**Rule:** every fact needs real sources in `caption.txt`. No sources, no publish.

## Deploy on Vercel (free)

1. Push this folder to GitHub.
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo → **Deploy**. No settings needed.
3. Project → **Analytics** → enable Web Analytics.
4. Optional environment variables (Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SITE_URL`: your final URL, e.g. `https://juanfactaday.vercel.app` (used for sitemap, share links and Open Graph)
   - `NEXT_PUBLIC_FORMSPREE_ID`: the form ID from [formspree.io](https://formspree.io) for the "Suggest a topic" form
5. Submit `https://<your-site>/sitemap.xml` in Google Search Console.

> Vercel's free Hobby plan is for non-commercial use. If you later add AdSense, sponsors or merch, move to Vercel Pro or Cloudflare Pages.

## What's inside

| Path | What it is |
|---|---|
| `/` | Home: hero with Juan, today's fact, recent facts, categories, quiz teaser, follow links |
| `/facts` | Archive with instant search (Fuse.js), category filter and sort |
| `/facts/[slug]` | Fact page: card viewer, full story, big number, takeaways, sources, share bar, prev/next, related |
| `/kategorya/[cat]` | Facts per category |
| `/quiz` | 5 random questions from all facts, Juan reacts, shareable score image, best score saved in the browser |
| `/random` | Redirects to a random fact |
| `/tungkol`, `/suggest`, `/privacy` | About, suggest-a-topic form, privacy |
| `/sitemap.xml`, `/robots.txt`, `/rss.xml` | SEO and feed |
| `/facts/[slug]/opengraph-image` | Auto-generated 1200×630 share image per fact |

`components/Juan.tsx` draws Juan as inline SVG in five poses: `default`, `thinking`, `excited`, `oops`, `peek`.
Brand colors live in `styles/tokens.css`.

## License

The **code** is MIT (see `LICENSE`).
The **Juan Fact a Day name, the Juan mascot, the artwork, fact cards and scripts** are © Angelito P. Decatoria III, all rights reserved.
Poppins font: SIL Open Font License.
