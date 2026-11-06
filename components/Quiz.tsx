"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Juan from "./Juan";
import { confetti } from "@/lib/confetti";
import type { Dict } from "@/lib/i18n";
import { useLang } from "./LangProvider";

export type QuizItem = { q: string; options: string[]; answer: number; slug: string; title: string };

const N = 5;
const SWAP_MS = 780; // full out → in sequence; keep ≥ the longest .quiz-card.is-entering animation in globals.css

function shuffle<T>(a: T[]) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function verdict(score: number, total: number, v: Dict["quiz"]["v"]) {
  if (score === total) return v.perfect;
  if (score >= total - 1) return v.almost;
  if (score >= Math.ceil(total / 2)) return v.good;
  return v.low;
}

/* Counts 0 → value once mounted (ease-out), for the big score number. */
function useCountUp(value: number, ms = 900, delay = 350) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now() + delay;
    const step = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / ms));
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms, delay]);
  return n;
}

function Results({
  score,
  total,
  best,
  newBest,
  minHeight,
  onShare,
  onRetry,
}: {
  score: number;
  total: number;
  best: number | null;
  newBest: boolean;
  minHeight?: number;
  onShare: () => void;
  onRetry: () => void;
}) {
  const q = useLang().t.quiz;
  const shown = useCountUp(score);
  const pass = score >= Math.ceil(total / 2);
  const perfect = score === total;
  const v = verdict(score, total, q.v);
  const R = 54;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    if (!pass) return;
    const t = setTimeout(() => confetti({ count: perfect ? 160 : 110, waves: perfect ? 3 : 1, origin: { x: 0.5, y: 0.4 } }), 650);
    return () => clearTimeout(t);
  }, [pass, perfect]);

  return (
    <div data-no-reveal className={`panel quiz quiz-done ${pass ? "is-pass" : "is-low"}`} style={{ minHeight }} aria-live="polite">
      <div className="done-rays" aria-hidden />
      <div className="done-hero">
        <div className="done-juan">
          <Juan pose={pass ? "excited" : "oops"} size={130} title={pass ? q.juanHappy : q.juanSad} />
        </div>
        <div className="done-ring" role="img" aria-label={q.scoreLabel(score, total)}>
          <svg viewBox="0 0 128 128" width="128" height="128" aria-hidden>
            <circle cx="64" cy="64" r={R} className="ring-track" />
            <circle
              cx="64"
              cy="64"
              r={R}
              className="ring-fill"
              style={{ strokeDasharray: C, ["--ring-off" as string]: `${C * (1 - score / total)}`, ["--ring-c" as string]: `${C}` }}
            />
          </svg>
          <div className="ring-num" aria-hidden>
            <b>{shown}</b>
            <span>/{total}</span>
          </div>
        </div>
      </div>
      <h2 className="done-title">{v.title}</h2>
      <p className="done-sub">{v.sub}</p>
      <div className="done-meta">
        {newBest && score > 0 ? (
          <span className="best-badge">{q.newBest}</span>
        ) : (
          best !== null && <span className="best-chip">{q.best(best, total)}</span>
        )}
      </div>
      <div className="done-actions">
        <button className="btn btn-navy" onClick={onShare}>
          {q.share}
        </button>
        <button className="btn btn-white" onClick={onRetry}>
          {q.retry}
        </button>
      </div>
    </div>
  );
}

export default function Quiz({ pool }: { pool: QuizItem[] }) {
  const T = useLang().t.quiz;
  const total = Math.min(N, pool.length);
  const [qs, setQs] = useState<QuizItem[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [leavingPick, setLeavingPick] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [lockH, setLockH] = useState<number>();
  const panelRef = useRef<HTMLDivElement>(null);
  const swapT = useRef<number | undefined>(undefined);

  const start = useCallback(() => {
    setQs(shuffle(pool).slice(0, total));
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    setNewBest(false);
    setLeaving(null);
    setRound((r) => r + 1);
  }, [pool, total]);

  useEffect(() => {
    start();
    try {
      const b = localStorage.getItem("jfad-best");
      if (b) setBest(Number(b));
    } catch {}
    return () => window.clearTimeout(swapT.current);
  }, [start]);

  const choose = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === qs[i].answer) setScore((s) => s + 1);
  };

  const nextQ = () => {
    if (i + 1 >= total) {
      // keep the results panel at least as tall as the quiz was, so the page doesn't jump
      setLockH(panelRef.current?.offsetHeight);
      setDone(true);
      try {
        const prev = Number(localStorage.getItem("jfad-best") ?? "0");
        if (score > prev) localStorage.setItem("jfad-best", String(score));
        setNewBest(score > prev);
        setBest(Math.max(prev, score));
      } catch {}
    } else {
      setLeaving(i);
      setLeavingPick(picked);
      setI(i + 1);
      setPicked(null);
      window.clearTimeout(swapT.current);
      swapT.current = window.setTimeout(() => setLeaving(null), SWAP_MS);
    }
  };

  const shareCard = async () => {
    const c = document.createElement("canvas");
    c.width = 1080;
    c.height = 1080;
    const g = c.getContext("2d")!;
    g.fillStyle = "#0F1A3C";
    g.fillRect(0, 0, 1080, 1080);
    for (let a = 0; a < 360; a += 20) {
      g.save();
      g.translate(540, 700);
      g.rotate((a * Math.PI) / 180);
      g.fillStyle = "rgba(255,255,255,0.05)";
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(1400, -120);
      g.lineTo(1400, 120);
      g.fill();
      g.restore();
    }
    const font = getComputedStyle(document.body).fontFamily;
    g.textAlign = "center";
    g.fillStyle = "#FFC72C";
    g.font = `800 52px ${font}`;
    g.fillText(T.cardTitle, 540, 200);
    g.fillStyle = "#0B1A50";
    g.font = `800 300px ${font}`;
    g.fillText(`${score}/${total}`, 548, 588);
    g.fillStyle = "#FFC72C";
    g.fillText(`${score}/${total}`, 540, 580);
    g.fillStyle = "#fff";
    g.font = `700 58px ${font}`;
    g.fillText(T.cardGot(score, total), 540, 740);
    g.fillStyle = "#DCE6FF";
    g.font = `600 46px ${font}`;
    g.fillText(T.cardDare, 540, 830);
    ["#0038A8", "#D7263D", "#FFC72C"].forEach((col, k) => {
      g.fillStyle = col;
      g.fillRect(k * 360, 1060, 360, 20);
    });
    const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/png"));
    const file = new File([blob], "juan-quiz-score.png", { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], text: T.shareText(score, total) });
        return;
      } catch {}
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = file.name;
    a.click();
  };

  if (done) {
    return <Results score={score} total={total} best={best} newBest={newBest} minHeight={lockH} onShare={shareCard} onRetry={start} />;
  }

  // Every question of this round (and every result state) is rendered into the same grid
  // cell; only the current one is visible (plus the outgoing one while it animates away).
  // The panel is therefore always as tall as the tallest question + result, so nothing
  // below it moves when you answer or go next.
  // Before the client shuffles, the first pool items stand in invisibly (no pop-in on load).
  const ready = qs.length > 0;
  const list = ready ? qs : pool.slice(0, total);
  if (!list.length) return null;

  return (
    <div
      ref={panelRef}
      data-no-reveal
      key={round}
      className={`panel quiz${round > 1 ? " quiz-restart" : ""}`}
      style={ready ? undefined : { visibility: "hidden" }}
      aria-hidden={ready ? undefined : true}
    >
      <div className="quiz-top">
        <span className="route navy">
          {T.question(i + 1, total)}
        </span>
        <span style={{ fontWeight: 700 }}>
          {T.score}:{" "}
          <b key={score} className={score ? "score-pop" : undefined}>
            {score}
          </b>
        </span>
      </div>
      <div className="progress" style={{ marginTop: 14 }} aria-hidden>
        <i style={{ width: `${((i + (picked !== null ? 1 : 0)) / total) * 100}%` }} />
      </div>
      <div className="quiz-stack">
        {list.map((item, n) => {
          const isCur = n === i;
          const isLeaving = n === leaving;
          // the outgoing card keeps showing its revealed answer while it slides away
          const pk = isCur ? picked : isLeaving ? leavingPick : null;
          const answered = pk !== null;
          const correct = answered && pk === item.answer;
          const state = !answered ? "wait" : correct ? "right" : "wrong";
          const anim = isLeaving ? " is-leaving" : isCur && leaving !== null ? " is-entering" : "";
          return (
            <div key={`${n}-${item.slug}-${item.q}`} className={`quiz-card${anim}`} hidden={!isCur && !isLeaving} aria-hidden={isLeaving || undefined}>
              <p className="q">{item.q}</p>
              <div className="opts">
                {item.options.map((o, k) => {
                  const cls = !answered ? "" : k === item.answer ? "right" : k === pk ? "wrong" : "";
                  return (
                    <button key={k} className={`opt ${cls}`} style={{ ["--k" as string]: k }} disabled={!isCur || answered} onClick={() => choose(k)}>
                      {o}
                    </button>
                  );
                })}
              </div>
              <div className="quiz-foot" aria-live={isCur ? "polite" : undefined}>
                <div className="quiz-state" hidden={state !== "wait"}>
                  <div className="feedback">
                    <Juan pose="thinking" size={70} title="" />
                    <div>
                      <strong style={{ fontSize: "1.2rem" }}>{T.thinkingH}</strong>
                      <div style={{ fontWeight: 600 }}>{T.thinkingP}</div>
                    </div>
                  </div>
                </div>
                {(["right", "wrong"] as const).map((s) => (
                  <div key={s} className={`quiz-state is-${s}`} hidden={state !== s}>
                    <div className="feedback">
                      <Juan pose={s === "right" ? "excited" : "oops"} size={70} title="" />
                      <div>
                        <strong style={{ fontSize: "1.2rem" }}>{s === "right" ? T.right : T.wrong}</strong>
                        <div style={{ fontWeight: 600 }}>{s === "right" ? T.correctIs(item.options[item.answer]) : item.options[item.answer]}</div>
                        <Link href={`/facts/${item.slug}`} style={{ color: "var(--juan-navy)", fontWeight: 700 }}>
                          {T.read(item.title)}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <button className="btn btn-navy quiz-next" disabled={picked === null || leaving !== null} onClick={nextQ}>
        {i + 1 >= total ? T.seeScore : T.next}
      </button>
    </div>
  );
}
