/* Client-side calls to the dev-only admin API. */
import type { UploadKind } from "@/lib/admin/core";

export type Quiz = { q: string; options: string[]; answer?: number };
export type Media = { video: boolean; vtt: boolean; poster: boolean; thumbnail: boolean; cards: string[] };
export type Story = { folder: string; site: any; siteEn: any; caption: string; hasStoryJson: boolean; media: Media };
export type PublishResult = { ok: boolean; errors: string[]; log: string };

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({ error: `Server returned ${res.status}` }));
  if (!res.ok && !("ok" in data)) throw new Error(data.error ?? `Server returned ${res.status}`);
  return data as T;
}
const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export const api = {
  list: () => call<{ stories: Story[]; syncSource: string }>("/api/admin/stories"),
  create: (title: string) => call<{ story: Story }>("/api/admin/stories", json("POST", { title })),
  save: (folder: string, data: { site: any; siteEn: any; caption: string }) =>
    call<{ story: Story }>(`/api/admin/stories/${folder}`, json("PUT", data)),
  upload: (folder: string, kind: UploadKind, files: FileList | File[]) => {
    const fd = new FormData();
    fd.set("folder", folder);
    fd.set("kind", kind);
    for (const f of Array.from(files)) fd.append("file", f);
    return call<{ saved: string[]; story: Story }>("/api/admin/upload", { method: "POST", body: fd });
  },
  deleteCard: (folder: string, card: string) => call<{ story: Story }>("/api/admin/upload", json("DELETE", { folder, card })),
  sync: (source: string) => call<{ ok: boolean; log: string; stories: Story[] }>("/api/admin/sync", json("POST", { source })),
  publish: (folder: string) => call<PublishResult>("/api/admin/publish", json("POST", { folder })),
};
