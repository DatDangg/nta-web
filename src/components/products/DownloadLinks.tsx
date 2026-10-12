import type { Product } from '@/content/types';

interface DownloadLinksProps {
  product: Product;
  downloadLabel: string;
}

/** Nút tải app — chỉ render khi `downloadUrl` là URL http(s) hợp lệ. */
export function DownloadLinks({ product, downloadLabel }: DownloadLinksProps) {
  if (!hasDownloadUrl(product)) return null;

  return (
    <a className="inline-flex min-h-11 items-center gap-2 rounded-full bg-text-primary px-6 font-medium text-text-inverse motion-safe:transition-opacity motion-safe:duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href={product.downloadUrl ?? undefined} rel="noopener noreferrer" target="_blank">
      {downloadLabel}
      <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" viewBox="0 0 24 24" width="16"><path d="M7 17 17 7M7 7h10v10" /></svg>
    </a>
  );
}

export function ComingSoonBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex min-h-7 items-center gap-2 rounded-full bg-background-alt px-3 text-sm font-medium text-text-primary ring-1 ring-black/5">
      <span aria-hidden="true" className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      {label}
    </span>
  );
}

export function hasDownloadUrl(product: Product): boolean {
  const value = product.downloadUrl;
  if (!value) return false;
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && Boolean(url.hostname);
  } catch {
    return false;
  }
}
