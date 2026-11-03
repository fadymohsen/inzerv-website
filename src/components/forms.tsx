export const inputClass =
  "block min-h-12 w-full rounded-btn border border-line bg-white px-4 pe-10 text-base text-navy placeholder:text-text-secondary focus:border-turquoise focus:outline-none focus:ring-2 focus:ring-turquoise disabled:bg-bg-light disabled:text-text-secondary aria-[invalid=true]:border-error aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error";

export const selectClass =
  `${inputClass} cursor-pointer appearance-none bg-[length:1.25rem_1.25rem] bg-[position:right_0.75rem_center] bg-no-repeat rtl:bg-[position:left_0.75rem_center] bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%230B1F3F' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")]`;

export function Field({
  id,
  label,
  error,
  hint,
  required,
  requiredLabel,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  requiredLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-center gap-2 text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden="true" className="text-error" title={requiredLabel}>
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-2 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, hasError: boolean, hasHint: boolean) {
  if (hasError) return `${id}-err`;
  if (hasHint) return `${id}-hint`;
  return undefined;
}
