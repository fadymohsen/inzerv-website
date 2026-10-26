import { backend, clearToken, getToken, isSameOrigin, json, pick, readJson } from "@/lib/server/backend";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ message: "Forbidden" }, 403);
  const token = await getToken();
  if (!token) return json({ message: "Unauthorized" }, 401);

  const body = pick(await readJson(req), ["oldPassword", "newPassword"] as const);
  const res = await backend("/users/change-password", { method: "POST", token, body });

  if (res.status === 401) {
    // The backend also answers 401 for a wrong current password; that must not end the session.
    const message = String((res.data as { message?: unknown } | null)?.message ?? "");
    if (/current password/i.test(message)) return json({ message }, 400);
    await clearToken();
    return json({ message: "Unauthorized" }, 401);
  }
  return json(res.ok ? { ok: true } : (res.data ?? { message: "Error" }), res.status);
}
