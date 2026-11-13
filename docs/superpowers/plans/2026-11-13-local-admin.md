# Local Admin Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A dev-only `/admin` page to create and edit stories, upload their media, import from the video project, and publish (git commit and push) with one click.

**Architecture:** Pure logic (validation, file-path mapping, folder naming) lives in `lib/admin/core.ts` and is unit-tested with `node --test`. Node-only I/O (read/write story files, git) lives in `lib/admin/store.ts`. Thin Next.js route handlers under `app/api/admin/` expose the store, and a client page at `app/admin/page.tsx` renders the UI. Every admin route returns 404 unless `NODE_ENV === "development"`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Node 24 (`node --test` with native TS type stripping), git CLI via `child_process.execFile`.

**Spec:** `docs/superpowers/specs/2026-11-13-local-admin-design.md`

## Global Constraints
- Admin pages and APIs must return 404 when `process.env.NODE_ENV !== "development"`.
- Publish commits only the story's own paths: `content/stories/<folder>/`, `public/videos/<slug>.mp4`, `public/videos/<slug>.vtt`, `public/videos/<slug>-poster.jpg`, `public/cards/<slug>/`.
- Commit message: `content: publish story NNN <slug>` (NNN = zero-padded 3 digits).
- Categories come from `CATEGORIES` in `lib/categories.ts`. No new dependencies.
- JSON is written with 1-space indentation (matches the existing files) and a trailing newline.
- `lib/admin/core.ts` has no imports (so `node --test` can load it without path aliases). Tests live in `tests/` and `tests` is added to tsconfig `exclude`.

## Review Focus
- Folder/slug values from the client containing `..`, `/` or `\` → rejected with 400, never written outside `content/stories` or `public`. (Task 1 `safeName` tests)
- Publish when the story has unrelated user changes elsewhere in the repo (e.g., staged files) → those files are not committed. (Task 2: commit uses `git commit -- <paths>`)
- Publish when `git push` fails (offline, auth) → the commit is kept locally and the UI shows the git error text, not a generic failure. (Task 2 `publish` returns `{ok:false, log}`)
- A new story without `story.json` → `lib/facts.ts` would crash the whole site; validation blocks publish and the new folder is created with `"draft": true`. (Task 1 `validateStory` test, Task 2 `createStory`)
- Editing in admin while the dev server runs → the public pages show the change without a restart. (Task 2: facts cache disabled in dev)

---

### Task 1: Pure core logic

**Files:**
- Create: `lib/admin/core.ts`
- Create: `tests/admin-core.test.ts`
- Modify: `tsconfig.json` (add `"tests"` to `exclude`), `package.json` (add `"test": "node --test tests/"`)

**Interfaces:**
- Produces:
  - `type UploadKind = "video" | "vtt" | "poster" | "thumbnail" | "card" | "story"`
  - `safeName(s: string): boolean` – true only for `/^[a-z0-9][a-z0-9._-]*$/i` and not containing `..`
  - `uploadTarget(kind: UploadKind, folder: string, slug: string, fileName: string): string` – repo-relative path with forward slashes:
    video → `public/videos/<slug>.mp4`, vtt → `public/videos/<slug>.vtt`, poster → `public/videos/<slug>-poster.jpg`, thumbnail → `content/stories/<folder>/thumbnail.jpg`, story → `content/stories/<folder>/story.json`, card → `public/cards/<slug>/<fileName>`. Throws if any name fails `safeName`.
  - `nextFolderName(existing: string[], slug: string): { folder: string; number: number }` – number = max leading int + 1; folder = `NNN_<slug with - replaced by _>`
  - `slugify(title: string): string` – lowercase, strip accents, non-alnum → `-`, trimmed, max 60 chars
  - `validateStory(s: { site: any; caption: string; hasStoryJson: boolean }): string[]` – error messages; checks `title`, `slug`, `category` in the passed `categories: string[]` (second param), `number`, `published` as `YYYY-MM-DD`, at least one `- ` line with a URL after a `Sources` line in the caption, and `hasStoryJson`. Each quiz `answer` must be within the options' range.
  - `publishPaths(folder: string, slug: string): string[]` – the five paths from Global Constraints
  - `commitMessage(number: number, slug: string): string`

- [ ] **Step 1: Write failing tests** in `tests/admin-core.test.ts` (import from `../lib/admin/core.ts`, using `node:test` + `node:assert/strict`):
  - `safeName`: `"005_rizal"` true; `"../x"`, `"a/b"`, `"a\\b"`, `""` false.
  - `uploadTarget("video","005_r","rizal","x.mp4")` → `"public/videos/rizal.mp4"`; `("card","005_r","rizal","01_hook.jpg")` → `"public/cards/rizal/01_hook.jpg"`; `("card","005_r","rizal","../evil.jpg")` throws.
  - `nextFolderName(["001_a","005_b"],"tarsier-bohol")` → `{folder:"006_tarsier_bohol", number:6}`; `nextFolderName([], "x")` → number 1.
  - `slugify("Gusto ba ni Rizal?")` → `"gusto-ba-ni-rizal"`; `slugify("Ñino José")` → `"nino-jose"`.
  - `validateStory` on the real 005 site.json and caption → `[]`; with caption lacking sources → contains a message matching `/source/i`; with `hasStoryJson:false` → matches `/story\.json/`; quiz answer 5 with 3 options → matches `/quiz/i`.
  - `commitMessage(5,"rizal")` → `"content: publish story 005 rizal"`.
- [ ] **Step 2:** `npm test`. Expected: FAIL (module not found).
- [ ] **Step 3:** Implement `lib/admin/core.ts` with the signatures above.
- [ ] **Step 4:** `npm test`. Expected: all pass. `npx tsc --noEmit` is clean.
- [ ] **Step 5:** Commit `feat(admin): add core admin logic with tests`.

### Task 2: Store (file I/O + git) and API routes

**Files:**
- Create: `lib/admin/store.ts`, `lib/admin/guard.ts`
- Create: `app/api/admin/stories/route.ts` (GET list, POST create)
- Create: `app/api/admin/stories/[folder]/route.ts` (PUT save)
- Create: `app/api/admin/upload/route.ts` (POST multipart: `folder`, `kind`, `file`)
- Create: `app/api/admin/sync/route.ts` (POST `{source}`)
- Create: `app/api/admin/publish/route.ts` (POST `{folder}`)
- Modify: `lib/facts.ts` (skip `cache` and `byLang` memo when `NODE_ENV === "development"`), `app/robots.ts` (add `disallow: "/admin"`), `.env.example` (add commented `ADMIN_STORIES_SRC=`)

**Interfaces:**
- Consumes: everything from Task 1.
- Produces (store.ts):
  - `type StoryRecord = { folder: string; site: any; siteEn: any; caption: string; hasStoryJson: boolean; media: { video: boolean; vtt: boolean; poster: boolean; thumbnail: boolean; cards: string[] } }`
  - `listStories(): StoryRecord[]` (sorted by folder)
  - `createStory(title: string): StoryRecord` – uses `slugify` + `nextFolderName`; writes site.json `{number, slug, title, category:"kultura", tags:[], published: today, verified: today, draft: true, takeaways:[], quiz:[], links:{facebook: SITE.facebook}}`
  - `saveStory(folder: string, data: { site: any; siteEn: any; caption: string }): void` – writes site.json and caption.txt, and site.en.json only when it has any non-empty field
  - `saveUpload(folder: string, kind: UploadKind, fileName: string, bytes: Buffer): string` – resolves slug from site.json, writes to `uploadTarget(...)`, mkdir -p, returns the path
  - `runSync(source: string): Promise<{ ok: boolean; log: string }>` – `execFile("node", ["scripts/sync-stories.mjs", source])`
  - `publish(folder: string): Promise<{ ok: boolean; errors: string[]; log: string }>` – runs `validateStory` (with `CATEGORIES` slugs); on errors returns them without git. Otherwise `git add -A -- <existing publishPaths>`, `git commit -m <msg> -- <paths>` (if nothing to commit, skip to push), `git push`, collecting stdout/stderr into `log`.
- guard.ts: `devOnly(): Response | null` returns `new Response("Not found", {status:404})` outside development. Every handler calls it first. Every handler rejects a `folder` that fails `safeName` with 400.

- [ ] **Step 1:** Implement guard, store and routes per the interfaces (route handlers are thin: parse, call store, `Response.json`).
- [ ] **Step 2:** `npx tsc --noEmit` clean, `npm test` still passes.
- [ ] **Step 3:** Smoke test with `npm run dev` and curl: `GET /api/admin/stories` lists 5 stories with `media.video:true`. `PUT` 005 with its own data unchanged gives `git status` with no diff. `GET /api/admin/stories/../x` gives 400 or 404.
- [ ] **Step 4:** `npm run build && npm start`, then `curl -i localhost:3000/api/admin/stories` returns 404.
- [ ] **Step 5:** Commit `feat(admin): add dev-only admin API`.

### Task 3: Admin UI

**Files:**
- Create: `app/admin/page.tsx` (server: `if (process.env.NODE_ENV !== "development") notFound();` plus `metadata.robots = {index:false}`, renders `<AdminApp/>`)
- Create: `components/admin/AdminApp.tsx` (client: story list sidebar, "New story" input, "Import from video project" with source path saved in `localStorage` key `admin.syncSource`, default `ADMIN_STORIES_SRC` passed from the page)
- Create: `components/admin/StoryForm.tsx` (client: tabs **Filipino** / **English** / **Caption & sources** / **Media**)
- Create: `components/admin/admin.module.css` (uses `styles/tokens.css` variables)

**Interfaces:**
- Consumes: the API routes from Task 2, `CATEGORIES`.
- Form fields: Filipino tab: number, slug, title, category (select), tags (comma-separated), published, verified, big_number, big_number_label, takeaways (add/remove list), extra (list), quiz (q, 3 options, correct-answer radio; add/remove), links (facebook, tiktok, instagram), duration, draft checkbox. English tab: title, big_number_label, takeaways, extra, paragraphs, quiz text (shown aligned to the Filipino quiz items). Caption tab: one textarea for the full caption.txt. Media tab: one file input per kind with a ✓/✗ for what exists and a list of cards.
- Buttons: **Save** (PUT), **Publish** (save then POST publish; shows errors list or git log in a `<pre>`), **View on site** (`/facts/<slug>` in a new tab).

- [ ] **Step 1:** Implement the page and components.
- [ ] **Step 2:** `npx tsc --noEmit` and `npm run lint` are clean.
- [ ] **Step 3:** Manual check in the browser on `npm run dev`: open `/admin`, open story 005, change a takeaway, Save, then `/facts/rizal-probinsya-ng-espanya` shows it without a restart. Revert it. Create a "Test story", upload a card, check the Media tab shows it, Publish shows the "story.json" validation error. Delete the test folder afterwards.
- [ ] **Step 4:** Update `README.md` "Add a new fact" with a short "Using the admin page" section.
- [ ] **Step 5:** Commit `feat(admin): add admin page UI`.
