"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type Story } from "./api";
import StoryForm from "./StoryForm";
import s from "./admin.module.css";

const SRC_KEY = "admin.syncSource";

export default function AdminApp({ defaultSource }: { defaultSource: string }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [source, setSource] = useState(defaultSource);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const refresh = useCallback(async () => {
    const r = await api.list();
    setStories(r.stories);
    return r.stories;
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SRC_KEY);
      if (saved) setSource(saved);
    } catch {}
    refresh()
      .then((list) => setCurrent((c) => c ?? list[list.length - 1]?.folder ?? null))
      .catch((e) => setMsg({ ok: false, text: e.message }));
  }, [refresh]);

  const pick = (folder: string) => {
    if (folder === current) return;
    if (dirty && !window.confirm("You have unsaved changes. Leave this story without saving?")) return;
    setDirty(false);
    setCurrent(folder);
  };

  const create = async () => {
    if (!newTitle.trim()) return;
    setBusy(true);
    try {
      const { story } = await api.create(newTitle);
      await refresh();
      setNewTitle("");
      setDirty(false);
      setCurrent(story.folder);
      setMsg({ ok: true, text: `Created ${story.folder} as a draft.` });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const sync = async () => {
    try {
      localStorage.setItem(SRC_KEY, source);
    } catch {}
    setBusy(true);
    try {
      const r = await api.sync(source);
      setStories(r.stories);
      setMsg({ ok: r.ok, text: r.log.trim() });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const story = stories.find((x) => x.folder === current) ?? null;

  return (
    <div className={`wrap ${s.admin}`}>
      <header className={s.top}>
        <h1>Admin</h1>
        <p className="muted small">Only on your computer (npm run dev). Publish sends a story to GitHub and Vercel updates the live site in about a minute.</p>
      </header>

      <div className={s.layout}>
        <aside className={s.side}>
          <h2 className={s.h}>Stories</h2>
          <ul className={s.list}>
            {[...stories].reverse().map((x) => (
              <li key={x.folder}>
                <button className={`${s.item} ${x.folder === current ? s.active : ""}`} onClick={() => pick(x.folder)}>
                  <span className={s.num}>#{String(x.site.number ?? "?").padStart(3, "0")}</span>
                  <span className={s.title}>{x.site.title || x.folder}</span>
                  {x.site.draft ? <span className={s.badge}>draft</span> : null}
                </button>
              </li>
            ))}
          </ul>

          <h2 className={s.h}>New story</h2>
          <div className={s.row}>
            <input
              className={s.input}
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
            />
            <button className="btn btn-yellow btn-sm" disabled={busy || !newTitle.trim()} onClick={create}>
              Add
            </button>
          </div>

          <h2 className={s.h}>Import from video project</h2>
          <input
            className={s.input}
            placeholder="C:/path/to/juan_fact_a_day/stories"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <button className="btn btn-outline btn-sm" disabled={busy || !source.trim()} onClick={sync} style={{ marginTop: 8 }}>
            Import
          </button>
          <p className="muted small">Copies story.json, caption.txt, site.json, thumbnail and cards for every story in that folder.</p>
        </aside>

        <section className={s.main}>
          {msg ? (
            <pre className={`${s.msg} ${msg.ok ? s.ok : s.err}`} onClick={() => setMsg(null)} title="Click to dismiss">
              {msg.text}
            </pre>
          ) : null}
          {story ? (
            <StoryForm
              key={story.folder}
              story={story}
              onDirty={setDirty}
              onStoryChange={(updated) => setStories((list) => list.map((x) => (x.folder === updated.folder ? updated : x)))}
            />
          ) : (
            <p className="muted">Pick a story on the left, or add a new one.</p>
          )}
        </section>
      </div>
    </div>
  );
}
