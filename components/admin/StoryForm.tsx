"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import type { UploadKind } from "@/lib/admin/core";
import { api, type PublishResult, type Quiz, type Story } from "./api";
import s from "./admin.module.css";

type Tab = "fil" | "en" | "caption" | "media";
const TABS: { id: Tab; label: string }[] = [
  { id: "fil", label: "Filipino" },
  { id: "en", label: "English" },
  { id: "caption", label: "Caption & sources" },
  { id: "media", label: "Media" },
];

const blank = (v: unknown) => v === undefined || v === null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.every(blank));

/** Drop empty optional fields so the site falls back to its defaults instead of showing blanks. */
function cleanSite(site: any, tagsText: string) {
  const out = { ...site, tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean) };
  for (const k of ["big_number", "big_number_label", "extra", "duration"]) if (blank(out[k]) || Number.isNaN(out[k])) delete out[k];
  out.takeaways = (out.takeaways ?? []).filter((t: string) => t.trim());
  out.links = Object.fromEntries(Object.entries(out.links ?? {}).filter(([, v]) => !blank(v)));
  if (!out.draft) delete out.draft;
  return out;
}

function cleanEn(en: any) {
  const out: any = {};
  for (const [k, v] of Object.entries(en ?? {})) {
    if (k === "quiz") {
      const q = (v as Quiz[]) ?? [];
      if (q.some((x) => !blank(x?.q) || !blank(x?.options))) out.quiz = q.map((x) => ({ q: x?.q ?? "", options: x?.options ?? [] }));
    } else if (Array.isArray(v)) {
      const arr = v.filter((t) => !blank(t));
      if (arr.length) out[k] = arr;
    } else if (!blank(v)) out[k] = v;
  }
  return out;
}

export default function StoryForm({
  story,
  onDirty,
  onStoryChange,
}: {
  story: Story;
  onDirty: (d: boolean) => void;
  onStoryChange: (s: Story) => void;
}) {
  const [tab, setTab] = useState<Tab>("fil");
  const [site, setSite] = useState<any>(story.site);
  const [tagsText, setTagsText] = useState<string>((story.site.tags ?? []).join(", "));
  const [en, setEn] = useState<any>(story.siteEn ?? {});
  const [caption, setCaption] = useState(story.caption);
  const [media, setMedia] = useState(story.media);
  const [hasStoryJson, setHasStoryJson] = useState(story.hasStoryJson);
  const [dirty, setDirtyState] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: boolean; text: string; errors?: string[] } | null>(null);

  const setDirty = (d: boolean) => {
    setDirtyState(d);
    onDirty(d);
  };
  const upd = (patch: any) => {
    setSite((x: any) => ({ ...x, ...patch }));
    setDirty(true);
  };
  const updEn = (patch: any) => {
    setEn((x: any) => ({ ...x, ...patch }));
    setDirty(true);
  };

  // Warn before closing the tab with unsaved edits.
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, []);

  const save = async (): Promise<boolean> => {
    setBusy("save");
    try {
      const { story: saved } = await api.save(story.folder, { site: cleanSite(site, tagsText), siteEn: cleanEn(en), caption });
      setSite(saved.site);
      setEn(saved.siteEn ?? {});
      setTagsText((saved.site.tags ?? []).join(", "));
      onStoryChange(saved);
      setDirty(false);
      setResult({ ok: true, text: "Saved. Your local site already shows the change." });
      return true;
    } catch (e) {
      setResult({ ok: false, text: (e as Error).message });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const publish = async () => {
    if (!(await save())) return;
    setBusy("publish");
    setResult({ ok: true, text: "Publishing… (commit and push to GitHub)" });
    try {
      const r: PublishResult = await api.publish(story.folder);
      if (r.errors.length) setResult({ ok: false, text: "Not published. Fix these first:", errors: r.errors });
      else
        setResult({
          ok: r.ok,
          text: (r.ok ? "Published! Vercel will update the live site in about a minute.\n\n" : "Publish failed.\n\n") + r.log.trim(),
        });
    } catch (e) {
      setResult({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const upload = async (kind: UploadKind, files: FileList | null) => {
    if (!files?.length) return;
    setBusy("upload");
    try {
      const r = await api.upload(story.folder, kind, files);
      setMedia(r.story.media);
      setHasStoryJson(r.story.hasStoryJson);
      onStoryChange({ ...r.story, site: story.site });
      if (kind === "video" && !site.links?.video) upd({ links: { ...(site.links ?? {}), video: `/videos/${site.slug}.mp4` } });
      setResult({ ok: true, text: `Uploaded: ${r.saved.join(", ")}` });
    } catch (e) {
      setResult({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const removeCard = async (card: string) => {
    setBusy("upload");
    try {
      const r = await api.deleteCard(story.folder, card);
      setMedia(r.story.media);
    } catch (e) {
      setResult({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const quiz: Quiz[] = site.quiz ?? [];
  const setQuiz = (q: Quiz[]) => upd({ quiz: q });
  const enQuiz: Quiz[] = en.quiz ?? [];
  const setEnQuiz = (i: number, patch: Partial<Quiz>) => {
    const next = quiz.map((_, k) => ({ q: enQuiz[k]?.q ?? "", options: enQuiz[k]?.options ?? [] }));
    next[i] = { ...next[i], ...patch };
    updEn({ quiz: next });
  };

  return (
    <div>
      <div className={s.formHead}>
        <div>
          <p className="muted small" style={{ margin: 0 }}>
            {story.folder}
            {dirty ? <span className={s.unsaved}> · unsaved changes</span> : null}
          </p>
          <h2 style={{ margin: 0 }}>{site.title || "Untitled"}</h2>
        </div>
        <div className={s.actions}>
          <a className="btn btn-outline btn-sm" href={`/facts/${site.slug}`} target="_blank" rel="noreferrer">
            View on site
          </a>
          <button className="btn btn-white btn-sm" disabled={!!busy || !dirty} onClick={save}>
            {busy === "save" ? "Saving…" : "Save"}
          </button>
          <button className="btn btn-yellow btn-sm" disabled={!!busy} onClick={publish}>
            {busy === "publish" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      {result ? (
        <div className={`${s.msg} ${result.ok ? s.ok : s.err}`}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{result.text}</pre>
          {result.errors?.length ? (
            <ul>
              {result.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className={s.tabs} role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`${s.tab} ${tab === t.id ? s.tabOn : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "fil" && (
        <div className={s.panel}>
          <div className={s.grid}>
            <Field label="Number">
              <input className={s.input} type="number" value={site.number ?? ""} onChange={(e) => upd({ number: Number(e.target.value) })} />
            </Field>
            <Field label="Slug (web address)" hint="Change it before uploading media, or re-upload after.">
              <input className={s.input} value={site.slug ?? ""} onChange={(e) => upd({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
            </Field>
            <Field label="Category">
              <select className={s.input} value={site.category ?? ""} onChange={(e) => upd({ category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Published">
              <input className={s.input} type="date" value={site.published ?? ""} onChange={(e) => upd({ published: e.target.value })} />
            </Field>
            <Field label="Verified">
              <input className={s.input} type="date" value={site.verified ?? ""} onChange={(e) => upd({ verified: e.target.value })} />
            </Field>
            <Field label="Video length (seconds)">
              <input
                className={s.input}
                type="number"
                value={site.duration ?? ""}
                onChange={(e) => upd({ duration: e.target.value === "" ? undefined : Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="Title">
            <input className={s.input} value={site.title ?? ""} onChange={(e) => upd({ title: e.target.value })} />
          </Field>
          <Field label="Tags" hint="Separate with commas.">
            <input
              className={s.input}
              value={tagsText}
              onChange={(e) => {
                setTagsText(e.target.value);
                setDirty(true);
              }}
            />
          </Field>
          <div className={s.grid}>
            <Field label="Big number">
              <input className={s.input} value={site.big_number ?? ""} onChange={(e) => upd({ big_number: e.target.value })} />
            </Field>
            <Field label="Big number label" wide>
              <input className={s.input} value={site.big_number_label ?? ""} onChange={(e) => upd({ big_number_label: e.target.value })} />
            </Field>
          </div>
          <ListEditor label="Takeaways" items={site.takeaways ?? []} onChange={(v) => upd({ takeaways: v })} />
          <ListEditor label="Extra facts (optional)" items={site.extra ?? []} onChange={(v) => upd({ extra: v })} />
          <QuizEditor quiz={quiz} onChange={setQuiz} />
          <div className={s.grid}>
            {(["facebook", "tiktok", "instagram", "video"] as const).map((k) => (
              <Field key={k} label={k === "video" ? "Video link" : `${k[0].toUpperCase()}${k.slice(1)} link`}>
                <input className={s.input} value={site.links?.[k] ?? ""} onChange={(e) => upd({ links: { ...(site.links ?? {}), [k]: e.target.value } })} />
              </Field>
            ))}
          </div>
          <label className={s.check}>
            <input type="checkbox" checked={!!site.draft} onChange={(e) => upd({ draft: e.target.checked })} />
            Draft (hidden from the site)
          </label>
          <p className="muted small">The article text comes from the narration in story.json (Media tab).</p>
        </div>
      )}

      {tab === "en" && (
        <div className={s.panel}>
          <p className="muted small">Anything left empty stays in Filipino on the English view.</p>
          <Field label="Title">
            <input className={s.input} value={en.title ?? ""} onChange={(e) => updEn({ title: e.target.value })} />
          </Field>
          <Field label="Big number label">
            <input className={s.input} value={en.big_number_label ?? ""} onChange={(e) => updEn({ big_number_label: e.target.value })} />
          </Field>
          <ListEditor label="Takeaways" items={en.takeaways ?? []} onChange={(v) => updEn({ takeaways: v })} />
          <ListEditor label="Extra facts" items={en.extra ?? []} onChange={(v) => updEn({ extra: v })} />
          <ListEditor label="Article paragraphs" items={en.paragraphs ?? []} onChange={(v) => updEn({ paragraphs: v })} rows={6} />
          <h3 className={s.h}>Quiz</h3>
          {quiz.length === 0 ? <p className="muted small">Add quiz questions on the Filipino tab first.</p> : null}
          {quiz.map((q, i) => (
            <div key={i} className={s.quizBox}>
              <p className="muted small" style={{ margin: "0 0 6px" }}>
                {i + 1}. {q.q}
              </p>
              <input className={s.input} placeholder="Question in English" value={enQuiz[i]?.q ?? ""} onChange={(e) => setEnQuiz(i, { q: e.target.value })} />
              {q.options.map((opt, j) => (
                <input
                  key={j}
                  className={s.input}
                  placeholder={`Option: ${opt}`}
                  value={enQuiz[i]?.options?.[j] ?? ""}
                  onChange={(e) => {
                    const opts = q.options.map((_, k) => enQuiz[i]?.options?.[k] ?? "");
                    opts[j] = e.target.value;
                    setEnQuiz(i, { options: opts });
                  }}
                  style={{ marginTop: 6 }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === "caption" && (
        <div className={s.panel}>
          <p className="muted small">
            Everything above the line starting with <b>Sources</b> is the caption. Each line after it that starts with <b>- </b> becomes a source on the
            site. No sources, no publish.
          </p>
          <textarea
            className={s.input}
            rows={22}
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              setDirty(true);
            }}
          />
          {!/^\s*sources\b/im.test(caption) ? (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setCaption((c) => `${c.trimEnd()}\n\nSources (for you, not for posting):\n- Description: https://`);
                setDirty(true);
              }}
            >
              Add a Sources section
            </button>
          ) : null}
        </div>
      )}

      {tab === "media" && (
        <div className={s.panel}>
          {dirty ? <p className={s.unsaved}>Save your changes before uploading, so files go to the right slug.</p> : null}
          <MediaRow label="Video (.mp4)" ok={media.video} path={`public/videos/${site.slug}.mp4`} accept="video/mp4" kind="video" onPick={upload} disabled={!!busy || dirty} />
          <MediaRow label="Captions (.vtt)" ok={media.vtt} path={`public/videos/${site.slug}.vtt`} accept=".vtt,text/vtt" kind="vtt" onPick={upload} disabled={!!busy || dirty} />
          <MediaRow label="Poster (.jpg)" ok={media.poster} path={`public/videos/${site.slug}-poster.jpg`} accept="image/jpeg" kind="poster" onPick={upload} disabled={!!busy || dirty} />
          <MediaRow label="Thumbnail (.jpg)" ok={media.thumbnail} path={`content/stories/${story.folder}/thumbnail.jpg`} accept="image/jpeg" kind="thumbnail" onPick={upload} disabled={!!busy || dirty} />
          <MediaRow label="story.json (script)" ok={hasStoryJson} path={`content/stories/${story.folder}/story.json`} accept=".json,application/json" kind="story" onPick={upload} disabled={!!busy || dirty} />
          <MediaRow label="Scene cards" ok={media.cards.length > 0} path={`public/cards/${site.slug}/`} accept="image/*" kind="card" multiple onPick={upload} disabled={!!busy || dirty} />
          {media.cards.length ? (
            <div className={s.cards}>
              {media.cards.map((c) => (
                <figure key={c} className={s.card}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/cards/${site.slug}/${c}`} alt={c} loading="lazy" />
                  <figcaption>
                    {c}
                    <button className={s.x} title="Remove card" disabled={!!busy} onClick={() => removeCard(c)}>
                      ×
                    </button>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : null}
          <p className="muted small">Cards only show on the site when their file name matches a scene image in story.json.</p>
          {busy === "upload" ? <p className="muted">Uploading…</p> : null}
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`${s.field} ${wide ? s.wide : ""}`}>
      <span className={s.label}>{label}</span>
      {children}
      {hint ? <span className="muted small">{hint}</span> : null}
    </label>
  );
}

function ListEditor({ label, items, onChange, rows = 2 }: { label: string; items: string[]; onChange: (v: string[]) => void; rows?: number }) {
  return (
    <div className={s.field}>
      <span className={s.label}>{label}</span>
      {items.map((t, i) => (
        <div key={i} className={s.row}>
          <textarea className={s.input} rows={rows} value={t} onChange={(e) => onChange(items.map((x, k) => (k === i ? e.target.value : x)))} />
          <button className={s.x} title="Remove" onClick={() => onChange(items.filter((_, k) => k !== i))}>
            ×
          </button>
        </div>
      ))}
      <button className={s.add} onClick={() => onChange([...items, ""])}>
        + Add
      </button>
    </div>
  );
}

function QuizEditor({ quiz, onChange }: { quiz: Quiz[]; onChange: (q: Quiz[]) => void }) {
  const set = (i: number, patch: Partial<Quiz>) => onChange(quiz.map((q, k) => (k === i ? { ...q, ...patch } : q)));
  return (
    <div className={s.field}>
      <span className={s.label}>Quiz (pick the correct answer with the circle)</span>
      {quiz.map((q, i) => (
        <div key={i} className={s.quizBox}>
          <div className={s.row}>
            <input className={s.input} placeholder={`Question ${i + 1}`} value={q.q} onChange={(e) => set(i, { q: e.target.value })} />
            <button className={s.x} title="Remove question" onClick={() => onChange(quiz.filter((_, k) => k !== i))}>
              ×
            </button>
          </div>
          {q.options.map((opt, j) => (
            <div key={j} className={s.row} style={{ marginTop: 6 }}>
              <input type="radio" name={`ans-${i}`} checked={q.answer === j} onChange={() => set(i, { answer: j })} aria-label={`Option ${j + 1} is correct`} />
              <input className={s.input} placeholder={`Option ${j + 1}`} value={opt} onChange={(e) => set(i, { options: q.options.map((o, k) => (k === j ? e.target.value : o)) })} />
              {q.options.length > 2 ? (
                <button
                  className={s.x}
                  title="Remove option"
                  onClick={() => {
                    const options = q.options.filter((_, k) => k !== j);
                    const a = q.answer ?? 0;
                    set(i, { options, answer: a === j ? 0 : a > j ? a - 1 : a });
                  }}
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
          {q.options.length < 5 ? (
            <button className={s.add} onClick={() => set(i, { options: [...q.options, ""] })}>
              + Option
            </button>
          ) : null}
        </div>
      ))}
      <button className={s.add} onClick={() => onChange([...quiz, { q: "", options: ["", "", ""], answer: 0 }])}>
        + Add question
      </button>
    </div>
  );
}

function MediaRow(props: {
  label: string;
  ok: boolean;
  path: string;
  accept: string;
  kind: UploadKind;
  multiple?: boolean;
  disabled: boolean;
  onPick: (kind: UploadKind, files: FileList | null) => void;
}) {
  return (
    <div className={s.media}>
      <span className={props.ok ? s.yes : s.no}>{props.ok ? "✓" : "✗"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b>{props.label}</b>
        <div className="muted small" style={{ overflowWrap: "anywhere" }}>
          {props.path}
        </div>
      </div>
      <label className={`btn btn-outline btn-sm ${props.disabled ? s.disabled : ""}`}>
        {props.ok ? "Replace" : "Upload"}
        <input
          type="file"
          hidden
          accept={props.accept}
          multiple={props.multiple}
          disabled={props.disabled}
          onChange={(e) => {
            props.onPick(props.kind, e.target.files);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}
