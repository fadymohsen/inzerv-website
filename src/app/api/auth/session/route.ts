import { backend, clearToken, getToken, json, publicUser } from "@/lib/server/backend";

/** Who is signed in? Reads the httpOnly cookie, asks the backend, never returns the token. */
export async function GET() {
  const token = await getToken();
  if (!token) return json({ user: null });

  const res = await backend("/users/profile", { token });
  if (res.status === 401 || res.status === 403) {
    await clearToken();
    return json({ user: null });
  }
  if (!res.ok) return json({ message: "Service unavailable" }, 503);
  return json({ user: publicUser(res.data) });
}
