"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/Button";
import { CheckIcon } from "@/components/Icons";
import { useSession } from "@/components/SessionProvider";
import type { Dict } from "@/dictionaries/en";
import { ApiError, isSafePaymentUrl, orders, payments, type PaymentView } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n";

const POLL_MS = 3000;
const POLL_TRIES = 40; // about two minutes

/**
 * Where the customer lands after the hosted payment page. The URL's "outcome" is only a hint:
 * what we show comes from the backend, which confirms payments with the gateway itself.
 */
export function PaymentResult({ locale, t }: { locale: Locale; t: Dict["checkout"] }) {
  const r = t.result;
  const search = useSearchParams();
  const ref = search.get("ref") ?? "";
  const rid = search.get("rid") ?? "";
  const { status } = useSession();

  const [view, setView] = useState<PaymentView | null>(null);
  const [lookup, setLookup] = useState<"checking" | "ready" | "missing">("checking");
  const [busy, setBusy] = useState(false);
  const tries = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const again_ = useRef<() => void>(() => {});

  const check = useCallback(async () => {
    try {
      const next = await payments.status(rid);
      setView(next);
      setLookup("ready");
      if (next.status === "pending" && ++tries.current < POLL_TRIES) {
        timer.current = window.setTimeout(() => again_.current(), POLL_MS);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setLookup("missing");
      else timer.current = window.setTimeout(() => again_.current(), POLL_MS * 2);
    }
  }, [rid]);

  useEffect(() => {
    again_.current = () => void check();
  }, [check]);

  useEffect(() => {
    if (status !== "authenticated" || !rid) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- polls the API; state is only set after the await
    void check();
    return () => window.clearTimeout(timer.current);
  }, [status, rid, check]);

  async function again() {
    tries.current = 0;
    setView(null);
    setLookup("checking");
    await check();
  }

  async function retryPayment() {
    setBusy(true);
    try {
      const p = await orders.pay(rid, "card", locale);
      if (p.status === "pending" && p.checkoutUrl && isSafePaymentUrl(p.checkoutUrl)) {
        window.location.assign(p.checkoutUrl);
        return;
      }
      await again();
    } catch {
      await again();
    }
    setBusy(false);
  }

  if (status === "loading") return <p className="text-center text-ink-muted">{r.checking}</p>;
  if (status === "anonymous") {
    return (
      <div className="text-center">
        <Link
          href={`/${locale}/signin?next=${encodeURIComponent(`/${locale}/checkout/result?ref=${ref}&rid=${rid}`)}`}
          className={buttonClass("primary")}
        >
          {r.signIn}
        </Link>
      </div>
    );
  }
  if (!rid || lookup === "missing") {
    return (
      <div className="text-center">
        <p className="text-ink-muted">{r.missing}</p>
        <Link href={`/${locale}`} className={buttonClass("outline", "mt-8")}>
          {r.home}
        </Link>
      </div>
    );
  }
  if (!view) return <p className="text-center text-ink-muted" role="status">{r.checking}</p>;

  if (view.status === "success") {
    return (
      <div className="text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-turquoise text-navy">
          <CheckIcon size={32} />
        </span>
        <h1 className="mt-8 text-4xl font-semibold tracking-[-0.02em] rtl:leading-snug">{r.successTitle}</h1>
        {ref && (
          <>
            <p className="mt-8 text-sm text-ink-muted">{r.ref}</p>
            <p dir="ltr" className="tabular mt-1 text-3xl font-semibold">{ref}</p>
          </>
        )}
        <p className="mx-auto mt-6 max-w-[48ch] leading-relaxed text-ink-muted">{r.successText}</p>
        <Link href={`/${locale}`} className={buttonClass("outline", "mt-10")}>
          {r.home}
        </Link>
      </div>
    );
  }

  const failed = view.status === "failed";
  return (
    <div className="text-center" role="status">
      <h1 className="text-4xl font-semibold tracking-[-0.02em] rtl:leading-snug">{failed ? r.failedTitle : r.pendingTitle}</h1>
      <p className="mx-auto mt-6 max-w-[48ch] leading-relaxed text-ink-muted">{failed ? r.failedText : r.pendingText}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {failed ? (
          <button type="button" disabled={busy} onClick={retryPayment} className={buttonClass("primary")}>
            {busy ? "…" : r.retry}
          </button>
        ) : (
          <button type="button" onClick={again} className={buttonClass("primary")}>
            {r.checkAgain}
          </button>
        )}
        <Link href={`/${locale}`} className={buttonClass("outline")}>
          {r.home}
        </Link>
      </div>
    </div>
  );
}
