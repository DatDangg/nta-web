'use client';

import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';

export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const localizedPath = pathname.replace(/^\/en(?=\/|$)/, '') || '/';

  return (
    <div aria-label="Language" className="flex items-center gap-1 text-sm" role="group">
      <Link aria-current={locale === 'vi' ? 'true' : undefined} className={`flex min-h-11 min-w-11 items-center justify-center ${locale === 'vi' ? 'font-semibold text-primary-active' : 'text-text-secondary'}`} href={localizedPath} locale="vi">VI</Link>
      <span aria-hidden="true" className="text-border-strong">|</span>
      <Link aria-current={locale === 'en' ? 'true' : undefined} className={`flex min-h-11 min-w-11 items-center justify-center ${locale === 'en' ? 'font-semibold text-primary-active' : 'text-text-secondary'}`} href={localizedPath} locale="en">EN</Link>
    </div>
  );
}
