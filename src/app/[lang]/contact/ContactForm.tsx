"use client";

import { useState } from "react";
import type { Dict } from "@/dictionaries/en";
import { buttonClass } from "@/components/Button";
import { Select } from "@/components/Select";
import type { Locale } from "@/lib/i18n";

type Errors = Partial<Record<"name" | "email" | "topic" | "message", string>>;
type Status = "idle" | "sending" | "sent" | "error";

const inputClass =
  "mt-2 block min-h-12 w-full rounded-btn border border-line bg-white px-4 text-base text-navy placeholder:text-text-secondary focus:border-turquoise focus:outline-none focus:ring-2 focus:ring-turquoise aria-[invalid=true]:border-error";

/** Topics that should show the order-reference field (matched by index). */
const ORDER_REF_TOPIC_INDICES = new Set([1, 2]); // "Regarding an Existing Order", "Cancellation and Refund"

export function ContactForm({ t, locale }: { t: Dict["contact"]; locale: Locale }) {
  const [errors, setErrors] = useState<Errors>({});
  const [topic, setTopic] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [ticketRef, setTicketRef] = useState("");

  const topicIndex = t.topics.indexOf(topic);
  const showOrderRef = ORDER_REF_TOPIC_INDICES.has(topicIndex);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = t.errors.name;
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = t.errors.email;
    if (!topic) next.topic = t.errors.topic;
    if (!message) next.message = t.errors.message;
    setErrors(next);
    if (Object.keys(next).length) {
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          topic,
          orderRef: showOrderRef ? orderRef.trim() : undefined,
          message,
          locale,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setTicketRef(data.ticketRef ?? "");
      setStatus("sent");
      form.reset();
      setTopic("");
      setOrderRef("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-turquoise/15 text-turquoise">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <p className="text-lg font-semibold">{t.successTitle}</p>
        {ticketRef && (
          <div className="rounded-btn bg-navy px-5 py-3 text-center">
            <p className="text-xs text-white/60">{t.successRef}</p>
            <p dir="ltr" className="mt-0.5 text-lg font-bold tracking-wider text-white">{ticketRef}</p>
          </div>
        )}
        <p className="max-w-[44ch] text-ink-muted">{t.successText}</p>
        <button type="button" onClick={() => setStatus("idle")} className={buttonClass("outline", "mt-2")}>
          {t.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div>
        <label htmlFor="c-name" className="text-sm font-medium">
          {t.name} <span className="text-error">*</span>
        </label>
        <input
          id="c-name"
          name="name"
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "c-name-err" : undefined}
          className={inputClass}
        />
        {errors.name && (
          <p id="c-name-err" role="alert" className="mt-2 text-sm text-error">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="c-email" className="text-sm font-medium">
          {t.email} <span className="text-error">*</span>
        </label>
        <input
          id="c-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          dir="ltr"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "c-email-err" : undefined}
          className={`${inputClass} text-start`}
        />
        {errors.email && (
          <p id="c-email-err" role="alert" className="mt-2 text-sm text-error">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="c-topic" className="mb-2 block text-sm font-medium">
          {t.topic} <span className="text-error">*</span>
        </label>
        <Select
          id="c-topic"
          value={topic}
          placeholder={t.topicPlaceholder}
          options={t.topics.map((tp) => ({ value: tp, label: tp }))}
          onChange={setTopic}
          aria-invalid={!!errors.topic}
          aria-describedby={errors.topic ? "c-topic-err" : undefined}
        />
        {errors.topic && (
          <p id="c-topic-err" role="alert" className="mt-2 text-sm text-error">{errors.topic}</p>
        )}
      </div>

      {showOrderRef && (
        <div>
          <label htmlFor="c-orderref" className="text-sm font-medium">
            {t.orderRef}
          </label>
          <input
            id="c-orderref"
            dir="ltr"
            value={orderRef}
            onChange={(e) => setOrderRef(e.target.value)}
            placeholder={t.orderRefPlaceholder}
            className={`${inputClass} text-start`}
          />
        </div>
      )}

      <div>
        <label htmlFor="c-message" className="text-sm font-medium">
          {t.message} <span className="text-error">*</span>
        </label>
        <textarea
          id="c-message"
          name="message"
          rows={6}
          placeholder={t.messagePlaceholder}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "c-message-err" : undefined}
          className={`${inputClass} py-3`}
        />
        {errors.message && (
          <p id="c-message-err" role="alert" className="mt-2 text-sm text-error">{errors.message}</p>
        )}
      </div>

      <div>
        <button type="submit" disabled={status === "sending"} className={buttonClass("primary", "w-full sm:w-auto")}>
          {status === "sending" ? t.sending : t.send}
        </button>
        {status === "error" && (
          <p role="alert" className="mt-3 text-sm text-error">{t.errorText}</p>
        )}
        <p className="mt-3 max-w-[52ch] text-sm text-ink-muted">{t.note}</p>
      </div>
    </form>
  );
}
