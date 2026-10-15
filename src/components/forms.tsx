export const inputClass =
  "block min-h-12 w-full rounded-btn border border-line bg-white px-4 text-base text-navy placeholder:text-text-secondary focus:border-turquoise focus:outline-none focus:ring-2 focus:ring-turquoise disabled:bg-bg-light disabled:text-text-secondary aria-[invalid=true]:border-error aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error";

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
