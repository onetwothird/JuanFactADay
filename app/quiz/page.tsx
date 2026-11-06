import type { Metadata } from "next";
import Quiz, { type QuizItem } from "@/components/Quiz";
import { getAllFacts } from "@/lib/facts";

export const metadata: Metadata = {
  title: "Quiz: Ilan ang alam mo?",
  description: "5 tanong tungkol sa Pilipinas galing sa mga fact ni Juan. Walang login. I-share ang score mo!",
  alternates: { canonical: "/quiz" },
};

export default function QuizPage() {
  const pool: QuizItem[] = getAllFacts().flatMap((f) => f.quiz.map((q) => ({ ...q, slug: f.slug, title: f.title })));
  return (
    <div className="wrap" style={{ paddingTop: 32 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span className="route">Alam mo ba?</span>
        <h1 style={{ marginTop: ".4em" }}>
          Ilan ang <span className="hl">alam mo?</span>
        </h1>
        <p className="muted">Simulan na! Lahat ng sagot ay galing sa mga fact ni Juan.</p>
      </div>
      <Quiz pool={pool} />
    </div>
  );
}
