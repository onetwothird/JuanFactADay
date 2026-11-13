import { badFolder, devOnly } from "@/lib/admin/guard";
import { publish } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const blocked = devOnly();
  if (blocked) return blocked;
  const { folder } = await req.json().catch(() => ({}));
  const bad = badFolder(folder);
  if (bad) return bad;
  try {
    return Response.json(await publish(folder));
  } catch (e) {
    return Response.json({ ok: false, errors: [(e as Error).message], log: "" }, { status: 400 });
  }
}
