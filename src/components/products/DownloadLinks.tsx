import { Badge } from '@/components/ui/Badge';
import type { Product } from '@/content/types';

interface DownloadLinksProps {
  product: Product;
  comingSoonLabel: string;
  downloadLabel: string;
}

export function DownloadLinks({ product, comingSoonLabel, downloadLabel }: DownloadLinksProps) {
  const downloadUrl = product.downloadUrl;
  if (!downloadUrl || !isAbsoluteHttpUrl(downloadUrl)) return <Badge>{comingSoonLabel}</Badge>;

  return (
    <a className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-medium text-text-inverse focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href={downloadUrl} rel="noopener noreferrer" target="_blank">
      {downloadLabel}
    </a>
  );
}

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && Boolean(url.hostname);
  } catch {
    return false;
  }
}
