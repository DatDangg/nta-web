'use client';

import { Fragment } from 'react';
import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

// usePathname của next-intl trả path KHÔNG kèm prefix locale (vd `/blog/abc` cho cả `/en/blog/abc`, `/ja/blog/abc`),
// nên chỉ cần đổi `locale` của Link là giữ nguyên path/slug khi chuyển ngôn ngữ.
export function LanguageToggle() {
  const currentLocale = useLocale();
  const pathname = usePathname();

  return (
    <div aria-label="Language" className="flex items-center gap-1 text-sm" role="group">
      {routing.locales.map((locale, index) => (
        <Fragment key={locale}>
          {index > 0 && <span aria-hidden="true" className="text-border-strong">|</span>}
          <Link
            aria-current={locale === currentLocale ? 'true' : undefined}
            className={`flex min-h-11 min-w-11 items-center justify-center ${locale === currentLocale ? 'font-semibold text-primary-active' : 'text-text-secondary'}`}
            href={pathname}
            locale={locale}
          >
            {locale.toUpperCase()}
          </Link>
        </Fragment>
      ))}
    </div>
  );
}
