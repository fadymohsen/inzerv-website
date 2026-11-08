"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/Button";
import { DocumentIcon } from "@/components/Icons";
import type { Dict } from "@/dictionaries/en";
import { orders, type UserRequest } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n";

type Tab = "ongoing" | "completed" | "cancelled";

const ONGOING_STATUSES = new Set([
  "requested",
  "received",
  "under_review",
  "action_required",
  "in_progress",
  "under_delivery",
  "cancellation_requested",
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

function groupRequests(list: UserRequest[]) {
  const ongoing: UserRequest[] = [];
  const completed: UserRequest[] = [];
  const cancelled: UserRequest[] = [];
  for (const r of list) {
    if (r.status === "completed") completed.push(r);
    else if (r.status === "cancelled") cancelled.push(r);
    else if (ONGOING_STATUSES.has(r.status)) ongoing.push(r);
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
    orders
      .list()
      .then(setData)
      .catch(() => setError(true));
  }

  useEffect(load, []);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="text-sm text-ink-muted">{t.loadFailed}</p>
        <button type="button" onClick={load} className={buttonClass("outline")}>
          {t.retry}
        </button>
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
        <Link href={`/${locale}/request`} className={buttonClass("primary")}>
          {t.startRequest}
        </Link>
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
      {/* Tabs */}
      <div className="flex gap-1 rounded-btn bg-bg-light p-1">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={`flex-1 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors ${
              tab === tb.key
                ? "bg-white text-navy shadow-sm"
                : "text-ink-muted hover:text-navy"
            }`}
          >
            {tb.label}
            {tb.count > 0 && (
              <span
                className={`ms-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  tab === tb.key ? "bg-turquoise/15 text-turquoise" : "bg-line text-ink-muted"
                }`}
              >
                {tb.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
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

function RequestCard({
  r,
  locale,
  t,
}: {
  r: UserRequest;
  locale: Locale;
  t: Dict["account"]["requests"];
}) {
  const serviceName = locale === "ar" ? r.govService.nameAr : r.govService.nameEn;
  const statusLabel = t.status[r.status] ?? r.status;
  const colorClass = STATUS_COLOR[r.status] ?? "bg-gray-100 text-gray-600";
  const amount = Number(r.totalAmount);
  const date = new Date(r.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const copies = r.numberOfCopies === 1 ? t.oneCopy : t.copies.replace("{n}", String(r.numberOfCopies));

  return (
    <li className="rounded-card border border-line bg-white p-4 transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-navy">{serviceName}</p>
          <p dir="ltr" className="mt-1 text-start text-xs text-ink-muted">
            {t.ref} {r.referenceNumber}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${colorClass}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
        <span>{date}</span>
        <span className="hidden sm:inline">·</span>
        <span>{copies}</span>
        <span className="hidden sm:inline">·</span>
        <span className="font-semibold text-navy">
          {amount.toLocaleString(locale === "ar" ? "ar-EG" : "en-EG")} {locale === "ar" ? "ج.م" : "EGP"}
        </span>
      </div>
    </li>
  );
}
