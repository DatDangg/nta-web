import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { FocusMain } from '@/components/shared/FocusMain';
import { SplitText } from '@/components/motion/SplitText';

// Metadata tĩnh, KHÔNG gọi next-intl: slug sai dưới /en/* (ISR on-demand) resolve metadata not-found khi cache locale
// còn trống → getTranslations() rơi về headers() → "static to dynamic" → 500 (CR-026/CR-032). Thân trang vẫn dịch theo locale.
export const metadata: Metadata = {
  title: { absolute: '404 | NTA' },
  robots: { index: false, follow: false },
};

export default async function NotFoundPage() {
  const t = await getTranslations('notFound');
  const nav = await getTranslations('nav');
  const suggestions = [
    ['solutions', '/solutions/enterprise'],
    ['caseStudies', '/case-studies'],
    ['news', '/blog'],
    ['contact', '/contact'],
  ] as const;

  return (
    <section className="mx-auto flex min-h-[50vh] min-h-[50dvh] max-w-[560px] flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <FocusMain />
      <h1 className="text-display font-semibold tracking-tight text-text-primary" data-motion-off><SplitText text={t('heading')} /></h1>
      <p className="mt-4 max-w-[48ch] text-base leading-7 text-text-secondary">{t('message')}</p>
      <Link className={`${buttonStyles('primary', 'lg')} mt-8 w-full md:w-auto`} href="/">
        {t('homeLink')}
      </Link>
      <nav aria-label={t('suggestionsLabel')} className="mt-10 w-full">
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {suggestions.map(([key, href]) => (
            <li key={key}>
              <Link className="flex min-h-11 items-center justify-center rounded-md px-3 text-text-secondary underline-offset-4 hover:text-primary hover:underline" href={href}>
                {nav(key)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
