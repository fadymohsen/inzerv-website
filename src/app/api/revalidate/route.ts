import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

/**
 * Called by the backend right after an admin edits the service catalogue, so the
 * website shows the change immediately instead of after the cache window.
 * Needs REVALIDATE_SECRET to be set here and on the backend; closed otherwise.
 */
export async function POST(req: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  const provided = req.headers.get("x-revalidate-secret") ?? "";
  if (!expected) return Response.json({ ok: false }, { status: 503 });

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  revalidateTag("catalog", { expire: 0 });
  return Response.json({ ok: true });
}
