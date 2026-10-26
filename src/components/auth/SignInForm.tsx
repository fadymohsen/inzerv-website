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

export function SignInForm({ locale, t }: { locale: Locale; t: Dict["auth"] }) {
  const router = useRouter();
  const search = useSearchParams();
  const { status, setUser } = useSession();
  const nextParam = search.get("next");
  const next = safeNext(nextParam, locale, `/${locale}/request`);
  const nextQuery = nextParam ? `?next=${encodeURIComponent(next)}` : "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, router, next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!emailRe.test(email.trim())) found.email = t.errors.email;
    if (!password) found.password = t.errors.required;
    setErrors(found);
    setError("");
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const { user } = await auth.login(email.trim().toLowerCase(), password);
      setUser(user);
      router.replace(next);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 0 || err.status === 503
            ? t.errors.network
            : err.status === 401
              ? t.errors.invalid
              : err.status === 429
                ? t.errors.tooMany
                : t.errors.generic,
        );
      } else setError(t.errors.generic);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Field id="si-email" label={t.email} error={errors.email} required>
        <input
          id="si-email"
          type="email"
          inputMode="email"
          dir="ltr"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={describedBy("si-email", !!errors.email, false)}
          className={`${inputClass} text-start`}
        />
      </Field>

      <Field id="si-password" label={t.password} error={errors.password} required>
        <PasswordInput
          id="si-password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          invalid={!!errors.password}
          describedBy={describedBy("si-password", !!errors.password, false)}
          showLabel={t.show}
          hideLabel={t.hide}
        />
      </Field>

      <div className="-mt-2">
        <Link
          href={`/${locale}/forgot-password${nextQuery}`}
          className="text-sm font-medium text-navy underline decoration-turquoise decoration-2 underline-offset-4"
        >
          {t.signin.forgot}
        </Link>
      </div>

      {error && (
        <p role="alert" className="rounded-btn border border-error/40 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className={buttonClass("primary", "w-full")}>
        {busy ? "…" : t.signin.submit}
      </button>

      <div className="mt-2 rounded-card border-2 border-turquoise/50 bg-turquoise/10 p-6 text-center">
        <p className="text-lg font-semibold">{t.signin.newTitle}</p>
        <p className="mx-auto mt-1 max-w-[36ch] text-ink-muted">{t.signin.newText}</p>
        <Link href={`/${locale}/signup${nextQuery}`} className={buttonClass("navy", "mt-5 min-h-14 w-full text-lg")}>
          {t.signin.create}
        </Link>
      </div>
    </form>
  );
}
