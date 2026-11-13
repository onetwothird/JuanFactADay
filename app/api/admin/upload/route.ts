import { badFolder, devOnly } from "@/lib/admin/guard";
import { UPLOAD_KINDS, storyJsonError, type UploadKind } from "@/lib/admin/core";
import { deleteCard, readStory, saveUpload } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const blocked = devOnly(req);
  if (blocked) return blocked;
  try {
    const form = await req.formData();
    const folder = String(form.get("folder") ?? "");
    const bad = badFolder(folder);
    if (bad) return bad;
    const kind = String(form.get("kind") ?? "") as UploadKind;
    if (!UPLOAD_KINDS.includes(kind)) return Response.json({ error: "Unknown file type." }, { status: 400 });
    const files = form.getAll("file").filter((f): f is File => f instanceof File);
    if (!files.length) return Response.json({ error: "No file chosen." }, { status: 400 });
    if (kind === "story") {
      // reject broken JSON before it can break the site
      let parsed: unknown;
      try {
        parsed = JSON.parse(await files[0].text());
      } catch {
        return Response.json({ error: "That story.json is not valid JSON." }, { status: 400 });
      }
      const problem = storyJsonError(parsed);
      if (problem) return Response.json({ error: problem }, { status: 400 });
    }
    const saved: string[] = [];
    for (const f of kind === "card" ? files : files.slice(0, 1)) {
      saved.push(saveUpload(folder, kind, f.name.replace(/\s+/g, "_"), Buffer.from(await f.arrayBuffer())));
    }
    return Response.json({ saved, story: readStory(folder) });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const blocked = devOnly(req);
  if (blocked) return blocked;
  try {
    const { folder, card } = await req.json();
    const bad = badFolder(folder);
    if (bad) return bad;
    deleteCard(folder, String(card));
    return Response.json({ story: readStory(folder) });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
