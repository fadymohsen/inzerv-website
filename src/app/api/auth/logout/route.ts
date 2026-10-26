import { clearToken, isSameOrigin, json } from "@/lib/server/backend";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ message: "Forbidden" }, 403);
  await clearToken();
  return json({ ok: true });
}
