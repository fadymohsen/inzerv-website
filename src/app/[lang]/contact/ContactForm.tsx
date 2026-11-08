"use client";

import { useState } from "react";
import type { Dict } from "@/dictionaries/en";
import { buttonClass } from "@/components/Button";
import { Select } from "@/components/Select";

type Errors = Partial<Record<"name" | "email" | "message", string>>;
type Status = "idle" | "sending" | "sent" | "error";

const inputClass =
  "mt-2 block min-h-12 w-full rounded-btn border border-line bg-white px-4 text-base text-navy placeholder:text-text-secondary focus:border-turquoise focus:outline-none focus:ring-2 focus:ring-turquoise aria-[invalid=true]:border-error";

export function ContactForm({ t }: { t: Dict["contact"] }) {
  const [errors, setErrors] = useState<Errors>({});
  const [topic, setTopic] = useState(t.topics[0]);
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const topicValue = topic;
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = t.errors.name;
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = t.errors.email;
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
        body: JSON.stringify({ name, email, topic: topicValue, message }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
      form.reset();
      setTopic(t.topics[0]);
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
        <p className="max-w-[44ch] text-ink-muted">{t.successText}</p>
        <button type="button" onClick={() => setStatus("idle")} className={buttonClass("secondary", "mt-2")}>
          {t.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div>
        <label htmlFor="c-name" className="text-sm font-medium">
          {t.name}
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
          <p id="c-name-err" role="alert" className="mt-2 text-sm text-error">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="c-email" className="text-sm font-medium">
          {t.email}
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
          <p id="c-email-err" role="alert" className="mt-2 text-sm text-error">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="c-topic" className="mb-2 block text-sm font-medium">
          {t.topic}
        </label>
        <Select
          id="c-topic"
          value={topic}
          options={t.topics.map((tp) => ({ value: tp, label: tp }))}
          onChange={setTopic}
        />
      </div>

      <div>
        <label htmlFor="c-message" className="text-sm font-medium">
          {t.message}
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
          <p id="c-message-err" role="alert" className="mt-2 text-sm text-error">
            {errors.message}
          </p>
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
