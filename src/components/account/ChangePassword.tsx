"use client";

import Link from "next/link";
import { useState } from "react";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { buttonClass } from "@/components/Button";
import { Field, describedBy } from "@/components/forms";
import { CheckIcon, ChevronRightIcon } from "@/components/Icons";
import type { Dict } from "@/dictionaries/en";
import { account, ApiError } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n";
import { AccountGate } from "./AccountGate";

export function ChangePassword({ locale, t }: { locale: Locale; t: Dict }) {
  return (
    <AccountGate locale={locale} t={t}>
      {() => <Inner locale={locale} t={t} />}
    </AccountGate>
  );
}

function Inner({ locale, t }: { locale: Locale; t: Dict }) {
  const a = t.account;
  const p = a.password;
  const show = t.auth.show;
  const hide = t.auth.hide;
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const checks = [f.next.length >= 8, /[A-Z]/.test(f.next), /\d/.test(f.next), /[^A-Za-z0-9]/.test(f.next)];
  const strong = checks.every(Boolean);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found: Record<string, string> = {};
    if (!f.current) found.current = p.required;
    if (!f.next) found.next = p.required;
    else if (!strong) found.next = p.notMet;
    else if (f.next === f.current) found.next = p.differ;
    if (f.confirm !== f.next) found.confirm = p.mismatch;
    setErrors(found);
    setNotice(null);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      await account.changePassword(f.current, f.next);
      setF({ current: "", next: "", confirm: "" });
      setNotice({ kind: "ok", text: p.success });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) setErrors({ current: p.wrongCurrent });
      else setNotice({ kind: "err", text: t.auth.errors.generic });
    }
    setBusy(false);
  }

  return (
    <div className="bg-bg-light pb-20">
      <div className="bg-navy text-white">
        <div className="mx-auto max-w-2xl px-5 pb-12 pt-8">
          <Link href={`/${locale}/account`} className="inline-flex min-h-10 items-center gap-1 text-sm text-white/75 hover:text-white">
            <ChevronRightIcon size={16} className="rotate-180" />
            {a.back}
          </Link>
          <h1 className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] rtl:leading-[1.35]">{p.title}</h1>
        </div>
      </div>

      <div className="mx-auto -mt-6 max-w-2xl px-5">
        <form onSubmit={submit} noValidate className="flex flex-col gap-6 rounded-card border border-line bg-white p-6 sm:p-8">
          <p className="rounded-btn bg-turquoise/10 px-4 py-3 text-sm text-navy">{p.notice}</p>

          <Field id="cp-current" label={p.current} error={errors.current}>
            <PasswordInput id="cp-current" value={f.current} onChange={set("current")} autoComplete="current-password" invalid={!!errors.current} describedBy={describedBy("cp-current", !!errors.current, false)} showLabel={show} hideLabel={hide} />
          </Field>
          <Field id="cp-new" label={p.newPw} error={errors.next}>
            <PasswordInput id="cp-new" value={f.next} onChange={set("next")} autoComplete="new-password" invalid={!!errors.next} describedBy={describedBy("cp-new", !!errors.next, false)} showLabel={show} hideLabel={hide} />
          </Field>

          <ul className="-mt-2 flex flex-col gap-2 text-sm" aria-label={p.newPw}>
            {p.rules.map((r, i) => (
              <li key={r} className={`flex items-center gap-2 ${checks[i] ? "text-navy" : "text-ink-muted"}`}>
                <span className={`flex size-5 items-center justify-center rounded-full ${checks[i] ? "bg-turquoise text-navy" : "border border-line"}`}>
                  {checks[i] && <CheckIcon size={12} />}
                </span>
                {r}
              </li>
            ))}
          </ul>

          <Field id="cp-confirm" label={p.confirm} error={errors.confirm}>
            <PasswordInput id="cp-confirm" value={f.confirm} onChange={set("confirm")} autoComplete="new-password" invalid={!!errors.confirm} describedBy={describedBy("cp-confirm", !!errors.confirm, false)} showLabel={show} hideLabel={hide} />
          </Field>

          {notice && (
            <p role="status" className={`rounded-btn border px-4 py-3 text-sm ${notice.kind === "ok" ? "border-turquoise/50 text-navy" : "border-error/40 text-error"}`}>
              {notice.text}
            </p>
          )}

          <button type="submit" disabled={busy} className={buttonClass("primary", "w-full")}>
            {busy ? "…" : p.title}
          </button>
        </form>
      </div>
    </div>
  );
}
