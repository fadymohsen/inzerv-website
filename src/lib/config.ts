export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://inzerv-app-production.up.railway.app/api/v1";

export const SUPPORT_EMAIL = "Hello@inzerv.com";

// Legal pages are drafts until reviewed. Flip to false once approved.
export const LEGAL_IS_DRAFT = true;
export const LEGAL_UPDATED = "2026-10-15";

// Demo checkout: any sign-in or sign-up is accepted and nothing is sent to the backend.
// Set to false to use the real API (the backend must allow this site in ALLOWED_ORIGINS).
export const CHECKOUT_DEMO = true;
