import type { Metadata } from "next";
import Archive from "@/components/Archive";
import { getAllFacts } from "@/lib/facts";

export const metadata: Metadata = {
  title: "Lahat ng Facts",
  description: "Hanapin ang lahat ng fact ni Juan tungkol sa Pilipinas: kasaysayan, kultura, lugar at iba pa. May sources lahat.",
  alternates: { canonical: "/facts" },
};

export default function FactsPage() {
  const facts = getAllFacts();
  return (
    <div className="wrap" style={{ paddingTop: 32 }}>
      <span className="route">Archive</span>
      <h1 style={{ marginTop: ".4em" }}>
        Lahat ng <span className="hl">fact</span> ni Juan
      </h1>
      <p className="muted" style={{ maxWidth: "52ch" }}>
        Bawat isa, may video, buong kwento at listahan ng sources. Hanapin ang gusto mo, o pumili ng kategorya.
      </p>
      <Archive facts={facts} />
    </div>
  );
}
