import { backend, clearToken, getToken, isSameOrigin, json, readJson } from "@/lib/server/backend";

/** Only these backend calls may be made through the signed-in session. */
const ALLOWED: { method: string; pattern: RegExp }[] = [
  { method: "POST", pattern: /^requests$/ },
  { method: "GET", pattern: /^requests$/ },
  { method: "GET", pattern: /^requests\/[0-9a-f-]{36}$/i },
  { method: "POST", pattern: /^payments$/ },
];

async function handle(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const joined = path.join("/");
  const method = req.method;

  if (!ALLOWED.some((a) => a.method === method && a.pattern.test(joined))) {
    return json({ message: "Not found" }, 404);
  }
  if (method !== "GET" && !isSameOrigin(req)) return json({ message: "Forbidden" }, 403);

  const token = await getToken();
  if (!token) return json({ message: "Unauthorized" }, 401);

  const res = await backend(`/${joined}`, {
    method,
    token,
    body: method === "POST" ? await readJson(req) : undefined,
  });
  if (res.status === 401) await clearToken();
  return Response.json(res.data ?? { message: "Error" }, {
    status: res.status,
    headers: { "Cache-Control": "no-store" },
  });
}

export const GET = handle;
export const POST = handle;
