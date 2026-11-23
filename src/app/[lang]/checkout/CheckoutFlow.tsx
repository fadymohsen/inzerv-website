"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { buttonClass } from "@/components/Button";
import { Field, describedBy, inputClass } from "@/components/forms";
import { Select } from "@/components/Select";
import { BackIcon, CheckIcon, UploadIcon } from "@/components/Icons";
import { PhoneField } from "@/components/PhoneField";
import type { Dict } from "@/dictionaries/en";
import { ApiError, isSafePaymentUrl, orders } from "@/lib/api-client";
import { fmt, money } from "@/lib/dictionaries";
import { countryName, digits, processingTime, serviceName } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import {
  DEFAULT_PHONE_COUNTRY,
  isPhoneLengthValid,
  normalizePhoneCountry,
  phoneCountryOptions,
  toE164,
  type CountryCode,
} from "@/lib/phone";
import { useSession } from "@/components/SessionProvider";
import type { DeliveryDestination, ExtrasConfig, GovService, ServiceDocument } from "@/lib/types";
import { canOrderMyself, canOrderOther, isCriminalAbroad, serviceNotices } from "@/lib/service-rules";
import { clearCheckoutDraft, holdFiles, loadDraft, saveDraft, takeFiles } from "@/lib/checkout-draft";
import { applyDocRules, isCountryField, isNationalityField } from "@/lib/doc-rules";
import { getRegions, getRegionsForZone, getCities } from "@/lib/governorates";
import { splitPhone } from "@/lib/phone";

const TRANSLATION_PASSPORT_DOC: ServiceDocument = {
  id: "__translation_passport__",
  keyName: "translation_passport",
  labelEn: "A copy of the document holder's passport is required for translation.",
  labelAr: "صورة جواز سفر صاحب الوثيقة (مطلوب للترجمة)",
  isRequired: true,
  showForAnotherPerson: false,
  allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  maxSizeMb: 10,
  sortOrder: 9999,
};

/** Marriage / Divorce + translation: husband's passport */
const TRANSLATION_PASSPORT_HUSBAND_DOC: ServiceDocument = {
  id: "__translation_passport_husband__",
  keyName: "translation_passport_husband",
  labelEn: "Copy of the husband's passport - required for translation.",
  labelAr: "صورة جواز سفر الزوج - مطلوبة للترجمة.",
  isRequired: true,
  showForAnotherPerson: false,
  allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  maxSizeMb: 10,
  sortOrder: 9999,
};

/** Marriage / Divorce + translation: wife's passport */
const TRANSLATION_PASSPORT_WIFE_DOC: ServiceDocument = {
  id: "__translation_passport_wife__",
  keyName: "translation_passport_wife",
  labelEn: "Copy of the wife's passport - required for translation.",
  labelAr: "صورة جواز سفر الزوجة - مطلوبة للترجمة.",
  hintEn: "To ensure both parties' names in the translation match their passports.",
  hintAr: "لضمان كتابة اسمَي الطرفين في الترجمة مطابقَين لجوازَي السفر.",
  isRequired: true,
  showForAnotherPerson: false,
  allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  maxSizeMb: 10,
  sortOrder: 10000,
};

const DIVORCE_CERT_DOC: ServiceDocument = {
  id: "__divorce_cert__",
  keyName: "__divorce_certificate_copy__",
  labelEn: "Divorce Certificate Copy",
  labelAr: "صورة قسيمة الطلاق",
  isRequired: true,
  showForAnotherPerson: false,
  allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  maxSizeMb: 10,
  sortOrder: 9998,
};

const DEATH_CERT_DOC: ServiceDocument = {
  id: "__death_cert__",
  keyName: "__death_certificate_copy__",
  labelEn: "Deceased Spouse Death Certificate",
  labelAr: "شهادة وفاة الزوج / الزوجة",
  isRequired: true,
  showForAnotherPerson: false,
  allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  maxSizeMb: 10,
  sortOrder: 9997,
};

function isPassportDoc(keyName: string) {
  return keyName.toLowerCase().includes("passport");
}

function isIdentityDoc(keyName: string) {
  const k = keyName.toLowerCase();
  return /identity|id_card|national_id|nid|proof_of_id|id_proof|huwiya/.test(k) && !k.includes("passport");
}

function isRelationshipDoc(keyName: string) {
  const k = keyName.toLowerCase();
  return /relationship|applicant_doc|proof_of_rel|guardian|legal_auth|kinship|relative/.test(k);
}

/**
 * Override backend-provided document labels for specific service types / flows.
 * Items 2, 3, 4 from Batch-2 review notes.
 */
function patchDoc(
  d: ServiceDocument,
  serviceType: string,
  requestFor: "myself" | "another_person",
): ServiceDocument {
  const k = d.keyName.toLowerCase();

  // Item 4: Criminal Record (Egypt domestic) — ID upload label
  if (serviceType === "criminal_record" && isIdentityDoc(k)) {
    return {
      ...d,
      labelEn: "Copy of the criminal record holder's national ID card",
      labelAr: "صورة بطاقة الرقم القومي لصاحب الفيش",
    };
  }

  // Item 2: Birth Certificate for another person — first field (document holder ID)
  if (serviceType === "birth_certificate" && requestFor === "another_person" && isIdentityDoc(k)) {
    return {
      ...d,
      labelEn: "Copy of the document holder's national ID card or birth certificate",
      labelAr: "صورة بطاقة الرقم القومي أو شهادة الميلاد لصاحب الوثيقة",
    };
  }

  // Items 2 & 3: "for another person" — relationship/applicant doc standardization (all services)
  if (requestFor === "another_person" && isRelationshipDoc(k)) {
    return {
      ...d,
      labelEn: "Applicant documents and proof of relationship to the document holder",
      labelAr: "مستندات مقدم الطلب وإثبات صلة القرابة بصاحب الوثيقة",
      hintEn: "Upload a copy of your national ID card and add the documents needed to prove your relationship. You do not need to upload the same document more than once.",
      hintAr: "ارفع صورة بطاقتك، وأضف المستندات اللازمة لإثبات صلة القرابة. لا تحتاج إلى رفع المستند نفسه أكثر من مرة.",
      allowMultiple: true,
    };
  }

  return d;
}

function isWivesCountField(keyName: string) {
  const k = keyName.toLowerCase();
  return k === "number_of_wives" || k === "marriages_count" || k === "num_marriages" || k === "number_of_marriages";
}

function isMarriageCertDoc(keyName: string) {
  const k = keyName.toLowerCase();
  return k.includes("marriage") && (k.includes("cert") || k.includes("certificate") || k.includes("copy") || k.includes("contract"));
}

function isCivilStatusField(keyName: string) {
  return keyName.toLowerCase() === "civil_status";
}

/** Docs that accept multiple files (one per child / per event, or relationship-proof docs). */
function isMultiUploadDoc(_keyName: string, _doc?: ServiceDocument) {
  // Every upload slot takes several files (e.g. both sides of an ID card).
  return true;
}

const NATIONAL_ID_RE = /^[23]\d{13}$/;
const NATIONAL_ID_KEYS = ["national_id", "nationalid", "nid"];
function isNationalIdField(key: string) {
  const k = key.toLowerCase();
  return NATIONAL_ID_KEYS.some((id) => k.includes(id));
}
function isValidNationalId(value: string) {
  return NATIONAL_ID_RE.test(value);
}
function isNameField(key: string) {
  const k = key.toLowerCase();
  return k.includes("_name") || k === "holder_name";
}
function isPhoneField(key: string) {
  const k = key.toLowerCase();
  return k.includes("phone") || k.includes("mobile") || k === "tel" || k.includes("_tel");
}

function isOtherPartyField(key: string) {
  const k = key.toLowerCase();
  return k.includes("other") || k.includes("spouse") || k.includes("party")
    || k.includes("wife") || k.includes("second");
}

/** Validates a full name: at least `minParts` words, each at least 2 characters.
 *  Hyphenated parts (e.g. "Jean-Pierre") count as one part. */
function isValidFullName(value: string, minParts = 4): boolean {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length < minParts) return false;
  return parts.every((p) => p.replace(/[-'ʼ'']/g, "").length >= 2);
}

function isForeignNameField(key: string) {
  const k = key.toLowerCase();
  return k.includes("foreign") || k.includes("english") || k.includes("_en");
}

function isOtherOption(value: string) {
  const v = value.toLowerCase().trim();
  return v === "other" || v === "أخرى" || v === "others";
}

function isRelationshipField(key: string) {
  return key.toLowerCase() === "relationship";
}

/** Roles a party to the marriage can pick when ordering for themselves. */
const MYSELF_RELATIONSHIPS = new Set(["husband", "wife"]);
/** Party-only roles never apply to a relative ordering for someone else. */
const PARTY_ONLY = new Set(["husband", "wife", "spouse"]);

/** Today's date as YYYY-MM-DD in local timezone. */
function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isWifeField(key: string) {
  return key.toLowerCase().includes("wife");
}

/** Minimum name parts required for a field based on service type and field key. */
function minNamesFor(serviceType: string, fieldKey: string): number {
  // overseas_foreign_marriage: foreign name = 2, Egyptian name = 4
  if (serviceType === "overseas_foreign_marriage" && isForeignNameField(fieldKey)) return 2;
  // overseas birth: the mother may be foreign, so two names are enough
  if (serviceType === "overseas_birth_registration" && fieldKey.toLowerCase().includes("mother")) return 2;
  // divorce_certificate: other party (wife/spouse/other) = 3
  if (serviceType === "divorce_certificate" && isOtherPartyField(fieldKey)) return 3;
  // Default: 4 names
  return 4;
}

/** Error message key for the given minNames requirement. */
function nameErrorKey(minNames: number): "fullName" | "fullName3" | "fullName4" {
  if (minNames <= 2) return "fullName";
  if (minNames === 3) return "fullName3";
  return "fullName4";
}

const STEPS = ["details", "documents", "delivery", "review"] as const;
type StepKey = (typeof STEPS)[number];
type Errors = Record<string, string>;
type Stage = "idle" | "creating" | "uploading" | "paying" | "redirecting" | "done";

export function CheckoutFlow({
  locale,
  t,
  legal,
  services,
  destinations,
  extras,
  phoneCountryLabel,
  searchCountryLabel,
}: {
  locale: Locale;
  t: Dict["checkout"];
  legal: { terms: string; refund: string; privacy: string };
  services: GovService[];
  destinations: DeliveryDestination[];
  extras: ExtrasConfig;
  phoneCountryLabel: string;
  searchCountryLabel: string;
}) {
  const search = useSearchParams();
  const pick = (en: string, ar: string) => (locale === "ar" ? ar : en);

  const { status, user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [focusTick, setFocusTick] = useState(0);

  // details
  const initialType = search.get("service");
  const [serviceType, setServiceType] = useState(
    services.find((s) => s.type === initialType)?.type ?? services[0]?.type ?? "",
  );

  // Sync with URL when user returns from /request with a different service
  useEffect(() => {
    const fromUrl = search.get("service");
    if (fromUrl && services.some((s) => s.type === fromUrl) && fromUrl !== serviceType && !locked) {
      setServiceType(fromUrl);
      setValues({});
      setFiles({});
      setFileErrors({});
      setFieldPhoneCountries({});
      setRequestFor("myself");
      setResidence({ country: "", city: "" });
      setCopies(1);
      setExtraAuth(false);
      setExtraTranslation(false);
      setTranslationLang("");
      setDeliveryCountry("");
      setDelivery({ destinationId: "", recipientName: "", recipientPhone: "", city: "", governorate: "", address: "" });
      setErrors({});
      setStep(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialType]);
  const [requestFor, setRequestFor] = useState<"myself" | "another_person">(() =>
    canOrderMyself(services.find((s) => s.type === initialType) ?? services[0]) ? "myself" : "another_person",
  );
  const [residence, setResidence] = useState({ country: "", city: "" });
  // The admin console can switch "for myself" / "for someone else" off per service.
  useEffect(() => {
    const sv = services.find((x) => x.type === serviceType);
    if (!canOrderMyself(sv)) setRequestFor("another_person");
    else if (!canOrderOther(sv)) setRequestFor("myself");
  }, [serviceType, services]);
  const [copies, setCopies] = useState(1);
  const [extraAuth, setExtraAuth] = useState(false);
  const [extraTranslation, setExtraTranslation] = useState(false);
  const [translationLang, setTranslationLang] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [fieldPhoneCountries, setFieldPhoneCountries] = useState<Record<string, CountryCode>>({});

  // documents
  const [files, setFiles] = useState<Record<string, File>>({});
  const [multiFiles, setMultiFiles] = useState<Record<string, File[]>>({});
  const [fileErrors, setFileErrors] = useState<Errors>({});

  // delivery
  const [delivery, setDelivery] = useState({
    destinationId: "",
    recipientName: "",
    recipientPhone: "",
    city: "",
    governorate: "",
    address: "",
  });
  const [recipientPhoneCountry, setRecipientPhoneCountry] = useState<CountryCode>(DEFAULT_PHONE_COUNTRY);
  const [customCity, setCustomCity] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("");

  // review
  const [agree, setAgree] = useState(false);
  const [ackNotice, setAckNotice] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState({ i: 0, n: 0 });
  const [submitError, setSubmitError] = useState("");
  const created = useRef<{ id: string; ref: string; total: number } | null>(null);
  const uploaded = useRef(new Set<string>());
  const paid = useRef(false);
  const payStarted = useRef(false);
  const [locked, setLocked] = useState(false);
  // true only after the customer came back from the payment gateway to an unpaid order
  const [returnedFromPay, setReturnedFromPay] = useState(false);
  const [reference, setReference] = useState("");

  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const service = services.find((s) => s.type === serviceType);
  const destination = destinations.find((d) => d.id === delivery.destinationId);

  function setDestination(destinationId: string) {
    setDelivery((d) => ({ ...d, destinationId, governorate: "", city: "", address: "" }));
    setCustomCity("");
    const next = destinations.find((d) => d.id === destinationId);
    const normalized = next && normalizePhoneCountry(next.countryCode);
    if (normalized) setRecipientPhoneCountry(normalized);
  }

  function setGovernorate(governorate: string) {
    setDelivery((d) => ({ ...d, governorate, city: "" }));
    setCustomCity("");
  }

  function handleDeliveryCountry(code: string) {
    setDeliveryCountry(code);
    if (code !== "EG") {
      // Gulf country: auto-select its single destination
      const dest = allowedDestinations.find((d) => d.countryCode.toUpperCase() === code);
      if (dest) setDestination(dest.id);
      else {
        setDelivery((d) => ({ ...d, destinationId: "", governorate: "", city: "", address: "" }));
        setCustomCity("");
      }
    } else {
      // Egypt: clear destination until user picks a zone
      setDelivery((d) => ({ ...d, destinationId: "", governorate: "", city: "", address: "" }));
      setCustomCity("");
    }
  }

  const signInUrl = `/${locale}/signin?next=${encodeURIComponent(`${pathname}${search.toString() ? `?${search.toString()}` : ""}`)}`;

  useEffect(() => {
    if (status === "anonymous") router.replace(signInUrl);
  }, [status, router, signInUrl]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [step, stage]);

  useEffect(() => {
    if (!focusTick) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [focusTick]);

  const visibleFields = useMemo(
    () =>
      (service?.fields ?? [])
        .filter((f) => requestFor === "another_person" || !f.showForAnotherPerson || isRelationshipField(f.keyName))
        // Ordering for someone else: the relationship question sits right under the choice.
        // Ordering for yourself: only the marriage certificate asks for your role.
        .filter((f) => !isRelationshipField(f.keyName) || requestFor === "another_person" || serviceType === "marriage_certificate")
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [service, serviceType, requestFor],
  );
  const relationshipField = visibleFields.find((f) => isRelationshipField(f.keyName));
  const otherFields = visibleFields.filter((f) => !isRelationshipField(f.keyName));
  const visibleDocs = useMemo(
    () =>
      (service?.requiredDocuments ?? [])
        .filter((d) => requestFor === "another_person" || !d.showForAnotherPerson)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((d) => patchDoc(d, serviceType, requestFor)),
    [service, serviceType, requestFor],
  );
  const effectiveDocs = useMemo(() => {
    let docs: ServiceDocument[] = applyDocRules(visibleDocs, serviceType, requestFor, values);

    // 1. family_record: expand marriage_certificate_copy to N slots for N wives
    const wivesField = visibleFields.find((f) => isWivesCountField(f.keyName));
    const wivesCount = wivesField ? parseInt(values[wivesField.keyName] ?? "0", 10) : null;
    if (wivesCount !== null && wivesCount > 1) {
      const idx = docs.findIndex((d) => isMarriageCertDoc(d.keyName));
      if (idx !== -1) {
        const original = docs[idx];
        const expanded: ServiceDocument[] = Array.from({ length: wivesCount }, (_, i) => ({
          ...original,
          id: `${original.id}__${i + 1}`,
          keyName: `${original.keyName}__${i + 1}`,
          labelEn: `${original.labelEn} (${i + 1})`,
          labelAr: `${original.labelAr} (${i + 1})`,
          sortOrder: original.sortOrder + i,
        }));
        docs = [...docs.slice(0, idx), ...expanded, ...docs.slice(idx + 1)];
      }
    }

    // 2. individual_civil_status_record: inject divorce/death cert based on civil_status
    const civilStatusField = visibleFields.find((f) => isCivilStatusField(f.keyName));
    if (civilStatusField) {
      const status = values[civilStatusField.keyName];
      if (status === "divorced" && !docs.some((d) => d.keyName.toLowerCase().includes("divorce"))) {
        docs = [...docs, DIVORCE_CERT_DOC];
      } else if (status === "widowed" && !docs.some((d) => d.keyName.toLowerCase().includes("death"))) {
        docs = [...docs, DEATH_CERT_DOC];
      }
    }

    // 3. Translation: inject passport docs (two for marriage/divorce, one for all others)
    if (extraTranslation && !docs.some((d) => isPassportDoc(d.keyName))) {
      if (serviceType === "marriage_certificate" || serviceType === "divorce_certificate") {
        docs = [...docs, TRANSLATION_PASSPORT_HUSBAND_DOC, TRANSLATION_PASSPORT_WIFE_DOC];
      } else {
        docs = [...docs, TRANSLATION_PASSPORT_DOC];
      }
    }

    return docs;
  }, [visibleDocs, visibleFields, extraTranslation, values, serviceType, requestFor]);

  // Prune files whose doc slot no longer exists (e.g. wives count changed, civil status switched)
  useEffect(() => {
    const docKeys = new Set(effectiveDocs.map((d) => d.keyName));
    setFiles((prev) => {
      const filtered = Object.fromEntries(Object.entries(prev).filter(([k]) => docKeys.has(k)));
      return Object.keys(filtered).length === Object.keys(prev).length ? prev : filtered;
    });
    setMultiFiles((prev) => {
      const filtered = Object.fromEntries(Object.entries(prev).filter(([k]) => docKeys.has(k)));
      return Object.keys(filtered).length === Object.keys(prev).length ? prev : filtered;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveDocs]);

  // Where this service may be used / delivered (admin console)
  const residenceRule = service?.residenceRule?.length ? service.residenceRule : null;
  const residenceEntry = residenceRule?.find((r) => r.code === residence.country);
  // Criminal record from abroad: any country of residence, country only.
  const openResidence = isCriminalAbroad(service);
  const allCountries = useMemo(() => phoneCountryOptions(locale), [locale]);
  const deliveryRule = service?.deliveryRule?.length ? service.deliveryRule : null;
  const allowedDestinations = deliveryRule
    ? destinations.filter((d) => deliveryRule.some((r) => r.code.toUpperCase() === d.countryCode.toUpperCase()))
    : destinations;
  const deliveryCities = deliveryRule && destination
    ? (deliveryRule.find((r) => r.code.toUpperCase() === destination.countryCode.toUpperCase())?.cities ?? null)
    : null;
  const notices = service ? serviceNotices(service, locale, t.rules) : [];
  const paymentNotice = (locale === "ar" ? service?.paymentNoticeAr : service?.paymentNoticeEn)?.trim() || "";
  // Anything the customer must read before paying needs an explicit acknowledgement.
  const hasPaymentNotice = !!paymentNotice || isCriminalAbroad(service);
  // A country with a governorate list (Egypt) is restricted by governorate; any other by city.
  const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  const allowedRegions =
    deliveryCities && destination
      ? getRegions(destination.countryCode).filter((r) => deliveryCities.some((c) => sameName(c.en, r.en) || sameName(c.ar, r.ar)))
      : [];
  const restrictByRegion = allowedRegions.length > 0;
  const restrictByCity = !!deliveryCities && !restrictByRegion;

  // If any select field option carries a price override, use it as the unit price
  const unitPrice = (() => {
    if (!service) return 0;
    for (const field of service.fields ?? []) {
      if (!field.options?.length) continue;
      const selected = values[field.keyName];
      if (!selected) continue;
      const opt = field.options.find((o) => o.value === selected);
      if (opt?.price != null) return opt.price;
    }
    return service.servicePrice ?? 0;
  })();
  const serviceFee = unitPrice * copies;
  const deliveryFee = destination?.deliveryFee ?? 0;
  const authFee = extraAuth ? extras.authPrice : 0;
  const translationFee = extraTranslation && translationLang ? extras.translationPrice : 0;
  const extrasFee = authFee + translationFee;
  const total = serviceFee + deliveryFee + extrasFee;

  function fail(next: Errors) {
    setErrors(next);
    if (Object.keys(next).length) {
      setFocusTick((n) => n + 1);
      return false;
    }
    return true;
  }

  function errMessage(err: unknown): string {
    if (err instanceof ApiError) return err.status === 0 ? t.errors.network : err.message;
    return t.errors.generic;
  }

  /* ---------- step validation ---------- */

  function validate(key: StepKey): boolean {
    const next: Errors = {};
    if (key === "details") {
      if (!service) next.service = t.errors.select;
      if (!Number.isInteger(copies) || copies < 1 || copies > 19) next.copies = t.errors.required;
      if (extraTranslation && !translationLang) next.translationLang = t.errors.select;
      if (openResidence) {
        if (!residence.country) next.residenceCountry = t.errors.select;
      } else if (residenceRule) {
        if (!residenceEntry) next.residenceCountry = t.errors.select;
        else if (residenceEntry.cities === null) {
          if (!residence.city.trim()) next.residenceCity = t.errors.required;
        } else if (!residenceEntry.cities.some((c) => c.en === residence.city)) next.residenceCity = t.errors.select;
      }
      for (const f of visibleFields) {
        const val = values[f.keyName]?.trim() ?? "";
        if (f.isRequired && !val) next[`f_${f.keyName}`] = t.errors.required;
        else if (f.fieldType === "select" && isOtherOption(val) && !(otherText[f.keyName]?.trim())) next[`f_${f.keyName}`] = t.errors.required;
        else if (isNationalIdField(f.keyName) && val && !isValidNationalId(val))
          next[`f_${f.keyName}`] = t.errors.nationalId;
        else if (isNameField(f.keyName) && val) {
          const min = minNamesFor(serviceType, f.keyName);
          if (!isValidFullName(val, min)) next[`f_${f.keyName}`] = t.errors[nameErrorKey(min)];
        }
        else if (isPhoneField(f.keyName) && val && !isPhoneLengthValid(val, fieldPhoneCountries[f.keyName] ?? DEFAULT_PHONE_COUNTRY))
          next[`f_${f.keyName}`] = t.errors.phoneInvalid;
        else if (f.fieldType === "date" && val) {
          const d = new Date(val + "T00:00:00");
          const today = new Date(); today.setHours(0, 0, 0, 0);
          if (d > today) next[`f_${f.keyName}`] = t.errors.futureDate;
        }
      }
      // family_record: block 0 marriages (contradicts required marriage cert doc)
      const wivesField = visibleFields.find((f) => isWivesCountField(f.keyName));
      if (wivesField) {
        const wivesRaw = values[wivesField.keyName]?.trim() ?? "";
        const wivesNum = wivesRaw !== "" ? parseInt(wivesRaw, 10) : NaN;
        if (!isNaN(wivesNum) && wivesNum < 1 && !next[`f_${wivesField.keyName}`]) {
          next[`f_${wivesField.keyName}`] = locale === "ar"
            ? "عدد الزيجات يجب أن يكون ١ على الأقل"
            : "Number of marriages must be at least 1 for this service";
        }
      }

      // Cross-field: divorce date must not be before marriage date
      const marriageField = visibleFields.find((f) => f.fieldType === "date" && /marriage.*date/i.test(f.keyName));
      const divorceField = visibleFields.find((f) => f.fieldType === "date" && /divorce.*date/i.test(f.keyName));
      if (marriageField && divorceField) {
        const mVal = values[marriageField.keyName]?.trim();
        const dVal = values[divorceField.keyName]?.trim();
        if (mVal && dVal && dVal < mVal && !next[`f_${divorceField.keyName}`]) {
          next[`f_${divorceField.keyName}`] = t.errors.divorceBeforeMarriage;
        }
      }
    }
    if (key === "documents") {
      for (const d of effectiveDocs) {
        // a document already sent for the order (resumed checkout) does not need picking again
        if (uploaded.current.has(d.keyName)) continue;
        if (d.isRequired) {
          if (isMultiUploadDoc(d.keyName, d)) {
            if (!(multiFiles[d.keyName]?.length)) next[`d_${d.keyName}`] = t.errors.required;
          } else {
            if (!files[d.keyName]) next[`d_${d.keyName}`] = t.errors.required;
          }
        }
      }
      if (Object.keys(fileErrors).length) Object.assign(next, fileErrors);
    }
    if (key === "delivery") {
      if (!deliveryCountry) next.deliveryCountry = t.errors.select;
      if (!delivery.destinationId) next.destinationId = t.errors.select;
      if (restrictByCity && !deliveryCities!.some((c) => c.en === delivery.city)) next.city = t.errors.select;
      if (!delivery.recipientName.trim()) next.recipientName = t.errors.required;
      else if (!isValidFullName(delivery.recipientName, 2)) next.recipientName = t.errors.fullName;
      if (!delivery.recipientPhone.trim()) next.recipientPhone = t.errors.required;
      else if (!isPhoneLengthValid(delivery.recipientPhone, recipientPhoneCountry)) next.recipientPhone = t.errors.phoneInvalid;
      if (restrictByCity) {
        /* city already checked against the allowed list */
      } else if (delivery.city === "__other__") {
        if (!customCity.trim()) next.city = t.errors.required;
        else if (customCity.trim().length < 2) next.city = t.details.cityMin;
      } else if (!delivery.city.trim()) next.city = t.errors.required;
      else if (delivery.city.trim().length < 2) next.city = t.details.cityMin;
      if (!delivery.governorate.trim()) next.governorate = t.errors.select;
      if (!delivery.address.trim()) next.address = t.errors.required;
      else if (delivery.address.trim().length < 5) next.address = t.errors.addressShort;
    }
    if (key === "review" && !agree) next.agree = t.errors.agree;
    if (key === "review" && hasPaymentNotice && !ackNotice) next.ackNotice = t.errors.ackNotice;
    return fail(next);
  }

  function goNext() {
    if (!validate(STEPS[step])) return;
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    formRef.current?.scrollIntoView({ block: "start" });
  }

  function goBack() {
    setErrors({});
    const lockedAt = created.current ? STEPS.indexOf("documents") : 0;
    setStep((s) => Math.max(s - 1, lockedAt));
    formRef.current?.scrollIntoView({ block: "start" });
  }

  /* ---------- files ---------- */

  function onPickFile(key: string, maxMb: number | null, allowed: string[] | null, file: File | undefined) {
    if (!file) return;
    const limit = maxMb ?? 10;
    let error = "";
    if (file.size > limit * 1024 * 1024) error = fmt(t.documents.tooLarge, { n: digits(String(limit), locale) });
    else if (allowed?.length && !allowed.includes(file.type)) error = t.documents.badType;

    setFileErrors((prev) => {
      const copy = { ...prev };
      if (error) copy[`d_${key}`] = error;
      else delete copy[`d_${key}`];
      return copy;
    });
    if (error) return;
    uploaded.current.delete(key);
    setFiles((prev) => ({ ...prev, [key]: file }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[`d_${key}`];
      return copy;
    });
  }

  function removeFile(key: string) {
    uploaded.current.delete(key);
    setFiles((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }

  function onAddMultiFile(key: string, maxMb: number | null, allowed: string[] | null, file: File | undefined) {
    if (!file) return;
    const limit = maxMb ?? 10;
    let error = "";
    if (file.size > limit * 1024 * 1024) error = fmt(t.documents.tooLarge, { n: digits(String(limit), locale) });
    else if (allowed?.length && !allowed.includes(file.type)) error = t.documents.badType;

    if (error) {
      setFileErrors((prev) => ({ ...prev, [`d_${key}`]: error }));
      return;
    }
    setFileErrors((prev) => { const c = { ...prev }; delete c[`d_${key}`]; return c; });
    setErrors((prev) => { const c = { ...prev }; delete c[`d_${key}`]; return c; });
    setMultiFiles((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), file] }));
  }

  function removeMultiFile(key: string, index: number) {
    setMultiFiles((prev) => {
      const updated = (prev[key] ?? []).filter((_, i) => i !== index);
      if (updated.length === 0) {
        const c = { ...prev }; delete c[key]; return c;
      }
      return { ...prev, [key]: updated };
    });
  }

  /* ---------- place order ---------- */

  async function placeOrder() {
    if (!validate("review") || status !== "authenticated" || !service) return;
    setSubmitError("");
    try {
      if (!created.current) {
        setStage("creating");
        const res = await orders.create({
          serviceId: service.id,
          requestFor,
          ...(openResidence && residence.country
            ? { residenceCountry: residence.country }
            : residenceRule && residenceEntry
              ? { residenceCountry: residenceEntry.code, residenceCity: residence.city.trim() }
              : {}),
          fieldValues: [
            ...visibleFields
              .filter((f) => values[f.keyName]?.trim())
              .map((f) => {
                const raw = values[f.keyName].trim();
                let value = raw;
                if (isPhoneField(f.keyName)) value = toE164(raw, fieldPhoneCountries[f.keyName] ?? DEFAULT_PHONE_COUNTRY) ?? raw;
                else if (f.fieldType === "select" && isOtherOption(raw) && otherText[f.keyName]?.trim()) value = otherText[f.keyName].trim();
                return { fieldKey: f.keyName, value };
              }),
            ...(extraAuth ? [{ fieldKey: "extra_authentication", value: "yes" }] : []),
            ...(extraTranslation && translationLang ? [{ fieldKey: "extra_translation", value: translationLang }] : []),
          ],
          numberOfCopies: copies,
          deliveryDestinationId: delivery.destinationId,
          recipientName: delivery.recipientName.trim(),
          recipientPhone: toE164(delivery.recipientPhone, recipientPhoneCountry) ?? delivery.recipientPhone.trim(),
          deliveryCity: (delivery.city === "__other__" ? customCity : delivery.city).trim(),
          deliveryAddress: delivery.address.trim(),
          deliveryGovernorate: delivery.governorate.trim() || undefined,
        });
        created.current = { id: res.id, ref: res.referenceNumber, total };
        setLocked(true);
      }

      // Cache ref value so TypeScript knows it's non-null for the rest of this function
      const c = created.current!;

      // Build flat list of {docKeyName, uploadKey, file} for all docs
      type UploadItem = { docKeyName: string; uploadKey: string; file: File };
      const allPending: UploadItem[] = [];
      for (const d of effectiveDocs) {
        if (uploaded.current.has(d.keyName)) continue;
        if (isMultiUploadDoc(d.keyName)) {
          (multiFiles[d.keyName] ?? []).forEach((file, i) => {
            allPending.push({ docKeyName: d.keyName, uploadKey: i === 0 ? d.keyName : `${d.keyName}__${i + 1}`, file });
          });
        } else if (files[d.keyName]) {
          allPending.push({ docKeyName: d.keyName, uploadKey: d.keyName, file: files[d.keyName] });
        }
      }
      const uploadedDocKeys = new Set<string>();
      for (let i = 0; i < allPending.length; i++) {
        setStage("uploading");
        setProgress({ i: i + 1, n: allPending.length });
        try {
          await orders.upload(c.id, allPending[i].uploadKey, allPending[i].file);
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) throw err;
          throw new UploadError(err);
        }
        uploadedDocKeys.add(allPending[i].docKeyName);
      }
      uploadedDocKeys.forEach((k) => uploaded.current.add(k));

      if (!paid.current) {
        setStage("paying");
        try {
          const payment = await orders.pay(c.id, "card", locale);
          if (payment.status === "pending") {
            // real gateway: the customer pays on the hosted page and returns to /checkout/result
            if (!payment.checkoutUrl || !isSafePaymentUrl(payment.checkoutUrl)) throw new Error("No payment page");
            setStage("redirecting");
            payStarted.current = true;
            window.location.assign(payment.checkoutUrl);
            return;
          }
        } catch (err) {
          const already = err instanceof ApiError && /already been paid/i.test(err.message);
          if (!already) {
            if (err instanceof ApiError && err.status === 401) throw err;
            throw new PayError(err);
          }
        }
        paid.current = true;
      }

      setReference(c.ref);
      setStage("done");
    } catch (err) {
      setStage("idle");
      if (err instanceof ApiError && err.status === 401) {
        router.replace(signInUrl);
        return;
      }
      if (err instanceof UploadError) setSubmitError(`${t.errors.uploadFailed} ${detail(err.cause)}`.trim());
      else if (err instanceof PayError) {
        const cause = err.cause;
        const isStale = cause instanceof ApiError && /not waiting for payment/i.test(cause.message);
        if (isStale) {
          // The saved order is no longer payable (already paid, cancelled, etc.).
          // Clear the stale draft so the user can submit a fresh order with the same details.
          created.current = null;
          uploaded.current = new Set();
          paid.current = false;
          payStarted.current = false;
          setLocked(false);
          setReturnedFromPay(false);
          clearCheckoutDraft();
          setSubmitError(
            locale === "ar"
              ? "هذا الطلب لم يعد في انتظار الدفع. بياناتك محفوظة — اضغط «متابعة» لتقديم طلب جديد."
              : "This order is no longer waiting for payment. Your details are saved — click Continue to place a new order.",
          );
        } else {
          setSubmitError(`${t.errors.payFailed} ${detail(err.cause)}`.trim());
        }
      }
      else setSubmitError(errMessage(err));
    }
  }

  function detail(cause: unknown) {
    return cause instanceof ApiError && cause.status !== 0 ? cause.message : "";
  }

  function reset() {
    clearCheckoutDraft();
    created.current = null;
    uploaded.current = new Set();
    paid.current = false;
    payStarted.current = false;
    setLocked(false);
    setFiles({});
    setValues({});
    setAgree(false);
    setReference("");
    setSubmitError("");
    setStage("idle");
    setDeliveryCountry("");
    setStep(0);
  }

  /* ---------- keep the checkout across a language switch or reload ---------- */

  const restored = useRef(false);
  const userId = user?.id ?? "";

  useEffect(() => {
    if (restored.current || status !== "authenticated" || !userId) return;
    restored.current = true;
    const d = loadDraft();
    if (!d || d.userId !== userId) return;
    const fromUrl = search.get("service");
    if (fromUrl && fromUrl !== d.serviceType) return; // started a different service: do not resume the old one
    if (!services.some((x) => x.type === d.serviceType)) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setServiceType(d.serviceType);
    setRequestFor(d.requestFor);
    setCopies(d.copies);
    setExtraAuth(d.extraAuth);
    setExtraTranslation(d.extraTranslation);
    setTranslationLang(d.translationLang);
    setValues(d.values);
    setOtherText(d.otherText);
    setFieldPhoneCountries(d.fieldPhoneCountries as Record<string, CountryCode>);
    setDelivery(d.delivery);
    setRecipientPhoneCountry(d.recipientPhoneCountry as CountryCode);
    setCustomCity(d.customCity);
    // Restore delivery country from draft, or derive from destinationId for legacy drafts
    if (d.deliveryCountry) {
      setDeliveryCountry(d.deliveryCountry);
    } else if (d.delivery?.destinationId) {
      const foundDest = destinations.find((x) => x.id === d.delivery.destinationId);
      if (foundDest) setDeliveryCountry(foundDest.countryCode.toUpperCase());
    }
    setResidence(d.residence);
    setFiles(takeFiles(`${userId}:${d.serviceType}`));
    if (d.created) {
      created.current = { ...d.created, total: d.created.total ?? 0 };
      uploaded.current = new Set(d.uploaded);
      paid.current = d.paid;
      payStarted.current = !!d.payStarted;
      setLocked(true);
      // Came back from the payment page: restore the review step so the customer can re-pay or
      // navigate back to delivery — do NOT redirect away; all data and files are preserved here.
      if (d.payStarted && !d.paid) {
        payStarted.current = false; // clear so saveDraft won't re-trigger this
        setReturnedFromPay(true);
        setStep(STEPS.indexOf("review"));
        return;
      }
    }
    setStep(Math.min(Math.max(d.step, d.created ? STEPS.indexOf("documents") : 0), STEPS.length - 1));
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, userId]);

  // Back from the hosted payment page: the browser may restore this page from its back/forward cache
  // with the "redirecting" state frozen in, leaving the pay button stuck on "...". Reset it.
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (!e.persisted) return;
      setStage((s) => {
        if (s === "redirecting") setReturnedFromPay(true);
        return s === "redirecting" || s === "paying" ? "idle" : s;
      });
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    if (!restored.current || !userId || !serviceType) return;
    if (stage === "done") {
      clearCheckoutDraft();
      return;
    }
    holdFiles(`${userId}:${serviceType}`, files);
    saveDraft({
      userId,
      serviceType,
      requestFor,
      copies,
      extraAuth,
      extraTranslation,
      translationLang,
      values,
      otherText,
      fieldPhoneCountries,
      delivery,
      recipientPhoneCountry,
      customCity,
      deliveryCountry,
      residence,
      method: "card",
      step,
      created: created.current,
      uploaded: [...uploaded.current],
      paid: paid.current,
      payStarted: payStarted.current,
    });
  });

  function renderField(f: GovService["fields"][number]) {
    const id = `f-${f.keyName}`;
    const err = errors[`f_${f.keyName}`];
    const common = {
      id,
      value: values[f.keyName] ?? "",
      "aria-invalid": !!err,
      "aria-describedby": describedBy(id, !!err, false),
      className: inputClass,
    };
    const set = (v: string) => setValues((prev) => ({ ...prev, [f.keyName]: v }));
    const fieldLabel = isRelationshipField(f.keyName) && serviceType === "marriage_certificate"
      ? (requestFor === "myself" ? t.details.relationshipMyself : t.details.relationshipAnother)
      : pick(f.labelEn, f.labelAr).replace(/ \(.*\)$/, "");
    return (
      <Field key={f.id} id={id} label={fieldLabel} error={err} required={f.isRequired} hint={isNationalIdField(f.keyName) ? t.errors.numericHint : (isNameField(f.keyName) && (isForeignNameField(f.keyName) || (serviceType === "overseas_foreign_marriage" && isOtherPartyField(f.keyName)))) ? t.details.foreignNameHint : undefined}>
        {isPhoneField(f.keyName) && f.fieldType !== "select" ? (
          <PhoneField
            id={id}
            locale={locale}
            countryLabel={phoneCountryLabel}
            searchPlaceholder={searchCountryLabel}
            country={fieldPhoneCountries[f.keyName] ?? DEFAULT_PHONE_COUNTRY}
            onCountryChange={(c) => setFieldPhoneCountries((prev) => ({ ...prev, [f.keyName]: c }))}
            value={values[f.keyName] ?? ""}
            onChange={set}
            invalid={!!err}
            describedBy={describedBy(id, !!err, false)}
          />
        ) : (isCountryField(f.keyName) || isNationalityField(f.keyName)) && f.fieldType !== "select" ? (
          <Select
            id={id}
            value={values[f.keyName] ?? ""}
            placeholder={t.details.choose}
            options={allCountries.map((c) => ({ value: c.name, label: `${c.flag} ${c.name}` }))}
            onChange={set}
            aria-invalid={!!err}
            aria-describedby={describedBy(id, !!err, false)}
          />
        ) : f.fieldType === "select" ? (
          <>
            <Select
              id={id}
              value={values[f.keyName] ?? ""}
              placeholder={t.details.choose}
              options={(f.options ?? [])
                .filter((o) => (!isRelationshipField(f.keyName) ? true : requestFor === "myself" ? MYSELF_RELATIONSHIPS.has(o.value) : !PARTY_ONLY.has(o.value)))
                .map((o) => ({
                  value: o.value,
                  label: pick(o.labelEn, o.labelAr),
                }))}
              onChange={(v) => {
                set(v);
                if (!isOtherOption(v)) setOtherText((prev) => { const n = { ...prev }; delete n[f.keyName]; return n; });
              }}
              aria-invalid={!!err}
              aria-describedby={describedBy(id, !!err, false)}
            />
            {isOtherOption(values[f.keyName] ?? "") && (
              <input
                id={`${id}-other`}
                value={otherText[f.keyName] ?? ""}
                placeholder={t.details.otherSpecify}
                onChange={(e) => setOtherText((prev) => ({ ...prev, [f.keyName]: e.target.value }))}
                aria-invalid={!!err}
                className={`${inputClass} mt-2`}
              />
            )}
          </>
        ) : (
          <input
            {...common}
            type={f.fieldType === "date" ? "date" : f.fieldType === "number" ? "number" : "text"}
            inputMode={f.fieldType === "number" || isNationalIdField(f.keyName) ? "numeric" : undefined}
            maxLength={isNationalIdField(f.keyName) ? 14 : undefined}
            max={f.fieldType === "date" ? todayLocal() : undefined}
            dir={isNationalIdField(f.keyName) ? "ltr" : undefined}
            onChange={(e) => {
              const v = isNationalIdField(f.keyName) ? e.target.value.replace(/\D/g, "").slice(0, 14) : e.target.value;
              set(v);
            }}
          />
        )}
      </Field>
    );
  }

  /* ---------- render ---------- */

  if (status !== "authenticated" || !user) {
    return <p className="py-24 text-center text-ink-muted">{t.account.checking}</p>;
  }

  if (stage === "done") {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-turquoise text-navy">
          <CheckIcon size={32} />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="mt-8 text-4xl font-semibold tracking-[-0.02em] outline-none rtl:leading-snug">
          {t.success.title}
        </h2>
        <p className="mt-8 text-sm text-ink-muted">{t.success.ref}</p>
        <p dir="ltr" className="tabular mt-1 text-3xl font-semibold">
          {reference}
        </p>
        <p className="mx-auto mt-6 max-w-[48ch] leading-relaxed text-ink-muted">{t.success.text}</p>
        <button type="button" onClick={reset} className={buttonClass("outline", "mt-10")}>
          {t.success.again}
        </button>
      </div>
    );
  }

  const current = STEPS[step];
  const working = stage !== "idle";
  const numberedSteps = STEPS;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_21rem] lg:gap-16">
      <div ref={formRef} className="min-w-0 scroll-mt-28">
        {/* Selected service */}
        {service && (
          <div className="mb-10 flex items-center justify-between gap-4 rounded-card border border-navy/15 bg-bg-light p-5 sm:p-6">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-muted">{t.selected}</p>
              <p className="mt-1 text-xl font-semibold leading-snug tracking-[-0.01em] sm:text-2xl">
                {serviceName(service, locale)}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <p className="text-sm text-ink-muted">
                  {fmt(t.details.processing, { t: processingTime(service, locale) })}
                </p>
                {!locked && (
                  <Link
                    href={`/${locale}/request`}
                    className="text-sm font-medium text-turquoise underline decoration-turquoise/40 underline-offset-4 hover:decoration-turquoise"
                  >
                    {t.change}
                  </Link>
                )}
              </div>
            </div>
            <p className="tabular shrink-0 text-xl font-semibold sm:text-2xl">{money(service.servicePrice, locale)}</p>
          </div>
        )}

        {service?.isBlocked && (
          <p role="alert" className="-mt-6 mb-10 rounded-card border border-error/40 px-5 py-4 text-sm leading-relaxed text-error">
            {t.rules.blockedNote}
          </p>
        )}

        {/* Stepper */}
        <ol className="mb-10 flex items-center gap-2" aria-label={t.title}>
          {numberedSteps.map((k) => {
            const idx = STEPS.indexOf(k);
            const done = idx < step;
            const active = idx === step;
            return (
              <li key={k} className="flex flex-1 flex-col gap-2" aria-current={active ? "step" : undefined}>
                <span className={`h-1 rounded-full ${done || active ? "bg-turquoise" : "bg-line"}`} />
                <span className={`hidden text-sm sm:block ${active ? "font-semibold" : "text-ink-muted"}`}>
                  {t.steps[k]}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mb-6 text-sm text-ink-muted sm:hidden">
          {fmt(t.stepWord, {
            n: digits(String(numberedSteps.indexOf(current) + 1), locale),
            total: digits(String(numberedSteps.length), locale),
          })}
          {": "}
          {t.steps[current]}
        </p>

        <p className="mb-8 text-sm text-ink-muted">
          {fmt(t.account.signedInAs, { name: `${user.firstName} ${user.lastName}`.trim() })}
        </p>

        {/* DETAILS */}
        {current === "details" && service && (
          <div className="flex flex-col gap-7">
            <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold outline-none">
              {t.steps.details}
            </h2>

            {canOrderMyself(service) && canOrderOther(service) && <fieldset>
              <legend className="mb-2 text-sm font-medium">{t.details.requestFor}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["myself", "another_person"] as const).map((v) => (
                  <label
                    key={v}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-btn border px-4 transition-colors duration-150 ${
                      requestFor === v ? "border-navy bg-bg-light" : "border-line hover:border-navy/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="requestFor"
                      checked={requestFor === v}
                      onChange={() => {
                        setRequestFor(v);
                        // Clear relationship value since options differ between myself/another
                        setValues((prev) => {
                          const next = { ...prev };
                          for (const f of service?.fields ?? []) {
                            if (isRelationshipField(f.keyName)) delete next[f.keyName];
                          }
                          return next;
                        });
                        // Keep files whose document key still exists for the new requestFor value
                        const nextDocs = (service?.requiredDocuments ?? [])
                          .filter((d) => v === "another_person" || !d.showForAnotherPerson)
                          .map((d) => d.keyName);
                        const nextKeys = new Set(nextDocs);
                        setFiles((prev) => {
                          const kept: Record<string, File> = {};
                          for (const [k, f] of Object.entries(prev)) {
                            if (nextKeys.has(k)) kept[k] = f;
                          }
                          return kept;
                        });
                        setFileErrors({});
                      }}
                      className="size-4 accent-navy"
                    />
                    {v === "myself" ? t.details.myself : t.details.another}
                  </label>
                ))}
              </div>
            </fieldset>}

            {relationshipField && (
              <div className="flex flex-col gap-2">
                {renderField(relationshipField)}
                {requestFor === "another_person" && <p className="text-sm text-ink-muted">{t.rules.kinshipHint}</p>}
              </div>
            )}

            {openResidence && (
              <fieldset className="flex flex-col gap-5 border-t border-line pt-7">
                <legend className="mb-1 text-lg font-semibold">{t.rules.currentResidenceTitle}</legend>
                <p className="-mt-2 text-sm text-ink-muted">{t.rules.currentResidenceSub}</p>
                <Field id="r-country" label={t.rules.residenceCountry} error={errors.residenceCountry} required>
                  <Select
                    id="r-country"
                    value={residence.country}
                    placeholder={t.rules.chooseCountry}
                    options={allCountries.map((c) => ({ value: c.code, label: c.name }))}
                    onChange={(v) => setResidence({ country: v, city: "" })}
                    aria-invalid={!!errors.residenceCountry}
                    aria-describedby={describedBy("r-country", !!errors.residenceCountry, false)}
                  />
                </Field>
              </fieldset>
            )}

            {residenceRule && !openResidence && (
              <fieldset className="flex flex-col gap-5 border-t border-line pt-7">
                <legend className="mb-1 text-lg font-semibold">{t.rules.residenceTitle}</legend>
                <p className="-mt-2 text-sm text-ink-muted">{t.rules.residenceSub}</p>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="r-country" label={t.rules.residenceCountry} error={errors.residenceCountry} required>
                    <Select
                      id="r-country"
                      value={residence.country}
                      placeholder={t.rules.chooseCountry}
                      options={residenceRule.map((r) => ({ value: r.code, label: countryName(r.code, r.code, locale) }))}
                      onChange={(v) => setResidence({ country: v, city: "" })}
                      aria-invalid={!!errors.residenceCountry}
                      aria-describedby={describedBy("r-country", !!errors.residenceCountry, false)}
                    />
                  </Field>
                  <Field id="r-city" label={t.rules.residenceCity} error={errors.residenceCity} required>
                    {residenceEntry?.cities ? (
                      <Select
                        id="r-city"
                        value={residence.city}
                        placeholder={t.rules.chooseCity}
                        options={residenceEntry.cities.map((c) => ({ value: c.en, label: locale === "ar" ? c.ar : c.en }))}
                        onChange={(v) => setResidence((r) => ({ ...r, city: v }))}
                        aria-invalid={!!errors.residenceCity}
                        aria-describedby={describedBy("r-city", !!errors.residenceCity, false)}
                      />
                    ) : (
                      <input
                        id="r-city"
                        value={residence.city}
                        disabled={!residenceEntry}
                        onChange={(e) => setResidence((r) => ({ ...r, city: e.target.value }))}
                        aria-invalid={!!errors.residenceCity}
                        aria-describedby={describedBy("r-city", !!errors.residenceCity, false)}
                        className={inputClass}
                      />
                    )}
                  </Field>
                </div>
              </fieldset>
            )}

            {service?.maxCopies !== 1 && (
              <Field id="d-copies" label={t.details.copies} error={errors.copies} required>
                <div className="flex items-center gap-0 max-w-36">
                  <button
                    type="button"
                    aria-label="Decrease"
                    disabled={copies <= 1}
                    onClick={() => setCopies(Math.max(1, copies - 1))}
                    className="flex items-center justify-center h-12 w-12 rounded-s-btn border border-line bg-bg-light text-navy text-lg font-bold select-none hover:bg-line disabled:opacity-30 disabled:cursor-not-allowed"
                  >−</button>
                  <input
                    id="d-copies"
                    type="text"
                    inputMode="numeric"
                    readOnly
                    value={copies}
                    aria-invalid={!!errors.copies}
                    aria-describedby={describedBy("d-copies", !!errors.copies, false)}
                    className="h-12 w-14 border-y border-line bg-white text-center text-base font-semibold text-navy focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Increase"
                    disabled={copies >= 19}
                    onClick={() => setCopies(Math.min(19, copies + 1))}
                    className="flex items-center justify-center h-12 w-12 rounded-e-btn border border-line bg-bg-light text-navy text-lg font-bold select-none hover:bg-line disabled:opacity-30 disabled:cursor-not-allowed"
                  >+</button>
                </div>
              </Field>
            )}

            {/* Extras — hidden for services that don't support them */}
            {serviceType !== "passport" && <fieldset className="flex flex-col gap-4 border-t border-line pt-7">
              <legend className="mb-1 text-lg font-semibold">{t.details.extras}</legend>
              <label className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-btn border px-4 transition-colors duration-150 ${extraAuth ? "border-navy bg-bg-light" : "border-line hover:border-navy/40"}`}>
                <span className="flex items-center gap-3">
                  <input type="checkbox" checked={extraAuth} onChange={(e) => setExtraAuth(e.target.checked)} className="size-4 accent-navy" />
                  {t.details.authentication}
                </span>
                <span dir="ltr" className="text-sm font-semibold text-navy">{extras.authPrice.toLocaleString("en-EG")} {locale === "ar" ? "ج.م" : "EGP"}</span>
              </label>
              <label className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-btn border px-4 transition-colors duration-150 ${extraTranslation ? "border-navy bg-bg-light" : "border-line hover:border-navy/40"}`}>
                <span className="flex items-center gap-3">
                  <input type="checkbox" checked={extraTranslation} onChange={(e) => { setExtraTranslation(e.target.checked); if (!e.target.checked) { setTranslationLang(""); setFiles((prev) => { const n = { ...prev }; delete n[TRANSLATION_PASSPORT_DOC.keyName]; delete n[TRANSLATION_PASSPORT_HUSBAND_DOC.keyName]; delete n[TRANSLATION_PASSPORT_WIFE_DOC.keyName]; return n; }); } }} className="size-4 accent-navy" />
                  {t.details.translation}
                </span>
                <span dir="ltr" className="text-sm font-semibold text-navy">{extras.translationPrice.toLocaleString("en-EG")} {locale === "ar" ? "ج.م" : "EGP"}</span>
              </label>
              {extraTranslation && (
                <Field id="d-lang" label={t.details.selectLanguage} error={errors.translationLang} required>
                  <Select
                    id="d-lang"
                    value={translationLang}
                    placeholder={t.details.selectLanguage}
                    options={extras.languages.map((l) => ({ value: l.value, label: l.label }))}
                    onChange={setTranslationLang}
                    searchable
                    aria-invalid={!!errors.translationLang}
                    aria-describedby={describedBy("d-lang", !!errors.translationLang, false)}
                  />
                </Field>
              )}
            </fieldset>}

            {otherFields.length > 0 && (
              <fieldset className="flex flex-col gap-6 border-t border-line pt-7">
                <legend className="mb-1 text-lg font-semibold">{t.details.holder}</legend>
                {otherFields.map((f) => renderField(f))}
              </fieldset>
            )}
          </div>
        )}

        {/* DOCUMENTS */}
        {current === "documents" && (
          <div className="flex flex-col gap-7">
            <div>
              <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold outline-none">
                {t.documents.title}
              </h2>
              <p className="mt-3 max-w-[52ch] text-ink-muted">{t.documents.sub}</p>
            </div>

            {effectiveDocs.length === 0 && <p className="text-ink-muted">{t.documents.none}</p>}

            {effectiveDocs.map((d) => {
              const id = `doc-${d.keyName}`;
              const err = errors[`d_${d.keyName}`] ?? fileErrors[`d_${d.keyName}`];
              const limit = d.maxSizeMb ?? 10;
              const multi = isMultiUploadDoc(d.keyName, d);
              const multiList = multiFiles[d.keyName] ?? [];
              const singleFile = files[d.keyName];
              return (
                <div key={d.id} className="rounded-card border border-line p-5">
                  <p className="font-medium">
                    {pick(d.labelEn, d.labelAr)}
                    {d.isRequired && (
                      <span aria-hidden="true" className="ms-1 text-error">*</span>
                    )}
                  </p>
                  {(d.hintEn || d.hintAr) && (
                    <p className="mt-1 text-sm text-ink-muted">{pick(d.hintEn ?? "", d.hintAr ?? "")}</p>
                  )}
                  <p className="mt-1 text-sm text-ink-muted">
                    {fmt(t.documents.allowed, { n: digits(String(limit), locale) })}
                  </p>

                  {multi ? (
                    <>
                      {multiList.length > 0 && (
                        <ul className="mt-3 flex flex-col gap-2">
                          {multiList.map((f, i) => (
                            <li key={i} className="flex flex-wrap items-center gap-3 text-sm" dir="ltr">
                              <span className="min-w-0 max-w-[28ch] truncate">{f.name}</span>
                              <button
                                type="button"
                                onClick={() => window.open(URL.createObjectURL(f), "_blank")}
                                className="font-medium text-turquoise underline underline-offset-4"
                              >{t.review.preview}</button>
                              <button
                                type="button"
                                onClick={() => removeMultiFile(d.keyName, i)}
                                className="font-medium text-navy underline underline-offset-4"
                              >{t.documents.remove}</button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-4">
                        <input
                          id={id}
                          type="file"
                          accept={d.allowedTypes?.join(",") ?? "image/jpeg,image/png,application/pdf"}
                          aria-invalid={!!err}
                          aria-describedby={err ? `${id}-err` : undefined}
                          onChange={(e) => {
                            onAddMultiFile(d.keyName, d.maxSizeMb, d.allowedTypes, e.target.files?.[0]);
                            e.target.value = "";
                          }}
                          className="sr-only"
                        />
                        <label htmlFor={id} className={buttonClass("outline", "min-h-11 cursor-pointer text-sm")}>
                          <UploadIcon size={18} />
                          {multiList.length > 0 ? t.documents.choose : t.documents.choose}
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <input
                        id={id}
                        type="file"
                        accept={d.allowedTypes?.join(",") ?? "image/jpeg,image/png,application/pdf"}
                        aria-invalid={!!err}
                        aria-describedby={err ? `${id}-err` : undefined}
                        onChange={(e) => {
                          onPickFile(d.keyName, d.maxSizeMb, d.allowedTypes, e.target.files?.[0]);
                          e.target.value = "";
                        }}
                        className="sr-only"
                      />
                      <label htmlFor={id} className={buttonClass("outline", "min-h-11 cursor-pointer text-sm")}>
                        <UploadIcon size={18} />
                        {singleFile ? t.documents.replace : t.documents.choose}
                      </label>
                      {singleFile && (
                        <>
                          <span className="min-w-0 max-w-full truncate text-sm" dir="ltr">{singleFile.name}</span>
                          <button
                            type="button"
                            onClick={() => window.open(URL.createObjectURL(singleFile), "_blank")}
                            className="text-sm font-medium text-turquoise underline underline-offset-4"
                          >{t.review.preview}</button>
                          <button
                            type="button"
                            onClick={() => removeFile(d.keyName)}
                            className="text-sm font-medium text-navy underline underline-offset-4"
                          >{t.documents.remove}</button>
                        </>
                      )}
                    </div>
                  )}

                  {err && (
                    <p id={`${id}-err`} role="alert" className="mt-3 text-sm text-error">{err}</p>
                  )}
                </div>
              );
            })}

            {service && t.rules.docNotices[service.type] && (
              <p className="rounded-card border border-warning/50 bg-warning/5 px-5 py-4 text-sm leading-relaxed text-ink">
                {t.rules.docNotices[service.type]}
              </p>
            )}
          </div>
        )}

        {/* DELIVERY */}
        {current === "delivery" && (
          <div className="flex flex-col gap-6">
            <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold outline-none">
              {t.delivery.title}
            </h2>

            {allowedDestinations.length === 0 && (
              <p role="alert" className="rounded-btn border border-error/40 px-4 py-3 text-sm text-error">{t.rules.noDestinations}</p>
            )}
            <Field id="v-country" label={t.delivery.destination} error={errors.deliveryCountry} required>
              <Select
                id="v-country"
                value={deliveryCountry}
                placeholder={t.delivery.select}
                options={[...new Map(allowedDestinations.map((d) => [d.countryCode.toUpperCase(), d])).entries()].map(([code, d]) => ({
                  value: code,
                  label: countryName(code, d.country, locale),
                }))}
                onChange={handleDeliveryCountry}
                aria-invalid={!!errors.deliveryCountry}
                aria-describedby={describedBy("v-country", !!errors.deliveryCountry, false)}
              />
            </Field>
            {deliveryCountry === "EG" && (
              <Field id="v-zone" label={t.delivery.zone} error={errors.destinationId} required>
                <Select
                  id="v-zone"
                  value={delivery.destinationId}
                  placeholder={t.delivery.selectZone}
                  options={allowedDestinations
                    .filter((d) => d.countryCode.toUpperCase() === "EG")
                    .map((d) => ({
                      value: d.id,
                      label: `${(locale === "ar" ? d.zoneNameAr : d.zoneNameEn) || ""} — ${money(d.deliveryFee, locale)}`,
                    }))}
                  onChange={setDestination}
                  aria-invalid={!!errors.destinationId}
                  aria-describedby={describedBy("v-zone", !!errors.destinationId, false)}
                />
              </Field>
            )}

            <div className="flex min-w-0 flex-col gap-6">
              <Field id="v-name" label={t.delivery.recipient} error={errors.recipientName} required>
                <input
                  id="v-name"
                  autoComplete="name"
                  value={delivery.recipientName}
                  onChange={(e) => setDelivery({ ...delivery, recipientName: e.target.value })}
                  aria-invalid={!!errors.recipientName}
                  aria-describedby={describedBy("v-name", !!errors.recipientName, false)}
                  className={inputClass}
                />
              </Field>
              <Field id="v-phone" label={t.delivery.recipientPhone} error={errors.recipientPhone} required>
                <PhoneField
                  id="v-phone"
                  locale={locale}
                  countryLabel={phoneCountryLabel}
                  searchPlaceholder={searchCountryLabel}
                  country={recipientPhoneCountry}
                  onCountryChange={setRecipientPhoneCountry}
                  value={delivery.recipientPhone}
                  onChange={(v) => setDelivery({ ...delivery, recipientPhone: v })}
                  invalid={!!errors.recipientPhone}
                  describedBy={describedBy("v-phone", !!errors.recipientPhone, false)}
                />
              </Field>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="v-gov" label={t.delivery.governorate} error={errors.governorate} required>
                {destination && getRegionsForZone(destination.countryCode, destination.zoneNameEn, destination.governorates).length > 0 ? (
                  <Select
                    id="v-gov"
                    value={delivery.governorate}
                    placeholder={t.delivery.selectGovernorate}
                    options={(restrictByRegion ? allowedRegions : getRegionsForZone(destination.countryCode, destination.zoneNameEn, destination.governorates)).map((r) => ({
                      value: r.en,
                      label: locale === "ar" ? r.ar : r.en,
                    }))}
                    onChange={setGovernorate}
                    aria-invalid={!!errors.governorate}
                    aria-describedby={describedBy("v-gov", !!errors.governorate, false)}
                  />
                ) : (
                  <input
                    id="v-gov"
                    autoComplete="address-level1"
                    value={delivery.governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    aria-invalid={!!errors.governorate}
                    aria-describedby={describedBy("v-gov", !!errors.governorate, false)}
                    placeholder={t.delivery.selectGovernorate}
                    className={inputClass}
                  />
                )}
              </Field>
              <Field id="v-city" label={t.delivery.city} error={errors.city} required>
                {restrictByCity && deliveryCities ? (
                  <>
                    <Select
                      id="v-city"
                      value={delivery.city}
                      placeholder={t.delivery.selectCity}
                      options={deliveryCities.map((c) => ({ value: c.en, label: locale === "ar" ? c.ar : c.en }))}
                      onChange={(v) => setDelivery((d) => ({ ...d, city: v }))}
                      aria-invalid={!!errors.city}
                      aria-describedby={describedBy("v-city", !!errors.city, false)}
                    />
                    <p className="mt-2 text-sm text-ink-muted">{t.rules.deliveryCityRestricted}</p>
                  </>
                ) : destination && delivery.governorate && getCities(destination.countryCode, delivery.governorate).length > 0 ? (
                  <>
                    <Select
                      id="v-city"
                      value={delivery.city === "__other__" ? "__other__" : delivery.city}
                      placeholder={t.delivery.selectCity}
                      options={[
                        ...getCities(destination.countryCode, delivery.governorate).map((c) => ({
                          value: c.en,
                          label: locale === "ar" ? c.ar : c.en,
                        })),
                        { value: "__other__", label: t.delivery.otherCity },
                      ]}
                      onChange={(v) => {
                        if (v === "__other__") {
                          setDelivery((d) => ({ ...d, city: "__other__" }));
                          setCustomCity("");
                        } else {
                          setDelivery((d) => ({ ...d, city: v }));
                          setCustomCity("");
                        }
                      }}
                      aria-invalid={!!errors.city}
                      aria-describedby={describedBy("v-city", !!errors.city, false)}
                    />
                    {delivery.city === "__other__" && (
                      <input
                        id="v-city-custom"
                        autoComplete="address-level2"
                        value={customCity}
                        placeholder={t.delivery.cityName}
                        onChange={(e) => setCustomCity(e.target.value)}
                        aria-invalid={!!errors.city}
                        className={`${inputClass} mt-2`}
                      />
                    )}
                  </>
                ) : (
                  <input
                    id="v-city"
                    autoComplete="address-level2"
                    value={delivery.city}
                    onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                    aria-invalid={!!errors.city}
                    aria-describedby={describedBy("v-city", !!errors.city, false)}
                    className={inputClass}
                  />
                )}
              </Field>
            </div>

            <Field id="v-address" label={t.delivery.address} hint={t.delivery.addressHint} error={errors.address} required>
              <input
                id="v-address"
                autoComplete="street-address"
                value={delivery.address}
                onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                aria-invalid={!!errors.address}
                aria-describedby={describedBy("v-address", !!errors.address, false)}
                className={inputClass}
              />
            </Field>

          </div>
        )}

        {/* REVIEW */}
        {current === "review" && service && (
          <div className="flex flex-col gap-8">
            <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-semibold outline-none">
              {t.review.title}
            </h2>

            <dl className="divide-y divide-line rounded-card border border-line">
              {visibleFields
                .filter((f) => values[f.keyName]?.trim())
                .map((f) => {
                  const raw = values[f.keyName];
                  const shown =
                    f.fieldType === "select"
                      ? (isOtherOption(raw) && otherText[f.keyName]?.trim()
                          ? otherText[f.keyName].trim()
                          : pick(
                              f.options?.find((o) => o.value === raw)?.labelEn ?? raw,
                              f.options?.find((o) => o.value === raw)?.labelAr ?? raw,
                            ))
                      : raw;
                  return (
                    <div key={f.id} className="flex flex-wrap justify-between gap-x-6 gap-y-1 px-5 py-3">
                      <dt className="text-sm text-ink-muted">{pick(f.labelEn, f.labelAr)}</dt>
                      <dd className="font-medium">{shown}</dd>
                    </div>
                  );
                })}
              {(extraAuth || extraTranslation) && (
                <div className="border-t border-line px-5 py-3">
                  <dt className="text-sm text-ink-muted">{t.details.extras}</dt>
                  <dd className="mt-1 flex flex-col gap-1 font-medium">
                    {extraAuth && <span>{t.details.authentication}</span>}
                    {extraTranslation && translationLang && (
                      <span>{t.details.translation}: {extras.languages.find((l) => l.value === translationLang)?.label}</span>
                    )}
                  </dd>
                </div>
              )}
              {effectiveDocs.flatMap((d) => {
                if (isMultiUploadDoc(d.keyName)) {
                  const list = multiFiles[d.keyName] ?? [];
                  if (!list.length) return [];
                  return list.map((f, i) => (
                    <div key={`${d.id}-${i}`} className="flex flex-wrap justify-between gap-x-6 gap-y-1 px-5 py-3">
                      <dt className="text-sm text-ink-muted">{pick(d.labelEn, d.labelAr)}{list.length > 1 ? ` (${i + 1})` : ""}</dt>
                      <dd dir="ltr" className="flex items-center gap-2 font-medium">
                        <span className="truncate max-w-[20ch]">{f.name}</span>
                        <button type="button" onClick={() => window.open(URL.createObjectURL(f), "_blank")} className="shrink-0 text-xs font-semibold text-turquoise underline underline-offset-2">{t.review.preview}</button>
                      </dd>
                    </div>
                  ));
                }
                if (!files[d.keyName]) return [];
                return [(
                  <div key={d.id} className="flex flex-wrap justify-between gap-x-6 gap-y-1 px-5 py-3">
                    <dt className="text-sm text-ink-muted">{pick(d.labelEn, d.labelAr)}</dt>
                    <dd dir="ltr" className="flex items-center gap-2 font-medium">
                      <span className="truncate max-w-[20ch]">{files[d.keyName].name}</span>
                      <button type="button" onClick={() => window.open(URL.createObjectURL(files[d.keyName]), "_blank")} className="shrink-0 text-xs font-semibold text-turquoise underline underline-offset-2">{t.review.preview}</button>
                    </dd>
                  </div>
                )];
              })}
            </dl>

            {/* Delivery summary */}
            <div className="rounded-card border border-line">
              <p className="px-5 py-3 text-sm font-semibold">{t.delivery.title.replace(/\?$/, "")}</p>
              <dl className="divide-y divide-line border-t border-line">
                {[
                  { label: t.delivery.recipient, value: delivery.recipientName },
                  { label: t.delivery.recipientPhone, value: delivery.recipientPhone, dir: "ltr" },
                  { label: t.delivery.destination, value: destination ? countryName(destination.countryCode, destination.country, locale) : "" },
                  ...(destination && destination.countryCode.toUpperCase() === "EG" ? [{ label: t.delivery.zone, value: (locale === "ar" ? destination.zoneNameAr : destination.zoneNameEn) || "" }] : []),
                  { label: t.delivery.governorate, value: delivery.governorate },
                  { label: t.delivery.city, value: delivery.city === "__other__" ? customCity : delivery.city },
                  { label: t.delivery.address, value: delivery.address },
                ].filter((r) => r.value?.trim()).map((r) => (
                  <div key={r.label} className="flex flex-wrap justify-between gap-x-6 gap-y-1 px-5 py-3">
                    <dt className="text-sm text-ink-muted">{r.label.replace(/ \(.*\)$/, "")}</dt>
                    <dd dir={r.dir} className="font-medium">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {isCriminalAbroad(service) && (
              <section aria-labelledby="fp-title" className="rounded-card border border-line bg-bg-light px-5 py-4">
                <h3 id="fp-title" className="font-semibold">{t.review.fingerprintTitle}</h3>
                <p className="mt-2 text-sm leading-relaxed">{t.review.fingerprintText}</p>
                <p className="mt-3 text-sm">
                  <span className="font-medium">{t.review.fingerprintAddress}: </span>
                  {t.review.fingerprintAddressValue}
                </p>
                <p className="mt-3 text-sm text-ink-muted">{t.review.fingerprintNote}</p>
              </section>
            )}


            {paymentNotice && (
              <div className="rounded-card border border-warning/50 bg-warning/5 px-5 py-4 text-sm leading-relaxed text-ink">
                {paymentNotice}
              </div>
            )}

            {hasPaymentNotice && (
              <div>
                <label className="flex cursor-pointer items-start gap-3 rounded-card border border-line bg-bg-light px-5 py-4">
                  <input
                    type="checkbox"
                    checked={ackNotice}
                    onChange={(e) => {
                      setAckNotice(e.target.checked);
                      setErrors({});
                    }}
                    aria-invalid={!!errors.ackNotice}
                    aria-describedby={errors.ackNotice ? "ack-err" : undefined}
                    className="mt-1 size-5 shrink-0 accent-navy"
                  />
                  <span className="font-medium leading-relaxed">{t.review.ackNotice}</span>
                </label>
                {errors.ackNotice && (
                  <p id="ack-err" role="alert" className="mt-2 text-sm text-error">
                    {errors.ackNotice}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => {
                    setAgree(e.target.checked);
                    setErrors({});
                  }}
                  aria-invalid={!!errors.agree}
                  aria-describedby={errors.agree ? "agree-err" : undefined}
                  className="mt-1 size-5 shrink-0 accent-navy"
                />
                <span className="leading-relaxed">
                  {renderAgree(t.review.agree, locale, legal)}
                </span>
              </label>
              {errors.agree && (
                <p id="agree-err" role="alert" className="mt-2 text-sm text-error">
                  {errors.agree}
                </p>
              )}
            </div>

            {submitError && (
              <p role="alert" className="rounded-btn border border-error/40 px-4 py-3 text-sm text-error">
                {submitError}
              </p>
            )}

            <div aria-live="polite" className="text-sm text-ink-muted">
              {stage === "creating" && t.progress.creating}
              {stage === "uploading" &&
                fmt(t.progress.uploading, {
                  i: digits(String(progress.i), locale),
                  n: digits(String(progress.n), locale),
                })}
              {stage === "paying" && t.progress.paying}
              {stage === "redirecting" && t.progress.redirecting}
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
          {step > (locked ? STEPS.indexOf("documents") : 0) && !(returnedFromPay && current === "review") && (
            <button type="button" onClick={goBack} disabled={working} className={buttonClass("outline")}>
              <BackIcon size={18} />
              {t.back}
            </button>
          )}
          {current === "review" && returnedFromPay ? (
            <div className="flex w-full flex-col gap-3">
              <p className="text-sm text-ink-muted">{t.review.lockedNote}</p>
              <button type="button" onClick={placeOrder} disabled={working || !!service?.isBlocked} className={buttonClass("primary", "w-full sm:w-auto sm:self-start")}>
                {working ? "…" : fmt(t.review.proceedPay, { amount: money(total, locale) })}
              </button>
              <div className="flex flex-wrap gap-3">
                <Link href={`/${locale}`} className={buttonClass("outline")}>
                  {t.review.home}
                </Link>
                <Link href={`/${locale}/contact`} className={buttonClass("outline")}>
                  {t.review.editOrder}
                </Link>
              </div>
            </div>
          ) : current === "review" ? (
            <button type="button" onClick={placeOrder} disabled={working || !!service?.isBlocked} className={buttonClass("primary", "grow sm:grow-0")}>
              {working ? "…" : fmt(t.review.place, { amount: money(total, locale) })}
            </button>
          ) : (
            <button type="button" onClick={goNext} disabled={!!service?.isBlocked} className={buttonClass("primary", "grow sm:grow-0")}>
              {t.next}
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      {service && (
        <aside aria-label={t.review.total} className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-card border border-line bg-bg-light p-6">
            <p className="font-semibold">{serviceName(service, locale)}</p>
            <dl className="mt-5 flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">
                  {t.review.serviceFee} × {digits(String(copies), locale)}
                </dt>
                <dd className="tabular font-medium">{money(serviceFee, locale)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">{t.review.deliveryFee}</dt>
                <dd className="tabular font-medium">{destination ? money(deliveryFee, locale) : "-"}</dd>
              </div>
              {extraAuth && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">{t.details.authentication}</dt>
                  <dd className="tabular font-medium">{money(authFee, locale)}</dd>
                </div>
              )}
              {extraTranslation && translationLang && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-muted">{t.details.translation} ({extras.languages.find((l) => l.value === translationLang)?.label})</dt>
                  <dd className="tabular font-medium">{money(translationFee, locale)}</dd>
                </div>
              )}
              <div className="mt-2 flex justify-between gap-4 border-t border-line pt-4 text-base">
                <dt className="font-semibold">{t.review.total}</dt>
                <dd className="tabular text-xl font-semibold">{money(total, locale)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      )}
    </div>
  );

  function renderAgree(template: string, loc: Locale, l: { terms: string; refund: string; privacy: string }) {
    const parts = template.split(/(\{terms\}|\{refund\}|\{privacy\})/);
    return parts.map((p, i) => {
      const map: Record<string, { href: string; label: string }> = {
        "{terms}": { href: `/${loc}/terms`, label: l.terms },
        "{refund}": { href: `/${loc}/refund-policy`, label: l.refund },
        "{privacy}": { href: `/${loc}/privacy-policy`, label: l.privacy },
      };
      const hit = map[p];
      return hit ? (
        <Link
          key={i}
          href={hit.href}
          target="_blank"
          className="font-medium text-navy underline decoration-turquoise decoration-2 underline-offset-4"
        >
          {hit.label}
        </Link>
      ) : (
        <span key={i}>{p}</span>
      );
    });
  }
}

class UploadError extends Error {
  constructor(public cause: unknown) {
    super("upload");
  }
}

class PayError extends Error {
  constructor(public cause: unknown) {
    super("pay");
  }
}
