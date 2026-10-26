import { backend, isSameOrigin, json, pick, readJson } from "@/lib/server/backend";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ message: "Forbidden" }, 403);
  const body = pick(await readJson(req), ["email", "otp"] as const);
  const res = await backend("/auth/verify-otp", { method: "POST", body });
  return json(res.data ?? { message: "Error" }, res.status);
}
