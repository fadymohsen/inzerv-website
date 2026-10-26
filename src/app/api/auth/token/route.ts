import { getToken, isSameOrigin, json } from "@/lib/server/backend";

/**
 * Hands the session token to this site's own pages for document uploads, which go straight to
 * the backend because files can exceed the serverless request-size limit. Same-origin only.
 */
export async function GET(req: Request) {
  if (!isSameOrigin(req) || req.headers.get("sec-fetch-site") === null) {
    return json({ message: "Forbidden" }, 403);
  }
  const token = await getToken();
  if (!token) return json({ message: "Unauthorized" }, 401);
  return json({ token });
}
