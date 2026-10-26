"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/Button";
import { Field, describedBy, inputClass } from "@/components/forms";
import { useSession } from "@/components/SessionProvider";
import type { Dict } from "@/dictionaries/en";
import { ApiError, auth } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n";
import { safeNext } from "@/lib/safe-next";
import { PasswordInput } from "./PasswordInput";

const emailRe = /^\S+@\S+\.\S+$/;
const passwordRe = /^(?=.*[A-Z])(?=.*\d).{8,128}$/;

export function SignUpForm({
  locale,
  t,
  legal,
}: {
  locale: Locale;
  t: Dict["auth"];
  legal: { terms: string; privacy: string };
}) {
  const router = useRouter();
  const search = useSearchParams();
  const { status, setUser } = useSession();
  const nextParam = search.get("next");
  const next = safeNext(nextParam, locale, `/${locale}/request`);
  const nextQuery = nextParam ? `?next=${encodeURIComponent(next)}` : "";

  const [f, setF] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    confirm: "",
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, router, next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!f.firstName.trim()) found.firstName = t.errors.required;
    if (!f.lastName.trim()) found.lastName = t.errors.required;
    if (!emailRe.test(f.email.trim())) found.email = t.errors.email;
    if (!f.phone.trim()) found.phone = t.errors.required;
    if (!passwordRe.test(f.password)) found.password = t.errors.password;
    if (f.confirm !== f.password) found.confirm = t.errors.match;
    if (!consent) found.consent = t.errors.consent;
    setErrors(found);
    setError("");
    if (Object.keys(found).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }

    setBusy(true);
    try {
      const { user } = await auth.register({
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        email: f.email.trim().toLowerCase(),
        password: f.password,
        phone: f.phone.trim(),
        countryOfResidence: f.country.trim() || undefined,
      });
      setUser(user);
      router.replace(next);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 0 || err.status === 503
            ? t.errors.network
            : err.status === 409
              ? /phone/i.test(err.message)
                ? t.errors.phoneExists
                : t.errors.emailExists
              : err.status === 429
                ? t.errors.tooMany
                : err.status === 400
                  ? err.message
                  : t.errors.generic,
        );
      } else setError(t.errors.generic);
      setBusy(false);
    }
  }

  const terms = (
    <Link key="terms" href={`/${locale}/terms`} target="_blank" className="font-medium text-navy underline decoration-turquoise decoration-2 underline-offset-4">
      {legal.terms}
    </Link>
  );
  const privacy = (
    <Link key="privacy" href={`/${locale}/privacy-policy`} target="_blank" className="font-medium text-navy underline decoration-turquoise decoration-2 underline-offset-4">
      {legal.privacy}
    </Link>
  );
  const consentParts = t.signup.consent.split(/(\{terms\}|\{privacy\})/).map((p, i) =>
    p === "{terms}" ? terms : p === "{privacy}" ? privacy : <span key={i}>{p}</span>,
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="su-first" label={t.signup.firstName} error={errors.firstName} required>
          <input
            id="su-first"
            autoComplete="given-name"
            value={f.firstName}
            onChange={(e) => set("firstName")(e.target.value)}
            aria-invalid={!!errors.firstName}
            aria-describedby={describedBy("su-first", !!errors.firstName, false)}
            className={inputClass}
          />
        </Field>
        <Field id="su-last" label={t.signup.lastName} error={errors.lastName} required>
          <input
            id="su-last"
            autoComplete="family-name"
            value={f.lastName}
            onChange={(e) => set("lastName")(e.target.value)}
            aria-invalid={!!errors.lastName}
            aria-describedby={describedBy("su-last", !!errors.lastName, false)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field id="su-email" label={t.email} error={errors.email} required>
        <input
          id="su-email"
          type="email"
          inputMode="email"
          dir="ltr"
          autoComplete="email"
          value={f.email}
          onChange={(e) => set("email")(e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={describedBy("su-email", !!errors.email, false)}
          className={`${inputClass} text-start`}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="su-phone" label={t.signup.phone} error={errors.phone} required>
          <input
            id="su-phone"
            type="tel"
            inputMode="tel"
            dir="ltr"
            autoComplete="tel"
            value={f.phone}
            onChange={(e) => set("phone")(e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("su-phone", !!errors.phone, false)}
            className={`${inputClass} text-start`}
          />
        </Field>
        <Field id="su-country" label={t.signup.country}>
          <input
            id="su-country"
            autoComplete="country-name"
            value={f.country}
            onChange={(e) => set("country")(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field id="su-password" label={t.password} error={errors.password} hint={t.signup.hint} required>
        <PasswordInput
          id="su-password"
          value={f.password}
          onChange={set("password")}
          autoComplete="new-password"
          invalid={!!errors.password}
          describedBy={describedBy("su-password", !!errors.password, true)}
          showLabel={t.show}
          hideLabel={t.hide}
        />
      </Field>

      <Field id="su-confirm" label={t.signup.confirm} error={errors.confirm} required>
        <PasswordInput
          id="su-confirm"
          value={f.confirm}
          onChange={set("confirm")}
          autoComplete="new-password"
          invalid={!!errors.confirm}
          describedBy={describedBy("su-confirm", !!errors.confirm, false)}
          showLabel={t.show}
          hideLabel={t.hide}
        />
      </Field>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? "su-consent-err" : undefined}
            className="mt-1 size-5 shrink-0 accent-navy"
          />
          <span className="leading-relaxed">{consentParts}</span>
        </label>
        {errors.consent && (
          <p id="su-consent-err" role="alert" className="mt-2 text-sm text-error">
            {errors.consent}
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-btn border border-error/40 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className={buttonClass("primary", "w-full")}>
        {busy ? "…" : t.signup.submit}
      </button>

      <p className="text-center text-sm text-ink-muted">
        {t.signup.haveAccount}{" "}
        <Link
          href={`/${locale}/signin${nextQuery}`}
          className="font-medium text-navy underline decoration-turquoise decoration-2 underline-offset-4"
        >
          {t.signup.signIn}
        </Link>
      </p>
    </form>
  );
}
