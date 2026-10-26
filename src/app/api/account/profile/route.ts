import { backend, clearToken, getToken, isSameOrigin, json, pick, publicProfile, readJson } from "@/lib/server/backend";

export async function GET() {
  const token = await getToken();
  if (!token) return json({ message: "Unauthorized" }, 401);
  const res = await backend("/users/profile", { token });
  if (res.status === 401) await clearToken();
  if (!res.ok) return json(res.data ?? { message: "Error" }, res.status);
  return json({ profile: publicProfile(res.data) });
}

export async function PATCH(req: Request) {
  if (!isSameOrigin(req)) return json({ message: "Forbidden" }, 403);
  const token = await getToken();
  if (!token) return json({ message: "Unauthorized" }, 401);

  const body = pick(await readJson(req), ["firstName", "lastName", "phone", "countryOfResidence"] as const);
  const res = await backend("/users/profile", { method: "PATCH", token, body });
  if (res.status === 401) await clearToken();
  if (!res.ok) return json(res.data ?? { message: "Error" }, res.status);
  return json({ profile: publicProfile(res.data) });
}
