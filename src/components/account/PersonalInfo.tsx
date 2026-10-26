"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { buttonClass } from "@/components/Button";
import { Field, describedBy, inputClass } from "@/components/forms";
import { ChevronRightIcon } from "@/components/Icons";
import { Modal } from "@/components/Modal";
import { useSession } from "@/components/SessionProvider";
import type { Dict } from "@/dictionaries/en";
import { account, ApiError, type Profile } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n";
import { AccountGate } from "./AccountGate";
import { Avatar } from "./Avatar";
import { useProfile } from "./useAccount";

export function PersonalInfo({ locale, t }: { locale: Locale; t: Dict }) {
  return (
    <AccountGate locale={locale} t={t}>
      {() => <Inner locale={locale} t={t} />}
    </AccountGate>
  );
}

type Form = { firstName: string; lastName: string; phone: string; countryOfResidence: string };
const toForm = (p: Profile): Form => ({
  firstName: p.firstName,
  lastName: p.lastName,
  phone: p.phone,
  countryOfResidence: p.countryOfResidence,
});

function Inner({ locale, t }: { locale: Locale; t: Dict }) {
  const a = t.account;
  const i = a.info;
  const router = useRouter();
  const { setUser, user } = useSession();
  const { profile, setProfile, failed } = useProfile(true);
  const [draft, setDraft] = useState<Form | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [leave, setLeave] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const dirty = !!profile && !!draft && JSON.stringify(draft) !== JSON.stringify(toForm(profile));
  const backHref = `/${locale}/account`;
  const set = (k: keyof Form) => (v: string) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const found: Record<string, string> = {};
    if (!draft.firstName.trim()) found.firstName = i.required;
    if (!draft.lastName.trim()) found.lastName = i.required;
    if (!draft.phone.trim()) found.phone = i.required;
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setNotice(null);
    try {
      const next = await account.update({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        phone: draft.phone.trim(),
        countryOfResidence: draft.countryOfResidence.trim(),
      });
      setProfile(next);
      if (user) setUser({ ...user, firstName: next.firstName, lastName: next.lastName });
      setDraft(null);
      setNotice({ kind: "ok", text: i.saved });
    } catch (err) {
      setNotice({ kind: "err", text: err instanceof ApiError && err.status === 409 ? err.message : i.failed });
    }
    setBusy(false);
  }

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) return setNotice({ kind: "err", text: i.photoType });
    if (f.size > 5 * 1024 * 1024) return setNotice({ kind: "err", text: i.photoTooBig });
    setBusy(true);
    setNotice(null);
    try {
      await account.uploadPhoto(f);
      setProfile(await account.profile());
      setNotice({ kind: "ok", text: i.photoUpdated });
    } catch {
      setNotice({ kind: "err", text: i.photoFailed });
    }
    setBusy(false);
  }

  async function removePhoto() {
    setBusy(true);
    setNotice(null);
    try {
      await account.removePhoto();
      setProfile((p) => (p ? { ...p, profilePhotoUrl: null } : p));
      setNotice({ kind: "ok", text: i.photoRemoved });
    } catch {
      setNotice({ kind: "err", text: i.photoRemoveFailed });
    }
    setBusy(false);
  }

  function onBack(e: React.MouseEvent) {
    if (dirty) {
      e.preventDefault();
      setLeave(true);
    }
  }

  const name = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "";
  const readValue = "min-h-12 rounded-btn bg-bg-light px-4 py-3 text-base text-navy";

  return (
    <div className="bg-bg-light pb-20">
      <div className="bg-navy text-white">
        <div className="mx-auto max-w-2xl px-5 pb-12 pt-8">
          <Link href={backHref} onClick={onBack} className="inline-flex min-h-10 items-center gap-1 text-sm text-white/75 hover:text-white">
            <ChevronRightIcon size={16} className="rotate-180" />
            {a.back}
          </Link>
          <h1 className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] rtl:leading-[1.35]">{i.title}</h1>
        </div>
      </div>

      <div className="mx-auto -mt-6 max-w-2xl px-5">
        <div className="rounded-card border border-line bg-white p-6 sm:p-8">
          {failed && <p role="alert" className="text-error">{a.loadFailed}</p>}
          {!profile && !failed && <div className="min-h-64" aria-busy="true" />}
          {profile && (
            <>
              <div className="flex flex-wrap items-center gap-5">
                <Avatar src={profile.profilePhotoUrl} name={name} size={88} />
                <div className="flex flex-wrap gap-3">
                  <input ref={file} type="file" accept="image/*" onChange={pickPhoto} className="sr-only" tabIndex={-1} aria-hidden />
                  <button type="button" disabled={busy} onClick={() => file.current?.click()} className={buttonClass("outline", "min-h-11 px-4 text-sm")}>
                    {i.changePhoto}
                  </button>
                  {profile.profilePhotoUrl && (
                    <button type="button" disabled={busy} onClick={removePhoto} className="min-h-11 px-3 text-sm font-medium text-error underline underline-offset-4">
                      {i.removePhoto}
                    </button>
                  )}
                </div>
              </div>

              {notice && (
                <p role="status" className={`mt-5 rounded-btn border px-4 py-3 text-sm ${notice.kind === "ok" ? "border-turquoise/50 text-navy" : "border-error/40 text-error"}`}>
                  {notice.text}
                </p>
              )}

              <form onSubmit={save} noValidate className="mt-8 flex flex-col gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="pi-first" label={i.first} error={errors.firstName}>
                    {draft ? (
                      <input id="pi-first" value={draft.firstName} onChange={(e) => set("firstName")(e.target.value)} autoComplete="given-name" aria-invalid={!!errors.firstName} aria-describedby={describedBy("pi-first", !!errors.firstName, false)} className={inputClass} />
                    ) : (
                      <p className={readValue}>{profile.firstName}</p>
                    )}
                  </Field>
                  <Field id="pi-last" label={i.last} error={errors.lastName}>
                    {draft ? (
                      <input id="pi-last" value={draft.lastName} onChange={(e) => set("lastName")(e.target.value)} autoComplete="family-name" aria-invalid={!!errors.lastName} aria-describedby={describedBy("pi-last", !!errors.lastName, false)} className={inputClass} />
                    ) : (
                      <p className={readValue}>{profile.lastName}</p>
                    )}
                  </Field>
                </div>
                <Field id="pi-email" label={i.email} hint={draft ? i.emailLocked : undefined}>
                  <p dir="ltr" className={`${readValue} text-start rtl:text-end`}>{profile.email}</p>
                </Field>
                <Field id="pi-phone" label={i.phone} error={errors.phone}>
                  {draft ? (
                    <input id="pi-phone" type="tel" inputMode="tel" dir="ltr" value={draft.phone} onChange={(e) => set("phone")(e.target.value)} autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={describedBy("pi-phone", !!errors.phone, false)} className={`${inputClass} text-start`} />
                  ) : (
                    <p dir="ltr" className={`${readValue} text-start rtl:text-end`}>{profile.phone || "—"}</p>
                  )}
                </Field>
                <Field id="pi-country" label={i.country}>
                  {draft ? (
                    <input id="pi-country" value={draft.countryOfResidence} onChange={(e) => set("countryOfResidence")(e.target.value)} autoComplete="country-name" className={inputClass} />
                  ) : (
                    <p className={readValue}>{profile.countryOfResidence || "—"}</p>
                  )}
                </Field>

                {draft ? (
                  <button type="submit" disabled={busy || !dirty} className={buttonClass("primary", "w-full")}>
                    {busy ? "…" : i.save}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setNotice(null);
                      setDraft(toForm(profile));
                    }}
                    className={buttonClass("primary", "w-full")}
                  >
                    {i.edit}
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      </div>

      <Modal open={leave} onClose={() => setLeave(false)} label={i.unsavedTitle}>
        <h2 className="text-xl font-semibold">{i.unsavedTitle}</h2>
        <p className="mt-3 text-ink-muted">{i.unsavedText}</p>
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" onClick={() => setLeave(false)} className={buttonClass("primary")}>
            {i.keep}
          </button>
          <button type="button" onClick={() => router.push(backHref)} className="min-h-12 rounded-btn px-5 font-medium text-error">
            {i.discard}
          </button>
        </div>
      </Modal>
    </div>
  );
}
