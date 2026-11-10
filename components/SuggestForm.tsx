"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Juan from "./Juan";
import { useLang } from "./LangProvider";

export default function SuggestForm({ formspreeId, messenger }: { formspreeId: string; messenger: string }) {
  const { t } = useLang();
  const s = t.suggest;
  const sp = useSearchParams();
  const mali = sp.get("mali");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (!formspreeId) {
      const lines = [
        `${s.msgLines.topic}: ${data.get("topic")}`,
        data.get("bakit") ? `${s.msgLines.why}: ${data.get("bakit")}` : "",
        data.get("pangalan") ? `${s.msgLines.name}: ${data.get("pangalan")}` : "",
      ].filter(Boolean);
      window.open(`${messenger}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
      setState("ok");
      return;
    }
    setState("sending");
    const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    }).catch(() => null);
    setState(res?.ok ? "ok" : "err");
  }

  if (state === "ok") {
    return (
      <div className="panel" style={{ textAlign: "center", maxWidth: 620 }}>
        <Juan pose="excited" size={150} title={s.juanHappy} />
        <h2>{s.thanks}</h2>
        {!formspreeId && <p style={{ fontWeight: 600 }}>{s.msgOpened}</p>}
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>
        {s.topic}
        <input name="topic" required defaultValue={mali ? s.wrongIn(mali) : sp.get("topic") ?? ""} placeholder={s.topicPh} />
      </label>
      <label>
        {s.why} <small>{s.optional}</small>
        <textarea name="bakit" rows={4} />
      </label>
      <label>
        {s.name} <small>{s.optional}</small>
        <input name="pangalan" autoComplete="nickname" />
      </label>
      <label>
        {s.email} <small>{s.emailNote}</small>
        <input name="email" type="email" autoComplete="email" />
      </label>
      <input type="text" name="_gotcha" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
      <div>
        <button className="btn btn-yellow" disabled={state === "sending"}>
          {state === "sending" ? s.sending : formspreeId ? s.send : s.sendMsg}
        </button>
      </div>
      {state === "err" && (
        <p role="alert" style={{ fontWeight: 600 }}>
          {s.err1}
          <a href={messenger} target="_blank" rel="noopener">
            {s.err2}
          </a>
          .
        </p>
      )}
    </form>
  );
}
