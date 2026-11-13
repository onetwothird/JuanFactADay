# Local admin page: design

## Intent
Adding a story by hand-editing `site.json`, `site.en.json`, `caption.txt` and copying the video and card files is a hassle. The goal is a private admin page where content is entered through a form and published to the live Vercel site with one click.

## Goals
- `/admin` page with a story list and an edit form covering every `site.json`, `site.en.json` and `caption.txt` field.
- File pickers for the video (.mp4), captions (.vtt), poster, thumbnail, scene cards and `story.json`. Each file is written to the right place (`public/videos/<slug>.*`, `public/cards/<slug>/`, `content/stories/<folder>/`).
- An "Import from video project" action that runs the existing sync script.
- A Publish button that validates the story, then commits only that story's files and pushes, so Vercel redeploys.
- A draft toggle (`"draft": true`).

## Non-goals
- Online/remote use, a login system, cloud media storage.
- Generating the video, cards or `story.json` (that stays in the video project).

## Anti-goals
- The admin page or its APIs must never work on the deployed site. In production they return 404.
- Publish must never sweep unrelated working-tree changes into its commit.

## Constraints
- Next.js 15 App Router, static site, no database, content lives in git.
- `lib/facts.ts` requires `story.json` in every story folder. A new story needs one, either imported or uploaded.
- `lib/facts.ts` caches facts in memory, so the dev server must re-read content after edits.

## Approaches
1. **Local admin (chosen):** it runs under `npm run dev`, writes files directly and uses git to publish. It's safe (no secrets online), free, and can reach the video project's folders on the PC.
2. Online admin on Vercel: needs a password, a GitHub token on Vercel, and Vercel Blob for videos over 4.5 MB. It can't reach the PC's video project. Rejected because content is always made on the PC.
3. Off-the-shelf git CMS (Keystatic/Decap): generic forms, awkward for large videos and this project's file layout. Rejected.

## Design
- `app/admin/page.tsx`: client UI. It renders `notFound()` unless `NODE_ENV === "development"`.
- `app/api/admin/...` route handlers, each guarded by the same check:
  - `GET stories`: list folders with parsed site/site.en/caption plus which media files exist.
  - `POST stories`: create a new folder (`NNN_<slug>`, next number).
  - `PUT stories/[folder]`: write site.json, site.en.json, caption.txt.
  - `POST upload`: multipart upload of one file, given a kind, written to the right path.
  - `POST sync`: run `scripts/sync-stories.mjs <source>`. The source path comes from `ADMIN_STORIES_SRC` in `.env.local` or is typed in the UI.
  - `POST publish`: validate (title, slug, category, at least one source, story.json present), then `git add` only that story's paths, commit `content: publish story NNN <slug>`, and push. Output is returned to the UI.
- `robots.ts` disallows `/admin`.
- `lib/facts.ts` skips its cache in development.

## Left to the builder
Visual styling (reuse the site's tokens), exact form layout, and error message wording.
