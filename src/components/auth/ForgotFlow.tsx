"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { buttonClass } from "@/components/Button";
import { Field, describedBy, inputClass } from "@/components/forms";
import type { Dict } from "@/dictionaries/en";
import { ApiError, auth } from "@/lib/api-client";
import { fmt } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { safeNext } from "@/lib/safe-next";
import { PasswordInput } from "./PasswordInput";

type Step = "email" | "code" | "password" | "done";

const emailRe = /^\S+@\S+\.\S+$/;
// Same rule the backend enforces on reset
const resetRe = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_-]).{8,100}$/;

export function ForgotFlow({ locale, t }: { locale: Locale; t: Dict["auth"] }) {
  const search = useSearchParams();
  const nextParam = search.get("next");
  const nextQuery = nextParam ? `?next=${encodeURIComponent(safeNext(nextParam, locale, `/${locale}/request`))}` : "";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  function mapError(err: unknown, fallback?: string) {
    if (err instanceof ApiError) {
      if (err.status === 0 || err.status === 503) return t.errors.network;
      if (err.status === 429) return t.errors.tooMany;
      if (fallback) return fallback;
    }
    return t.errors.generic;
  }

  async function sendCode(e?: React.FormEvent, resend = false) {
    e?.preventDefault();
    setError("");
    setNote("");
    if (!emailRe.test(email.trim())) {
      setErrors({ email: t.errors.email });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await auth.forgotPassword(email.trim().toLowerCase());
      if (resend) setNote(t.forgot.resent);
      else setStep("code");
    } catch (err) {
      setError(mapError(err));
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNote("");
    if (!/^\d{6}$/.test(code.trim())) {
      setErrors({ code: t.errors.code });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await auth.verifyOtp(email.trim().toLowerCase(), code.trim());
      setResetToken(res.resetToken);
      setStep("password");
    } catch (err) {
      setError(mapError(err, t.errors.codeWrong));
    } finally {
      setBusy(false);
    }
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const found: Record<string, string> = {};
    if (!resetRe.test(password)) found.password = t.errors.resetPassword;
    if (confirm !== password) found.confirm = t.errors.match;
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await auth.resetPassword(resetToken, password);
      setStep("done");
    } catch (err) {
      setError(err instanceof ApiError && err.status === 400 ? err.message : mapError(err));
    } finally {
      setBusy(false);
    }
  }

  const alertBox = error && (
    <p role="alert" className="rounded-btn border border-error/40 px-4 py-3 text-sm text-error">
      {error}
    </p>
  );
  const noteBox = note && (
    <p role="status" className="rounded-btn border border-success/40 px-4 py-3 text-sm text-success">
      {note}
    </p>
  );

  if (step === "done") {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">{t.forgot.doneTitle}</h2>
        <p className="text-ink-muted">{t.forgot.doneText}</p>
        <Link href={`/${locale}/signin${nextQuery}`} className={buttonClass("primary", "w-full")}>
          {t.forgot.back}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {step === "email" && (
        <form onSubmit={(e) => sendCode(e)} noValidate className="flex flex-col gap-6">
          <p className="text-ink-muted">{t.forgot.sendSub}</p>
          <Field id="fg-email" label={t.email} error={errors.email} required>
            <input
              id="fg-email"
              type="email"
              inputMode="email"
              dir="ltr"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={describedBy("fg-email", !!errors.email, false)}
              className={`${inputClass} text-start`}
            />
          </Field>
          {alertBox}
          <button type="submit" disabled={busy} className={buttonClass("primary", "w-full")}>
            {busy ? "…" : t.forgot.send}
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={verify} noValidate className="flex flex-col gap-6">
          <p className="text-ink-muted">{fmt(t.forgot.codeSub, { email: email.trim() })}</p>
          <Field id="fg-code" label={t.forgot.code} error={errors.code} required>
            <input
              id="fg-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              dir="ltr"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              aria-invalid={!!errors.code}
              aria-describedby={describedBy("fg-code", !!errors.code, false)}
              className={`${inputClass} text-start text-2xl tracking-[0.4em]`}
            />
          </Field>
          {alertBox}
          {noteBox}
          <button type="submit" disabled={busy} className={buttonClass("primary", "w-full")}>
            {busy ? "…" : t.forgot.verify}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => sendCode(undefined, true)}
            className="text-sm font-medium text-navy underline decoration-turquoise decoration-2 underline-offset-4"
          >
            {t.forgot.resend}
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={reset} noValidate className="flex flex-col gap-6">
          <p className="text-ink-muted">{t.forgot.newSub}</p>
          <Field id="fg-pw" label={t.forgot.newPassword} error={errors.password} hint={t.forgot.hint} required>
            <PasswordInput
              id="fg-pw"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              invalid={!!errors.password}
              describedBy={describedBy("fg-pw", !!errors.password, true)}
              showLabel={t.show}
              hideLabel={t.hide}
            />
          </Field>
          <Field id="fg-confirm" label={t.signup.confirm} error={errors.confirm} required>
            <PasswordInput
              id="fg-confirm"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
              invalid={!!errors.confirm}
              describedBy={describedBy("fg-confirm", !!errors.confirm, false)}
              showLabel={t.show}
              hideLabel={t.hide}
            />
          </Field>
          {alertBox}
          <button type="submit" disabled={busy} className={buttonClass("primary", "w-full")}>
            {busy ? "…" : t.forgot.reset}
          </button>
        </form>
      )}

      <p className="text-center text-sm">
        <Link
          href={`/${locale}/signin${nextQuery}`}
          className="inline-flex min-h-11 items-center font-medium text-navy underline decoration-turquoise decoration-2 underline-offset-4"
        >
          {t.forgot.back}
        </Link>
      </p>
    </div>
  );
}
