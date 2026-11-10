"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/Button";
import { ChevronDownIcon, DocumentIcon } from "@/components/Icons";
import type { Dict } from "@/dictionaries/en";
import { orders, type RequestDetail, type StatusHistoryEntry, type UserRequest } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n";

type Tab = "ongoing" | "completed" | "cancelled";

const ONGOING_STATUSES = new Set([
  "requested", "received", "under_review", "action_required",
  "in_progress", "under_delivery", "cancellation_requested",
]);

const STATUS_COLOR: Record<string, string> = {
  requested: "bg-amber-100 text-amber-800",
  received: "bg-sky-100 text-sky-800",
  under_review: "bg-blue-100 text-blue-800",
  action_required: "bg-orange-100 text-orange-800",
  in_progress: "bg-violet-100 text-violet-800",
  under_delivery: "bg-cyan-100 text-cyan-800",
  cancellation_requested: "bg-rose-100 text-rose-700",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-600",
};

const DOT_COLOR: Record<string, string> = {
  requested: "bg-amber-400",
  received: "bg-sky-400",
  under_review: "bg-blue-500",
  action_required: "bg-orange-500",
  in_progress: "bg-violet-500",
  under_delivery: "bg-cyan-500",
  cancellation_requested: "bg-rose-500",
  completed: "bg-emerald-500",
  cancelled: "bg-gray-400",
};

function groupRequests(list: UserRequest[]) {
  const ongoing: UserRequest[] = [];
  const completed: UserRequest[] = [];
  const cancelled: UserRequest[] = [];
  for (const r of list) {
    if (r.status === "completed") completed.push(r);
    else if (r.status === "cancelled") cancelled.push(r);
    else ongoing.push(r);
  }
  return { ongoing, completed, cancelled };
}

export function RequestsList({ locale, t }: { locale: Locale; t: Dict["account"]["requests"] }) {
  const [data, setData] = useState<UserRequest[] | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("ongoing");

  function load() {
    setError(false);
    orders.list().then(setData).catch(() => setError(true));
  }

  useEffect(load, []);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-sm text-ink-muted">{t.loadFailed}</p>
        <button type="button" onClick={load} className={buttonClass("outline")}>{t.retry}</button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center py-10">
        <div className="size-7 animate-spin rounded-full border-[3px] border-line border-t-turquoise" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-turquoise/12 text-turquoise">
          <DocumentIcon size={28} />
        </div>
        <p className="text-ink-muted">{t.empty}</p>
        <Link href={`/${locale}/request`} className={buttonClass("primary")}>{t.startRequest}</Link>
      </div>
    );
  }

  const groups = groupRequests(data);
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "ongoing", label: t.tabs.ongoing, count: groups.ongoing.length },
    { key: "completed", label: t.tabs.completed, count: groups.completed.length },
    { key: "cancelled", label: t.tabs.cancelled, count: groups.cancelled.length },
  ];
  const visible = groups[tab];

  return (
    <div>
      <div className="flex gap-1 rounded-btn bg-bg-light p-1">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={`flex-1 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors ${
              tab === tb.key ? "bg-white text-navy shadow-sm" : "text-ink-muted hover:text-navy"
            }`}
          >
            {tb.label}
            {tb.count > 0 && (
              <span className={`ms-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                tab === tb.key ? "bg-turquoise/15 text-turquoise" : "bg-line text-ink-muted"
              }`}>{tb.count}</span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">{t.empty}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {visible.map((r) => (
            <RequestCard key={r.id} r={r} locale={locale} t={t} />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Card ──────────────────────────────────────────────────── */

function RequestCard({ r, locale, t }: { r: UserRequest; locale: Locale; t: Dict["account"]["requests"] }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(false);

  function toggle() {
    if (!open && !detail) {
      setLoading(true);
      orders.detail(r.id).then((d) => { setDetail(d); setOpen(true); }).catch(() => {}).finally(() => setLoading(false));
    } else {
      setOpen((v) => !v);
    }
  }

  const serviceName = locale === "ar" ? r.govService.nameAr : r.govService.nameEn;
  const statusLabel = t.status[r.status] ?? r.status;
  const colorClass = STATUS_COLOR[r.status] ?? "bg-gray-100 text-gray-600";
  const amount = Number(r.totalAmount);
  // Always use Western digits (0-9) per Note 16
  const date = new Date(r.createdAt).toLocaleDateString(locale === "ar" ? "ar-u-nu-latn" : "en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
  const copies = r.numberOfCopies === 1 ? t.oneCopy : t.copies.replace("{n}", String(r.numberOfCopies));

  return (
    <li className="overflow-hidden rounded-card border border-line bg-white transition-shadow hover:shadow-md">
      <button type="button" onClick={toggle} className="w-full p-4 text-start sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-navy">{serviceName}</p>
            <p dir="ltr" className="mt-1 text-start text-xs text-ink-muted">{t.ref} {r.referenceNumber}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${colorClass}`}>{statusLabel}</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
          <span>{date}</span>
          <span className="hidden sm:inline">·</span>
          <span>{copies}</span>
          <span className="hidden sm:inline">·</span>
          <span dir="ltr" className="font-semibold text-navy">
            {amount.toLocaleString("en-EG")} {locale === "ar" ? "ج.م" : "EGP"}
          </span>
          <span className="ms-auto flex items-center gap-1 text-xs font-medium text-turquoise">
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-turquoise/30 border-t-turquoise" />
            ) : (
              <ChevronDownIcon size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            )}
          </span>
        </div>
      </button>

      {open && detail && (
        <div className="border-t border-line bg-bg-light px-4 pb-5 pt-4 sm:px-5">
          <DetailPanel detail={detail} locale={locale} t={t} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full text-center text-sm font-medium text-ink-muted hover:text-navy"
          >
            {t.detail.collapse}
          </button>
        </div>
      )}
    </li>
  );
}

/* ── Detail panel ──────────────────────────────────────────── */

function DetailPanel({ detail, locale, t }: { detail: RequestDetail; locale: Locale; t: Dict["account"]["requests"] }) {
  const d = t.detail;
  const history = [...(detail.statusHistory ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Action required banner */}
      {detail.status === "action_required" && detail.actionRequiredMessage && (
        <div className="rounded-btn border border-orange-300 bg-orange-50 px-4 py-3">
          <p className="text-xs font-semibold text-orange-800">{d.actionRequired}</p>
          <p className="mt-1 text-sm text-orange-700">{detail.actionRequiredMessage}</p>
        </div>
      )}

      {/* Timeline */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-navy">{d.timeline}</h3>
        <Timeline history={history} locale={locale} statusLabels={t.status} />
      </div>

      {/* Delivery & pricing */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Delivery info */}
        {detail.recipientName && (
          <div className="rounded-btn border border-line bg-white p-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">{d.delivery}</h4>
            <InfoRow label={d.recipient} value={detail.recipientName} />
            {detail.recipientPhone && <InfoRow label="" value={detail.recipientPhone} dir="ltr" />}
            {detail.deliveryAddress && <InfoRow label={d.address} value={detail.deliveryAddress} />}
            {detail.deliveryCity && <InfoRow label={d.city} value={detail.deliveryCity} />}
            {detail.deliveryGovernorate && <InfoRow label={d.governorate} value={detail.deliveryGovernorate} />}
          </div>
        )}

        {/* Pricing */}
        <div className="rounded-btn border border-line bg-white p-4">
          <PriceRow label={d.serviceFee} amount={Number(detail.servicePrice)} locale={locale} />
          <PriceRow label={d.deliveryFee} amount={Number(detail.deliveryFee)} locale={locale} />
          <div className="mt-2 border-t border-line pt-2">
            <PriceRow label={d.total} amount={Number(detail.totalAmount)} locale={locale} bold />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Timeline ──────────────────────────────────────────────── */

function Timeline({ history, locale, statusLabels }: { history: StatusHistoryEntry[]; locale: Locale; statusLabels: Record<string, string> }) {
  if (history.length === 0) return null;

  return (
    <ol className="relative ms-3 border-s-2 border-line ps-6">
      {history.map((entry, i) => {
        const isLast = i === history.length - 1;
        const dotColor = DOT_COLOR[entry.status] ?? "bg-gray-400";
        const label = statusLabels[entry.status] ?? entry.status;
        const note = locale === "ar" ? (entry.noteAr || entry.note) : entry.note;
        const time = new Date(entry.createdAt).toLocaleDateString(locale === "ar" ? "ar-u-nu-latn" : "en-GB", {
          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        });

        return (
          <li key={entry.id} className={`relative ${i < history.length - 1 ? "pb-5" : ""}`}>
            {/* Dot */}
            <span className={`absolute -start-[calc(1.5rem+5px)] top-[3px] size-[10px] rounded-full ring-[3px] ring-white ${dotColor} ${isLast ? "ring-2 ring-offset-1 ring-offset-white" : ""}`} />

            <p className={`text-sm font-semibold ${isLast ? "text-navy" : "text-ink-muted"}`}>{label}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{time}</p>
            {note && <p className="mt-1 text-sm text-ink-muted">{note}</p>}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Helpers ───────────────────────────────────────────────── */

function InfoRow({ label, value, dir }: { label: string; value: string; dir?: string }) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      {label && <span className="text-xs text-ink-muted">{label}</span>}
      <span dir={dir} className="text-sm font-medium text-navy">{value}</span>
    </div>
  );
}

function PriceRow({ label, amount, locale, bold }: { label: string; amount: number; locale: Locale; bold?: boolean }) {
  const formatted = amount.toLocaleString("en-EG");
  const currency = locale === "ar" ? "ج.م" : "EGP";
  return (
    <div className={`flex items-center justify-between py-1 text-sm ${bold ? "font-semibold text-navy" : "text-ink-muted"}`}>
      <span>{label}</span>
      <span dir="ltr">{formatted} {currency}</span>
    </div>
  );
}
