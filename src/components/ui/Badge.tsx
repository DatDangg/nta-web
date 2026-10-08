import type { HTMLAttributes } from 'react';

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className = '', children, ...badgeProps }: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-full bg-background-alt px-3 py-1 text-sm font-medium text-text-primary ${className}`.trim()}
      {...badgeProps}
    >
      {children}
    </span>
  );
}
