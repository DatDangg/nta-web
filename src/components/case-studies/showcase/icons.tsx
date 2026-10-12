import type { ReactNode } from 'react';
import type { ShowcaseIcon } from '@/content/types';

const PATHS: Record<ShowcaseIcon, ReactNode> = {
  area: (
    <>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M12 13.5s3-2.6 3-5a3 3 0 1 0-6 0c0 2.4 3 5 3 5Z" />
      <circle cx="12" cy="8.5" r="1" />
    </>
  ),
  camera: (
    <>
      <rect height="12" rx="2.5" width="18" x="3" y="6" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M7 6V5M17 9h.01" />
    </>
  ),
  calendar: (
    <>
      <rect height="16" rx="2" width="18" x="3" y="5" />
      <path d="M3 10h18M8 3v4M16 3v4M7.5 14h.01M12 14h.01M16.5 14h.01M7.5 17.5h.01M12 17.5h.01" />
    </>
  ),
  challenge: (
    <>
      <path d="M4 20h16L12 5 4 20Z" />
      <path d="M12 5 9 10.5l3 1.5 3-1.5M9 20l3-5 3 5" />
    </>
  ),
  solution: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
    </>
  ),
  result: (
    <>
      <path d="M4 20h16" />
      <rect height="6" rx="1" width="3.5" x="5" y="12" />
      <rect height="10" rx="1" width="3.5" x="10.25" y="8" />
      <rect height="14" rx="1" width="3.5" x="15.5" y="4" />
    </>
  ),
  modules: (
    <>
      <rect height="7" rx="1.5" width="7" x="3" y="3" />
      <rect height="7" rx="1.5" width="7" x="14" y="3" />
      <rect height="7" rx="1.5" width="7" x="3" y="14" />
      <rect height="7" rx="1.5" width="7" x="14" y="14" />
    </>
  ),
};

export function ShowcaseIconBadge({ icon, size = 'md' }: { icon: ShowcaseIcon; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'size-14' : 'size-12';
  return (
    <span aria-hidden="true" className={`flex ${box} shrink-0 items-center justify-center rounded-full bg-primary-light text-primary`}>
      <svg className="size-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
        {PATHS[icon]}
      </svg>
    </span>
  );
}

export function ArrowRight({ className = 'size-4' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CheckDot() {
  return (
    <span aria-hidden="true" className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-primary text-white">
      <svg className="size-3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24">
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

export function Eyebrow({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-active">
      {children}
    </span>
  );
}
