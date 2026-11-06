import type { Metadata } from "next";
import Quiz, { type QuizItem } from "@/components/Quiz";
import { getFacts } from "@/lib/facts";
import { getLang } from "@/lib/i18n-server";
import { t as tr } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = tr(await getLang());
  return { title: t.meta.quizTitle, description: t.meta.quizDesc, alternates: { canonical: "/quiz" } };
}

export default async function QuizPage() {
  const lang = await getLang();
  const t = tr(lang);
  const pool: QuizItem[] = getFacts(lang).flatMap((f) => f.quiz.map((q) => ({ ...q, slug: f.slug, title: f.title })));
  return (
    <div className="wrap" style={{ paddingTop: 32 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span className="route">{t.quiz.badge}</span>
        <h1 style={{ marginTop: ".4em" }}>
          {t.quiz.h1a}
          <span className="hl">{t.quiz.h1b}</span>
        </h1>
        <p className="muted">{t.quiz.intro}</p>
      </div>
      <Quiz key={lang} pool={pool} />
    </div>
  );
}
