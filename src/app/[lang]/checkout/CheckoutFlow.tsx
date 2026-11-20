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
  toE164,
  type CountryCode,
} from "@/lib/phone";
import { useSession } from "@/components/SessionProvider";
import { useProfile } from "@/components/account/useAccount";
import type { DeliveryDestination, ExtrasConfig, GovService } from "@/lib/types";
import { canOrderMyself, canOrderOther, serviceNotices } from "@/lib/service-rules";
import { clearCheckoutDraft, holdFiles, loadDraft, saveDraft, takeFiles } from "@/lib/checkout-draft";
import { getRegions, getCities } from "@/lib/governorates";
import { splitPhone } from "@/lib/phone";

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

  // review
  const [method, setMethod] = useState<"card" | "wallet">("card");
  const [agree, setAgree] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState({ i: 0, n: 0 });
  const [submitError, setSubmitError] = useState("");
  const created = useRef<{ id: string; ref: string } | null>(null);
  const uploaded = useRef(new Set<string>());
  const paid = useRef(false);
  const payStarted = useRef(false);
  const [locked, setLocked] = useState(false);
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
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [service, requestFor],
  );

  // Where this service may be used / delivered (admin console)
  const residenceRule = service?.residenceRule?.length ? service.residenceRule : null;
  const residenceEntry = residenceRule?.find((r) => r.code === residence.country);
  const deliveryRule = service?.deliveryRule?.length ? service.deliveryRule : null;
  const allowedDestinations = deliveryRule
    ? destinations.filter((d) => deliveryRule.some((r) => r.code.toUpperCase() === d.countryCode.toUpperCase()))
    : destinations;
  const deliveryCities = deliveryRule && destination
    ? (deliveryRule.find((r) => r.code.toUpperCase() === destination.countryCode.toUpperCase())?.cities ?? null)
    : null;
  const notices = service ? serviceNotices(service, locale, t.rules) : [];
  // A country with a governorate list (Egypt) is restricted by governorate; any other by city.
  const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  const allowedRegions =
    deliveryCities && destination
      ? getRegions(destination.countryCode).filter((r) => deliveryCities.some((c) => sameName(c.en, r.en) || sameName(c.ar, r.ar)))
      : [];
  const restrictByRegion = allowedRegions.length > 0;
  const restrictByCity = !!deliveryCities && !restrictByRegion;

  // Load full profile for auto-fill (phone, delivery)
  const { profile } = useProfile(status === "authenticated");
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const profilePhone = profile ? splitPhone(profile.phone, DEFAULT_PHONE_COUNTRY) : null;

  // Auto-fill delivery recipient from profile
  useEffect(() => {
    if (requestFor !== "myself") return;
    setDelivery((d) => {
      const updates: Partial<typeof d> = {};
      if (!d.recipientName && fullName) updates.recipientName = fullName;
      if (!d.recipientPhone && profilePhone) updates.recipientPhone = profilePhone.national;
      return Object.keys(updates).length ? { ...d, ...updates } : d;
    });
    if (profilePhone) {
      setRecipientPhoneCountry((prev) => prev === DEFAULT_PHONE_COUNTRY ? profilePhone.country : prev);
    }
  }, [requestFor, fullName, profilePhone?.national, profilePhone?.country]);

  const serviceFee = (service?.servicePrice ?? 0) * copies;
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
      if (residenceRule) {
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
      for (const d of visibleDocs) {
        // a document already sent for the order (resumed checkout) does not need picking again
        if (d.isRequired && !files[d.keyName] && !uploaded.current.has(d.keyName)) next[`d_${d.keyName}`] = t.errors.required;
      }
      if (Object.keys(fileErrors).length) Object.assign(next, fileErrors);
    }
    if (key === "delivery") {
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
          ...(residenceRule && residenceEntry
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
        created.current = { id: res.id, ref: res.referenceNumber };
        setLocked(true);
      }

      const pending = visibleDocs.filter((d) => files[d.keyName] && !uploaded.current.has(d.keyName));
      for (let i = 0; i < pending.length; i++) {
        setStage("uploading");
        setProgress({ i: i + 1, n: pending.length });
        try {
          await orders.upload(created.current.id, pending[i].keyName, files[pending[i].keyName]);
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) throw err;
          throw new UploadError(err);
        }
        uploaded.current.add(pending[i].keyName);
      }

      if (!paid.current) {
        setStage("paying");
        try {
          const payment = await orders.pay(created.current.id, method, locale);
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

      setReference(created.current.ref);
      setStage("done");
    } catch (err) {
      setStage("idle");
      if (err instanceof ApiError && err.status === 401) {
        router.replace(signInUrl);
        return;
      }
      if (err instanceof UploadError) setSubmitError(`${t.errors.uploadFailed} ${detail(err.cause)}`.trim());
      else if (err instanceof PayError) setSubmitError(`${t.errors.payFailed} ${detail(err.cause)}`.trim());
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
    setResidence(d.residence);
    setMethod(d.method);
    setFiles(takeFiles(`${userId}:${d.serviceType}`));
    if (d.created) {
      created.current = d.created;
      uploaded.current = new Set(d.uploaded);
      paid.current = d.paid;
      payStarted.current = !!d.payStarted;
      setLocked(true);
      // Came back (browser Back) from the payment page: show the same order awaiting payment.
      if (d.payStarted && !d.paid) {
        router.replace(`/${locale}/checkout/result?ref=${encodeURIComponent(d.created.ref)}&rid=${d.created.id}&outcome=back`);
      }
    }
    setStep(Math.min(Math.max(d.step, d.created ? STEPS.indexOf("documents") : 0), STEPS.length - 1));
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, userId]);

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
      residence,
      method,
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

        {service && (notices.length > 0 || service.isBlocked) && (
          <ul
            role={service.isBlocked ? "alert" : undefined}
            className={`-mt-6 mb-10 flex flex-col gap-2 rounded-card border px-5 py-4 text-sm leading-relaxed ${
              service.isBlocked ? "border-error/40 text-error" : "border-line bg-bg-light text-navy"
            }`}
          >
            {notices.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
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

            {residenceRule && (
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
                  <input type="checkbox" checked={extraTranslation} onChange={(e) => { setExtraTranslation(e.target.checked); if (!e.target.checked) setTranslationLang(""); }} className="size-4 accent-navy" />
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

            {visibleDocs.length === 0 && <p className="text-ink-muted">{t.documents.none}</p>}

            {visibleDocs.map((d) => {
              const id = `doc-${d.keyName}`;
              const err = errors[`d_${d.keyName}`] ?? fileErrors[`d_${d.keyName}`];
              const file = files[d.keyName];
              const limit = d.maxSizeMb ?? 10;
              const effectiveRequired = d.isRequired;
              return (
                <div key={d.id} className="rounded-card border border-line p-5">
                  <p className="font-medium">
                    {pick(d.labelEn, d.labelAr)}
                    {effectiveRequired && (
                      <span aria-hidden="true" className="ms-1 text-error">
                        *
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {fmt(t.documents.allowed, { n: digits(String(limit), locale) })}
                  </p>

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
                      {file ? t.documents.replace : t.documents.choose}
                    </label>
                    {file && (
                      <>
                        <span className="min-w-0 max-w-full truncate text-sm" dir="ltr">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => window.open(URL.createObjectURL(file), "_blank")}
                          className="text-sm font-medium text-turquoise underline underline-offset-4"
                        >
                          {t.review.preview}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFile(d.keyName)}
                          className="text-sm font-medium text-navy underline underline-offset-4"
                        >
                          {t.documents.remove}
                        </button>
                      </>
                    )}
                  </div>
                  {err && (
                    <p id={`${id}-err`} role="alert" className="mt-3 text-sm text-error">
                      {err}
                    </p>
                  )}
                </div>
              );
            })}
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
            <Field id="v-dest" label={t.delivery.destination} error={errors.destinationId} required>
              <Select
                id="v-dest"
                value={delivery.destinationId}
                placeholder={t.delivery.select}
                options={allowedDestinations.map((d) => ({
                  value: d.id,
                  label: `${(locale === "ar" ? d.zoneNameAr : d.zoneNameEn) || countryName(d.countryCode, d.country, locale)}, ${money(d.deliveryFee, locale)}`,
                }))}
                onChange={setDestination}
                aria-invalid={!!errors.destinationId}
                aria-describedby={describedBy("v-dest", !!errors.destinationId, false)}
              />
            </Field>

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
                {destination && getRegions(destination.countryCode).length > 0 ? (
                  <Select
                    id="v-gov"
                    value={delivery.governorate}
                    placeholder={t.delivery.selectGovernorate}
                    options={(restrictByRegion ? allowedRegions : getRegions(destination.countryCode)).map((r) => ({
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

            <Field id="v-address" label={t.delivery.address} error={errors.address} required>
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
              {visibleDocs.filter((d) => files[d.keyName]).map((d) => (
                <div key={d.id} className="flex flex-wrap justify-between gap-x-6 gap-y-1 px-5 py-3">
                  <dt className="text-sm text-ink-muted">{pick(d.labelEn, d.labelAr)}</dt>
                  <dd dir="ltr" className="flex items-center gap-2 font-medium">
                    <span className="truncate max-w-[20ch]">{files[d.keyName].name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const url = URL.createObjectURL(files[d.keyName]);
                        window.open(url, "_blank");
                      }}
                      className="shrink-0 text-xs font-semibold text-turquoise underline underline-offset-2"
                    >
                      {t.review.preview}
                    </button>
                  </dd>
                </div>
              ))}
            </dl>

            {/* Delivery summary */}
            <div className="rounded-card border border-line">
              <p className="px-5 py-3 text-sm font-semibold">{t.delivery.title.replace(/\?$/, "")}</p>
              <dl className="divide-y divide-line border-t border-line">
                {[
                  { label: t.delivery.recipient, value: delivery.recipientName },
                  { label: t.delivery.recipientPhone, value: delivery.recipientPhone, dir: "ltr" },
                  { label: t.delivery.destination, value: destination ? ((locale === "ar" ? destination.zoneNameAr : destination.zoneNameEn) || countryName(destination.countryCode, destination.country, locale)) : "" },
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

            {service.type === "criminal_record_abroad" && (
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

            <fieldset>
              <legend className="mb-2 text-sm font-medium">{t.review.method}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["card", "wallet"] as const).map((m) => (
                  <label
                    key={m}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-btn border px-4 transition-colors duration-150 ${
                      method === m ? "border-navy bg-bg-light" : "border-line hover:border-navy/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      checked={method === m}
                      onChange={() => setMethod(m)}
                      className="size-4 accent-navy"
                    />
                    {m === "card" ? t.review.card : t.review.wallet}
                  </label>
                ))}
              </div>
              <p className="mt-3 text-sm text-ink-muted">{t.review.paymentNote}</p>
            </fieldset>

            {(() => {
              const notice = locale === "ar" ? service?.paymentNoticeAr : service?.paymentNoticeEn;
              return notice ? (
                <div className="rounded-card border border-warning/50 bg-warning/5 px-5 py-4 text-sm leading-relaxed text-ink">
                  {notice}
                </div>
              ) : null;
            })()}

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
          {step > (locked ? STEPS.indexOf("documents") : 0) && (
            <button type="button" onClick={goBack} disabled={working} className={buttonClass("outline")}>
              <BackIcon size={18} />
              {t.back}
            </button>
          )}
          {current === "review" ? (
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
