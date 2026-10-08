import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; helper?: string; error?: string };

export function Input({ id, label, helper, error, className = '', ...props }: InputProps) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="grid gap-2">
      <label className="font-medium text-text-primary" htmlFor={id}>{label}</label>
      <input {...props} id={id} aria-describedby={describedBy} aria-invalid={Boolean(error)} className={`min-h-11 rounded-sm border border-border bg-surface px-3 text-base text-text-primary placeholder:text-text-secondary focus-visible:outline-2 focus-visible:outline-primary ${className}`} />
      {helper && <p id={helperId} className="text-sm text-text-secondary">{helper}</p>}
      {error && <p id={errorId} className="text-sm text-error-ink">{error}</p>}
    </div>
  );
}
