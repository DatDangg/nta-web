import type { ReactNode } from 'react';

type EmptyStateProps = {
  message: string;
  action?: ReactNode;
  announce?: boolean;
};

export function EmptyState({ message, action, announce = true }: EmptyStateProps) {
  return (
    <div aria-live={announce ? 'polite' : undefined} className="flex flex-col items-center gap-4 rounded-lg bg-background-alt px-6 py-12 text-center">
      <p className="text-text-secondary">{message}</p>
      {action}
    </div>
  );
}
