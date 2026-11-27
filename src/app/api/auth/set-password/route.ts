import { backend, isSameOrigin, json, pick, readJson } from "@/lib/server/backend";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ message: "Forbidden" }, 403);
  const body = pick(await readJson(req), ["token", "newPassword"] as const);
  const res = await backend("/auth/set-password", { method: "POST", body });
  return json(res.ok ? { ok: true } : (res.data ?? { message: "Error" }), res.status);
}
