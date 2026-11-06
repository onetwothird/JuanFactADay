"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Juan from "./Juan";

export default function SuggestForm({ formspreeId, messenger }: { formspreeId: string; messenger: string }) {
  const sp = useSearchParams();
  const mali = sp.get("mali");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formspreeId) {
      setState("err");
      return;
    }
    setState("sending");
    const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: "POST",
      body: new FormData(e.currentTarget),
      headers: { Accept: "application/json" },
    }).catch(() => null);
    setState(res?.ok ? "ok" : "err");
  }

  if (state === "ok") {
    return (
      <div className="panel" style={{ textAlign: "center", maxWidth: 620 }}>
        <Juan pose="excited" size={150} title="Si Juan, masaya" />
        <h2>Salamat! Baka ikaw ang next na Juan Fact! 💡</h2>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>
        Topic *
        <input name="topic" required defaultValue={mali ? `May mali sa: ${mali}` : sp.get("topic") ?? ""} placeholder="Hal. Saan galing ang salitang 'boondocks'?" />
      </label>
      <label>
        Bakit interesting? <small>(optional)</small>
        <textarea name="bakit" rows={4} />
      </label>
      <label>
        Pangalan para ma-credit <small>(optional)</small>
        <input name="pangalan" autoComplete="nickname" />
      </label>
      <label>
        Email <small>(optional, kung gusto mong ma-update)</small>
        <input name="email" type="email" autoComplete="email" />
      </label>
      <input type="text" name="_gotcha" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
      <div>
        <button className="btn btn-yellow" disabled={state === "sending"}>{state === "sending" ? "Ipinapadala…" : "Ipadala kay Juan"}</button>
      </div>
      {state === "err" && (
        <p role="alert" style={{ fontWeight: 600 }}>
          Ay, hindi naipadala. Pakisubukan ulit, o <a href={messenger} target="_blank" rel="noopener">i-message na lang si Juan sa Messenger</a>.
        </p>
      )}
    </form>
  );
}
