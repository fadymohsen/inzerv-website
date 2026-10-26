/** Only allow in-site, same-locale paths as a post-login destination (blocks open redirects). */
export function safeNext(raw: string | null, locale: string, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith(`/${locale}/`) || raw.startsWith("//") || raw.includes("\\") || raw.includes("://")) {
    return fallback;
  }
  return raw;
}
