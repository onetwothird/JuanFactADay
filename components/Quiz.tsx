"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Juan from "./Juan";

export type QuizItem = { q: string; options: string[]; answer: number; slug: string; title: string };

const N = 5;

function shuffle<T>(a: T[]) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function verdict(score: number, total: number) {
  if (score === total) return `${score}/${total}, Certified Juan-derful! 🏆`;
  if (score >= total - 1) return `${score}/${total}! Muntik nang perfect!`;
  if (score >= Math.ceil(total / 2)) return `${score}/${total}. Ayos 'yan!`;
  return `${score}/${total}. Okay lang, matututo tayo!`;
}

export default function Quiz({ pool }: { pool: QuizItem[] }) {
  const total = Math.min(N, pool.length);
  const [qs, setQs] = useState<QuizItem[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const start = useCallback(() => {
    setQs(shuffle(pool).slice(0, total));
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }, [pool, total]);

  useEffect(() => {
    start();
    try {
      const b = localStorage.getItem("jfad-best");
      if (b) setBest(Number(b));
    } catch {}
  }, [start]);

  const choose = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === qs[i].answer) setScore((s) => s + 1);
  };

  const nextQ = () => {
    if (i + 1 >= total) {
      setDone(true);
      try {
        const prev = Number(localStorage.getItem("jfad-best") ?? "0");
        if (score > prev) localStorage.setItem("jfad-best", String(score));
        setBest(Math.max(prev, score));
      } catch {}
    } else {
      setI(i + 1);
      setPicked(null);
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
    g.fillText("JUAN FACT A DAY QUIZ", 540, 200);
    g.fillStyle = "#0B1A50";
    g.font = `800 300px ${font}`;
    g.fillText(`${score}/${total}`, 548, 588);
    g.fillStyle = "#FFC72C";
    g.fillText(`${score}/${total}`, 540, 580);
    g.fillStyle = "#fff";
    g.font = `700 58px ${font}`;
    g.fillText(`Nakuha ko ${score}/${total}!`, 540, 740);
    g.fillStyle = "#DCE6FF";
    g.font = `600 46px ${font}`;
    g.fillText("Kaya mo ba? Subukan sa juanfactaday", 540, 830);
    ["#0038A8", "#D7263D", "#FFC72C"].forEach((col, k) => {
      g.fillStyle = col;
      g.fillRect(k * 360, 1060, 360, 20);
    });
    const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/png"));
    const file = new File([blob], "juan-quiz-score.png", { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], text: `Nakuha ko ${score}/${total} sa Juan Fact a Day Quiz! Kaya mo ba?` });
        return;
      } catch {}
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = file.name;
    a.click();
  };

  if (!qs.length) return null;

  if (done) {
    return (
      <div className="panel quiz" style={{ textAlign: "center" }}>
        <Juan pose={score >= Math.ceil(total / 2) ? "excited" : "oops"} size={180} title="Si Juan" />
        <h2 style={{ marginTop: 12 }}>{verdict(score, total)}</h2>
        {best !== null && <p style={{ fontWeight: 600 }}>Best score mo: {best}/{total}</p>}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
          <button className="btn" style={{ background: "var(--juan-navy)", color: "#fff" }} onClick={shareCard}>
            I-share ang score
          </button>
          <button className="btn btn-yellow" style={{ background: "#fff" }} onClick={start}>
            Ulitin
          </button>
        </div>
      </div>
    );
  }

  const cur = qs[i];
  const correct = picked !== null && picked === cur.answer;

  return (
    <div className="panel quiz">
      <div className="quiz-top">
        <span className="route navy">Tanong {i + 1} / {total}</span>
        <span style={{ fontWeight: 700 }}>Score: {score}</span>
      </div>
      <div className="progress" style={{ marginTop: 14 }} aria-hidden>
        <i style={{ width: `${(i / total) * 100}%` }} />
      </div>
      <p className="q">{cur.q}</p>
      <div className="opts">
        {cur.options.map((o, k) => {
          const cls = picked === null ? "" : k === cur.answer ? "right" : k === picked ? "wrong" : "";
          return (
            <button key={k} className={`opt ${cls}`} disabled={picked !== null} onClick={() => choose(k)}>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div aria-live="polite">
          <div className="feedback">
            <Juan pose={correct ? "excited" : "oops"} size={90} title="" />
            <div>
              <strong style={{ fontSize: "1.2rem" }}>{correct ? "Galing mo! 🎉" : "Ay, sayang! Ang tamang sagot ay…"}</strong>
              {!correct && <div style={{ fontWeight: 600 }}>{cur.options[cur.answer]}</div>}
              <Link href={`/facts/${cur.slug}`} style={{ color: "var(--juan-navy)", fontWeight: 700 }}>
                Basahin: {cur.title} →
              </Link>
            </div>
          </div>
          <button className="btn" style={{ marginTop: 16, background: "var(--juan-navy)", color: "#fff" }} onClick={nextQ}>
            {i + 1 >= total ? "Tingnan ang score" : "Susunod na tanong"}
          </button>
        </div>
      )}
    </div>
  );
}
