import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; helper?: string; error?: string };

export function Textarea({ id, label, helper, error, className = '', ...props }: TextareaProps) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="grid gap-2">
      <label className="font-medium text-text-primary" htmlFor={id}>{label}</label>
      <textarea {...props} id={id} aria-describedby={describedBy} aria-invalid={Boolean(error)} className={`min-h-32 rounded-sm border border-border bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-secondary focus-visible:outline-2 focus-visible:outline-primary ${className}`} />
      {helper && <p id={helperId} className="text-sm text-text-secondary">{helper}</p>}
      {error && <p id={errorId} className="text-sm text-error-ink">{error}</p>}
    </div>
  );
}
