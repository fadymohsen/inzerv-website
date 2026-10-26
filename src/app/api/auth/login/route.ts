import { backend, isSameOrigin, json, pick, publicUser, readJson, setToken } from "@/lib/server/backend";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ message: "Forbidden" }, 403);

  const body = pick(await readJson(req), ["email", "password"] as const);
  const res = await backend("/auth/login", { method: "POST", body });
  if (!res.ok) return json(res.data ?? { message: "Error" }, res.status);

  const token = res.data?.accessToken;
  if (typeof token !== "string") return json({ message: "Unexpected response" }, 502);
  await setToken(token);
  return json({ user: publicUser(res.data?.user as Record<string, unknown>) });
}
