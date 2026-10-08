import type { ReactNode } from 'react';

type EmptyStateProps = {
  message: string;
  action?: ReactNode;
};

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div aria-live="polite" className="flex flex-col items-center gap-4 rounded-lg bg-background-alt px-6 py-12 text-center">
      <p className="text-text-secondary">{message}</p>
      {action}
    </div>
  );
}
