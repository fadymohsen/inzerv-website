"use client";

import { useState } from "react";
import type { Dict } from "@/dictionaries/en";
import { buttonClass } from "@/components/Button";
import { SUPPORT_EMAIL } from "@/lib/config";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const inputClass =
  "mt-2 block min-h-12 w-full rounded-btn border border-line bg-white px-4 text-base text-navy placeholder:text-text-secondary focus:border-turquoise focus:outline-none focus:ring-2 focus:ring-turquoise aria-[invalid=true]:border-error";

export function ContactForm({ t }: { t: Dict["contact"] }) {
  const [errors, setErrors] = useState<Errors>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const topic = String(data.get("topic") ?? "");
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!name) next.name = t.errors.name;
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = t.errors.email;
    if (!message) next.message = t.errors.message;
    setErrors(next);
    if (Object.keys(next).length) {
      const first = e.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
      return;
    }

    const subject = `Inzerv website: ${topic}`;
    const body = `${message}\n\n${name}\n${email}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
        <label htmlFor="c-topic" className="text-sm font-medium">
          {t.topic}
        </label>
        <select id="c-topic" name="topic" className={inputClass} defaultValue={t.topics[0]}>
          {t.topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
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
        <button type="submit" className={buttonClass("primary", "w-full sm:w-auto")}>
          {t.send}
        </button>
        <p className="mt-3 max-w-[52ch] text-sm text-ink-muted">{t.note}</p>
      </div>
    </form>
  );
}
