import type { ReactNode, TextareaHTMLAttributes } from 'react';
import { RequiredMark } from './Input';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  helper?: string;
  error?: string;
  showRequiredMark?: boolean;
  /** Nội dung góc dưới phải ô nhập (vd bộ đếm ký tự). */
  counter?: ReactNode;
};

export function Textarea({ id, label, helper, error, showRequiredMark = false, counter, className = '', ...props }: TextareaProps) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="grid gap-2">
      <label className="font-medium text-text-primary" htmlFor={id}>{label}{showRequiredMark && props.required && <RequiredMark />}</label>
      <div className="relative">
        <textarea {...props} id={id} aria-describedby={describedBy} aria-invalid={Boolean(error)} className={`min-h-32 w-full rounded-sm border border-border bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-secondary focus-visible:outline-2 focus-visible:outline-primary ${counter ? 'pb-7' : ''} ${className}`} />
        {counter && <div className="pointer-events-none absolute bottom-2 right-3 text-xs text-text-secondary">{counter}</div>}
      </div>
      {helper && <p id={helperId} className="text-sm text-text-secondary">{helper}</p>}
      {error && <p id={errorId} className="text-sm text-error-ink">{error}</p>}
    </div>
  );
}
