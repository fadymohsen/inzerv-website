"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { buttonClass } from "@/components/Button";
import { Field, describedBy } from "@/components/forms";
import type { Dict } from "@/dictionaries/en";
import { ApiError, auth } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n";
import { PasswordInput } from "./PasswordInput";

// Same rule the backend enforces
const passwordRe = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_-]).{8,100}$/;

/** The "create your password" page behind the link in the welcome email. */
export function SetPasswordForm({ locale, t }: { locale: Locale; t: Dict["auth"] }) {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const found: Record<string, string> = {};
    if (!passwordRe.test(password)) found.password = t.errors.resetPassword;
    if (confirm !== password) found.confirm = t.errors.match;
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await auth.setPassword(token, password);
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) setError(t.setPassword.badLink);
      else if (err instanceof ApiError && (err.status === 0 || err.status === 503)) setError(t.errors.network);
      else if (err instanceof ApiError && err.status === 429) setError(t.errors.tooMany);
      else setError(t.errors.generic);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">{t.setPassword.doneTitle}</h2>
        <p className="text-ink-muted">{t.setPassword.doneText}</p>
        <Link href={`/${locale}/signin`} className={buttonClass("primary", "w-full")}>
          {t.forgot.back}
        </Link>
      </div>
    );
  }

  if (token.length < 32) {
    return (
      <div className="flex flex-col gap-6">
        <p role="alert" className="rounded-btn border border-error/40 px-4 py-3 text-sm text-error">{t.setPassword.noToken}</p>
        <Link href={`/${locale}/forgot-password`} className={buttonClass("outline", "w-full")}>
          {t.forgot.title}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <Field id="sp-pw" label={t.forgot.newPassword} error={errors.password} hint={t.forgot.hint} required>
        <PasswordInput
          id="sp-pw"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          invalid={!!errors.password}
          describedBy={describedBy("sp-pw", !!errors.password, true)}
          showLabel={t.show}
          hideLabel={t.hide}
        />
      </Field>
      <Field id="sp-confirm" label={t.signup.confirm} error={errors.confirm} required>
        <PasswordInput
          id="sp-confirm"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          invalid={!!errors.confirm}
          describedBy={describedBy("sp-confirm", !!errors.confirm, false)}
          showLabel={t.show}
          hideLabel={t.hide}
        />
      </Field>
      {error && (
        <p role="alert" className="rounded-btn border border-error/40 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className={buttonClass("primary", "w-full")}>
        {busy ? "…" : t.setPassword.button}
      </button>
    </form>
  );
}
