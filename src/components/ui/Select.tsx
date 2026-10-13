import type { SelectHTMLAttributes } from 'react';
import { RequiredMark } from './Input';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  showRequiredMark?: boolean;
  placeholder: string;
  options: { value: string; label: string }[];
};

/** Select native (bàn phím + screen reader sẵn có), cùng kiểu với `Input`. Placeholder = option rỗng. */
export function Select({ id, label, error, showRequiredMark = false, placeholder, options, value, className = '', ...props }: SelectProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="grid gap-2">
      <label className="font-medium text-text-primary" htmlFor={id}>{label}{showRequiredMark && props.required && <RequiredMark />}</label>
      <div className="relative">
        <select
          {...props}
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          className={`min-h-11 w-full appearance-none rounded-sm border border-border bg-surface pl-3 pr-10 text-base focus-visible:outline-2 focus-visible:outline-primary ${value ? 'text-text-primary' : 'text-text-secondary'} ${className}`}
          id={id}
          value={value}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => <option className="text-text-primary" key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-text-secondary" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
      </div>
      {error && <p id={errorId} className="text-sm text-error-ink">{error}</p>}
    </div>
  );
}
