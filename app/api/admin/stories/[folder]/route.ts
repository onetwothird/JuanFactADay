import { badFolder, devOnly } from "@/lib/admin/guard";
import { readStory, saveStory } from "@/lib/admin/store";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ folder: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const blocked = devOnly(req);
  if (blocked) return blocked;
  const { folder } = await params;
  const bad = badFolder(folder);
  if (bad) return bad;
  try {
    return Response.json({ story: readStory(folder) });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 404 });
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  const blocked = devOnly(req);
  if (blocked) return blocked;
  const { folder } = await params;
  const bad = badFolder(folder);
  if (bad) return bad;
  try {
    const body = await req.json();
    return Response.json({ story: saveStory(folder, body) });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
