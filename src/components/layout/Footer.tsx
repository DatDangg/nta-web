import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { LanguageToggle } from './LanguageToggle';

const columns = [
  { title: 'aboutGroup', links: [['about', '/about']] },
  { title: 'solutionsGroup', links: [['enterprise', '/solutions/enterprise'], ['ai', '/solutions/ai']] },
  { title: 'contentGroup', links: [['products', '/products'], ['caseStudies', '/case-studies'], ['news', '/blog']] },
] as const;

export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const common = useTranslations('common.cta');
  return (
    <footer className="bg-background-alt">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => <section key={column.title}><h2 className="mb-4 text-base font-semibold">{t(column.title)}</h2><ul className="space-y-3">{column.links.map(([key, href]) => <li key={key}><Link className="text-sm text-text-secondary hover:text-primary" href={href}>{nav(key)}</Link></li>)}</ul></section>)}
          <section><h2 className="mb-4 text-base font-semibold">{t('contactGroup')}</h2><address className="space-y-3 text-sm not-italic text-text-secondary"><p>{t('hotline')}</p><p>{t('email')}</p></address><div className="mt-4 flex items-center gap-4"><a aria-label="Facebook" className="flex size-11 items-center justify-center text-text-primary" href="https://www.facebook.com/" rel="noreferrer"><svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8h3.4Z" /></svg></a><LanguageToggle /></div></section>
        </div>
        <div className="mt-12 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="mb-3 max-w-sm text-sm text-text-secondary">{t('ctaText')}</p><Link className={buttonStyles('primary', 'sm')} href="/contact">{common('contact')}</Link></div>
          <div className="text-sm text-text-secondary"><p>{t('copyright')}</p><Link className="mt-2 inline-block hover:text-primary" href="/privacy">{t('privacy')}</Link></div>
        </div>
      </div>
    </footer>
  );
}
