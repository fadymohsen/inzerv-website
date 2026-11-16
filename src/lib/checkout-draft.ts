/**
 * Keeps an in-progress checkout across a language switch or page reload, so the
 * customer changes language without losing their entries or starting a new order.
 * Lives in sessionStorage (this tab only). Files cannot be serialised, so the
 * picked File objects are held in memory for client-side navigations.
 */
const KEY = "inzerv:checkout-draft:v1";

export type CheckoutDraft = {
  userId: string;
  serviceType: string;
  requestFor: "myself" | "another_person";
  copies: number;
  extraAuth: boolean;
  extraTranslation: boolean;
  translationLang: string;
  values: Record<string, string>;
  otherText: Record<string, string>;
  fieldPhoneCountries: Record<string, string>;
  delivery: {
    destinationId: string;
    recipientName: string;
    recipientPhone: string;
    city: string;
    governorate: string;
    address: string;
  };
  recipientPhoneCountry: string;
  customCity: string;
  residence: { country: string; city: string };
  method: "card" | "wallet";
  step: number;
  created: { id: string; ref: string } | null;
  uploaded: string[];
  paid: boolean;
  /** The customer was sent to the payment page for this order. */
  payStarted: boolean;
};

let heldFiles: { owner: string; files: Record<string, File> } = { owner: "", files: {} };

export function holdFiles(owner: string, files: Record<string, File>) {
  heldFiles = { owner, files };
}
export function takeFiles(owner: string): Record<string, File> {
  return heldFiles.owner === owner ? heldFiles.files : {};
}

export function saveDraft(draft: CheckoutDraft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* private mode or full: the page still works, it just cannot resume */
  }
}

export function loadDraft(): CheckoutDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CheckoutDraft) : null;
  } catch {
    return null;
  }
}

export function clearCheckoutDraft() {
  heldFiles = { owner: "", files: {} };
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
