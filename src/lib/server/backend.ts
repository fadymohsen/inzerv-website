import "server-only";
import { cookies } from "next/headers";
import { API_URL } from "../config";

export const SESSION_COOKIE = "inzerv_session";
const MAX_AGE = 60 * 60 * 24 * 7; // matches the backend's default 7-day token

/** Server-to-server base URL. Not exposed to the browser. */
const BASE = process.env.API_URL ?? API_URL;

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function setToken(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearToken() {
  (await cookies()).delete(SESSION_COOKIE);
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

/** Reject cross-site browser requests to state-changing routes. */
export function isSameOrigin(req: Request): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site) return site === "same-origin" || site === "none";
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function pick<T extends string>(source: Record<string, unknown>, keys: readonly T[]) {
  const out: Partial<Record<T, unknown>> = {};
  for (const k of keys) if (source[k] !== undefined) out[k] = source[k];
  return out;
}

type Init = { method?: string; token?: string | null; body?: unknown };

/** Calls the backend and normalises the result. Network failures become status 503. */
export async function backend(path: string, init: Init = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: init.method ?? "GET",
      headers: {
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    return { ok: res.ok, status: res.status, data: data as Record<string, unknown> | null };
  } catch {
    return { ok: false, status: 503, data: { message: "Service unavailable" } as Record<string, unknown> };
  }
}

export function publicUser(raw: Record<string, unknown> | null | undefined) {
  if (!raw) return null;
  return {
    id: String(raw.id ?? ""),
    email: String(raw.email ?? ""),
    firstName: String(raw.firstName ?? ""),
    lastName: String(raw.lastName ?? ""),
  };
}
