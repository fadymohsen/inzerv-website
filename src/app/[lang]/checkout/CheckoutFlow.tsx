"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { buttonClass } from "@/components/Button";
import { Field, describedBy, inputClass } from "@/components/forms";
import { Select } from "@/components/Select";
import { BackIcon, CheckIcon, UploadIcon } from "@/components/Icons";
import type { Dict } from "@/dictionaries/en";
import { ApiError, orders } from "@/lib/api-client";
import { fmt, money } from "@/lib/dictionaries";
import { countryName, digits, processingTime, serviceName } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { useSession } from "@/components/SessionProvider";
import type { DeliveryDestination, GovService } from "@/lib/types";
import { getRegions } from "@/lib/governorates";

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

const STEPS = ["details", "documents", "delivery", "review"] as const;
type StepKey = (typeof STEPS)[number];
type Errors = Record<string, string>;
type Stage = "idle" | "creating" | "uploading" | "paying" | "done";

export function CheckoutFlow({
  locale,
  t,
  legal,
  services,
  destinations,
}: {
  locale: Locale;
  t: Dict["checkout"];
  legal: { terms: string; refund: string; privacy: string };
  services: GovService[];
  destinations: DeliveryDestination[];
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
  const [requestFor, setRequestFor] = useState<"myself" | "another_person">("myself");
  const [copies, setCopies] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({});

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
    postal: "",
  });

  // review
  const [method, setMethod] = useState<"card" | "wallet">("card");
  const [agree, setAgree] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState({ i: 0, n: 0 });
  const [submitError, setSubmitError] = useState("");
  const created = useRef<{ id: string; ref: string } | null>(null);
  const uploaded = useRef(new Set<string>());
  const paid = useRef(false);
  const [locked, setLocked] = useState(false);
  const [reference, setReference] = useState("");

  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const service = services.find((s) => s.type === serviceType);
  const destination = destinations.find((d) => d.id === delivery.destinationId);

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
        .filter((f) => requestFor === "another_person" || !f.showForAnotherPerson)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [service, requestFor],
  );
  const visibleDocs = useMemo(
    () =>
      (service?.requiredDocuments ?? [])
        .filter((d) => requestFor === "another_person" || !d.showForAnotherPerson)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [service, requestFor],
  );

  const serviceFee = (service?.servicePrice ?? 0) * copies;
  const deliveryFee = destination?.deliveryFee ?? 0;
  const total = serviceFee + deliveryFee;

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
      if (!Number.isInteger(copies) || copies < 1 || copies > 10) next.copies = t.errors.required;
      for (const f of visibleFields) {
        const val = values[f.keyName]?.trim() ?? "";
        if (f.isRequired && !val) next[`f_${f.keyName}`] = t.errors.required;
        else if (isNationalIdField(f.keyName) && val && !isValidNationalId(val))
          next[`f_${f.keyName}`] = t.errors.nationalId;
        else if (isNameField(f.keyName) && val && val.split(/\s+/).filter(Boolean).length < 4)
          next[`f_${f.keyName}`] = t.errors.fullName;
        else if (f.fieldType === "date" && val) {
          const d = new Date(val + "T00:00:00");
          const today = new Date(); today.setHours(0, 0, 0, 0);
          if (d >= today) next[`f_${f.keyName}`] = t.errors.futureDate;
        }
      }
    }
    if (key === "documents") {
      for (const d of visibleDocs) {
        if (d.isRequired && !files[d.keyName]) next[`d_${d.keyName}`] = t.errors.required;
      }
      if (Object.keys(fileErrors).length) Object.assign(next, fileErrors);
    }
    if (key === "delivery") {
      if (!delivery.destinationId) next.destinationId = t.errors.select;
      const nameParts = delivery.recipientName.trim().split(/\s+/).filter(Boolean);
      if (!delivery.recipientName.trim()) next.recipientName = t.errors.required;
      else if (nameParts.length < 4) next.recipientName = t.errors.fullName;
      const phone = delivery.recipientPhone.trim();
      if (!phone) next.recipientPhone = t.errors.required;
      else if (!/^\+?\d[\d\s-]{6,}$/.test(phone)) next.recipientPhone = t.errors.phone;
      if (!delivery.city.trim()) next.city = t.errors.required;
      if (!delivery.governorate.trim()) next.governorate = t.errors.select;
      if (!delivery.address.trim()) next.address = t.errors.required;
      if (delivery.postal.trim() && !/^\d+$/.test(delivery.postal.trim())) next.postal = t.errors.postal;
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
          fieldValues: visibleFields
            .filter((f) => values[f.keyName]?.trim())
            .map((f) => ({ fieldKey: f.keyName, value: values[f.keyName].trim() })),
          numberOfCopies: copies,
          deliveryDestinationId: delivery.destinationId,
          recipientName: delivery.recipientName.trim(),
          recipientPhone: delivery.recipientPhone.trim(),
          deliveryCity: delivery.city.trim(),
          deliveryAddress: delivery.address.trim(),
          deliveryGovernorate: delivery.governorate.trim() || undefined,
          deliveryPostalCode: delivery.postal.trim() || undefined,
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
          await orders.pay(created.current.id, method);
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
    created.current = null;
    uploaded.current = new Set();
    paid.current = false;
    setLocked(false);
    setFiles({});
    setValues({});
    setAgree(false);
    setReference("");
    setSubmitError("");
    setStage("idle");
    setStep(0);
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
              <p className="mt-1 text-sm text-ink-muted">
                {fmt(t.details.processing, { t: processingTime(service, locale) })}
              </p>
            </div>
            <p className="tabular shrink-0 text-xl font-semibold sm:text-2xl">{money(service.servicePrice, locale)}</p>
          </div>
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

            <Field id="d-service" label={t.details.service} error={errors.service} required>
              <Select
                id="d-service"
                value={serviceType}
                options={services.map((s) => ({
                  value: s.type,
                  label: `${serviceName(s, locale)}, ${money(s.servicePrice, locale)}`,
                }))}
                onChange={(v) => {
                  setServiceType(v);
                  setValues({});
                  setFiles({});
                  setFileErrors({});
                }}
                aria-invalid={!!errors.service}
                aria-describedby={describedBy("d-service", !!errors.service, false)}
              />
              <p className="mt-2 text-sm text-ink-muted">
                {fmt(t.details.processing, { t: processingTime(service, locale) })}
              </p>
            </Field>

            <fieldset>
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
                        setFiles({});
                        setFileErrors({});
                      }}
                      className="size-4 accent-navy"
                    />
                    {v === "myself" ? t.details.myself : t.details.another}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field id="d-copies" label={t.details.copies} error={errors.copies} required>
              <input
                id="d-copies"
                type="number"
                min={1}
                max={10}
                inputMode="numeric"
                value={copies}
                onChange={(e) => setCopies(Math.floor(Number(e.target.value)))}
                aria-invalid={!!errors.copies}
                aria-describedby={describedBy("d-copies", !!errors.copies, false)}
                className={`${inputClass} max-w-32`}
              />
            </Field>

            {visibleFields.length > 0 && (
              <fieldset className="flex flex-col gap-6 border-t border-line pt-7">
                <legend className="mb-1 text-lg font-semibold">{t.details.holder}</legend>
                {visibleFields.map((f) => {
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
                  return (
                    <Field key={f.id} id={id} label={pick(f.labelEn, f.labelAr)} error={err} required={f.isRequired}>
                      {f.fieldType === "select" ? (
                        <Select
                          id={id}
                          value={values[f.keyName] ?? ""}
                          placeholder={t.details.choose}
                          options={(f.options ?? []).map((o) => ({
                            value: o.value,
                            label: pick(o.labelEn, o.labelAr),
                          }))}
                          onChange={set}
                          aria-invalid={!!err}
                          aria-describedby={describedBy(id, !!err, false)}
                        />
                      ) : (
                        <input
                          {...common}
                          type={f.fieldType === "date" ? "date" : f.fieldType === "number" ? "number" : "text"}
                          inputMode={f.fieldType === "number" || isNationalIdField(f.keyName) ? "numeric" : undefined}
                          maxLength={isNationalIdField(f.keyName) ? 14 : undefined}
                          max={f.fieldType === "date" ? (() => { const y = new Date(); y.setDate(y.getDate() - 1); return y.toISOString().slice(0, 10); })() : undefined}
                          dir={isNationalIdField(f.keyName) ? "ltr" : undefined}
                          onChange={(e) => {
                            const v = isNationalIdField(f.keyName) ? e.target.value.replace(/\D/g, "").slice(0, 14) : e.target.value;
                            set(v);
                          }}
                        />
                      )}
                    </Field>
                  );
                })}
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
              return (
                <div key={d.id} className="rounded-card border border-line p-5">
                  <p className="font-medium">
                    {pick(d.labelEn, d.labelAr)}
                    {d.isRequired && (
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

            <Field id="v-dest" label={t.delivery.destination} error={errors.destinationId} required>
              <Select
                id="v-dest"
                value={delivery.destinationId}
                placeholder={t.delivery.select}
                options={destinations.map((d) => ({
                  value: d.id,
                  label: `${countryName(d.countryCode, d.country, locale)}, ${money(d.deliveryFee, locale)}`,
                }))}
                onChange={(v) => setDelivery({ ...delivery, destinationId: v, governorate: "" })}
                aria-invalid={!!errors.destinationId}
                aria-describedby={describedBy("v-dest", !!errors.destinationId, false)}
              />
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
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
                <input
                  id="v-phone"
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  autoComplete="tel"
                  value={delivery.recipientPhone}
                  onChange={(e) => setDelivery({ ...delivery, recipientPhone: e.target.value.replace(/[^\d+\s-]/g, "") })}
                  aria-invalid={!!errors.recipientPhone}
                  aria-describedby={describedBy("v-phone", !!errors.recipientPhone, false)}
                  className={`${inputClass} text-start`}
                />
              </Field>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="v-city" label={t.delivery.city} error={errors.city} required>
                <input
                  id="v-city"
                  autoComplete="address-level2"
                  value={delivery.city}
                  onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                  aria-invalid={!!errors.city}
                  aria-describedby={describedBy("v-city", !!errors.city, false)}
                  className={inputClass}
                />
              </Field>
              <Field id="v-gov" label={t.delivery.governorate} error={errors.governorate} required>
                {destination && getRegions(destination.countryCode).length > 0 ? (
                  <Select
                    id="v-gov"
                    value={delivery.governorate}
                    placeholder={t.delivery.selectGovernorate}
                    options={getRegions(destination.countryCode).map((r) => ({
                      value: r.en,
                      label: locale === "ar" ? r.ar : r.en,
                    }))}
                    onChange={(v) => setDelivery({ ...delivery, governorate: v })}
                    aria-invalid={!!errors.governorate}
                    aria-describedby={describedBy("v-gov", !!errors.governorate, false)}
                  />
                ) : (
                  <input
                    id="v-gov"
                    autoComplete="address-level1"
                    value={delivery.governorate}
                    onChange={(e) => setDelivery({ ...delivery, governorate: e.target.value })}
                    aria-invalid={!!errors.governorate}
                    aria-describedby={describedBy("v-gov", !!errors.governorate, false)}
                    placeholder={t.delivery.selectGovernorate}
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

            <Field id="v-postal" label={t.delivery.postal} error={errors.postal}>
              <input
                id="v-postal"
                autoComplete="postal-code"
                dir="ltr"
                value={delivery.postal}
                inputMode="numeric"
                onChange={(e) => setDelivery({ ...delivery, postal: e.target.value.replace(/\D/g, "") })}
                aria-invalid={!!errors.postal}
                aria-describedby={describedBy("v-postal", !!errors.postal, false)}
                className={`${inputClass} max-w-48 text-start`}
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
                      ? pick(
                          f.options?.find((o) => o.value === raw)?.labelEn ?? raw,
                          f.options?.find((o) => o.value === raw)?.labelAr ?? raw,
                        )
                      : raw;
                  return (
                    <div key={f.id} className="flex flex-wrap justify-between gap-x-6 gap-y-1 px-5 py-3">
                      <dt className="text-sm text-ink-muted">{pick(f.labelEn, f.labelAr)}</dt>
                      <dd className="font-medium">{shown}</dd>
                    </div>
                  );
                })}
              {Object.keys(files).length > 0 && (
                <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 px-5 py-3">
                  <dt className="text-sm text-ink-muted">{t.review.files}</dt>
                  <dd dir="ltr" className="font-medium">
                    {Object.values(files)
                      .map((f) => f.name)
                      .join(", ")}
                  </dd>
                </div>
              )}
              <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 px-5 py-3">
                <dt className="text-sm text-ink-muted">{t.delivery.recipient}</dt>
                <dd className="font-medium">
                  {delivery.recipientName}, {delivery.city}
                  {destination ? `, ${countryName(destination.countryCode, destination.country, locale)}` : ""}
                </dd>
              </div>
            </dl>

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
            <button type="button" onClick={placeOrder} disabled={working} className={buttonClass("primary", "grow sm:grow-0")}>
              {working ? "…" : fmt(t.review.place, { amount: money(total, locale) })}
            </button>
          ) : (
            <button type="button" onClick={goNext} className={buttonClass("primary", "grow sm:grow-0")}>
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
