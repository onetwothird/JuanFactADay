import type { Metadata } from "next";
import { Suspense } from "react";
import SuggestForm from "@/components/SuggestForm";
import { SITE } from "@/lib/util";

export const metadata: Metadata = {
  title: "Mag-suggest ng topic",
  description: "May gustong malaman tungkol sa Pilipinas? I-suggest kay Juan. May mali sa isang fact? Sabihan mo kami.",
  alternates: { canonical: "/suggest" },
};

export default function SuggestPage() {
  return (
    <div className="wrap" style={{ paddingTop: 32 }}>
      <span className="route">Suggest</span>
      <h1 style={{ marginTop: ".4em" }}>
        May topic ka? <span className="hl">I-suggest mo!</span>
      </h1>
      <p className="muted" style={{ maxWidth: "52ch" }}>
        Gusto mong malaman kung saan galing ang isang salita, pagkain o tradisyon? O may nakita kang mali sa isang fact? Isulat mo dito.
      </p>
      <Suspense>
        <SuggestForm formspreeId={SITE.formspree} messenger={SITE.messenger} />
      </Suspense>
    </div>
  );
}
