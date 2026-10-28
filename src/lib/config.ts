/** Backend base URL. Browsers only use it for document uploads; everything else goes through this site's /api routes. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://inzerv-app-production.up.railway.app/api/v1";

export const SUPPORT_EMAIL = "Hello@inzerv.com";
export const SUPPORT_PHONE_MOBILE = "01070608705";
export const SUPPORT_PHONE_LANDLINE = "034234388";

// Legal pages are drafts until reviewed. Flip to false once approved.
export const LEGAL_IS_DRAFT = true;
export const LEGAL_UPDATED = "2026-10-15";
