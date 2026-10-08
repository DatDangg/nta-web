'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ShareBar({ pageUrl }: { pageUrl: string }) {
  const t = useTranslations('blog');
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(pageUrl);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-[720px] flex-wrap items-center gap-2 px-4" aria-label={t('share')} role="group">
      <a aria-label={t('shareFacebook')} className="inline-flex min-h-11 items-center rounded-full border border-border px-4 underline-offset-4 hover:underline" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} rel="noopener noreferrer" target="_blank">Facebook</a>
      <a aria-label={t('shareLinkedIn')} className="inline-flex min-h-11 items-center rounded-full border border-border px-4 underline-offset-4 hover:underline" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} rel="noopener noreferrer" target="_blank">LinkedIn</a>
      <button aria-label={t('copyLink')} className="min-h-11 rounded-full border border-border px-4" onClick={copyLink} type="button">{t('copyLink')}</button>
      <span className="sr-only" role="status">{copied ? t('copied') : ''}</span>
    </div>
  );
}
