'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { LanguageToggle } from './LanguageToggle';
import { MobileNav } from './MobileNav';

const links = [
  ['products', '/products'], ['caseStudies', '/case-studies'], ['news', '/blog'], ['about', '/about'], ['contact', '/contact'],
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const solutionsButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const t = useTranslations('nav');
  const common = useTranslations('common.cta');

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 0);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  useEffect(() => {
    if (!solutionsOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSolutionsOpen(false);
        solutionsButton.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [solutionsOpen]);

  const routeIsActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const activeLinkClass = (href: string) => routeIsActive(href)
    ? 'relative flex min-h-11 items-center text-sm text-primary after:absolute after:inset-x-0 after:bottom-1 after:h-0.5 after:bg-primary'
    : 'flex min-h-11 items-center text-sm hover:text-primary';

  return (
    <header className={`sticky top-0 z-header border-b border-border transition-[background-color,backdrop-filter] ${scrolled ? 'bg-background/85 backdrop-blur-md' : 'bg-background'}`}>
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link aria-label={t('homeLabel')} className="flex min-h-11 items-center px-2 text-xl font-semibold tracking-tight text-text-primary" href="/">NTA</Link>
        <nav aria-label={t('label')} className="hidden items-center gap-5 lg:flex">
          <div className="group relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSolutionsOpen(false); }} onMouseEnter={() => setSolutionsOpen(true)} onMouseLeave={(event) => { if (!event.currentTarget.contains(document.activeElement)) setSolutionsOpen(false); }}>
            <button aria-expanded={solutionsOpen} aria-haspopup="true" className={`relative flex min-h-11 items-center gap-1 text-sm hover:text-primary ${routeIsActive('/solutions') ? 'text-primary after:absolute after:inset-x-0 after:bottom-1 after:h-0.5 after:bg-primary' : ''}`} onClick={() => setSolutionsOpen(!solutionsOpen)} onFocus={() => setSolutionsOpen(true)} onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); setSolutionsOpen(true); document.getElementById('desktop-solutions-enterprise')?.focus(); } }} ref={solutionsButton} type="button">{t('solutions')}<span aria-hidden="true">⌄</span></button>
            <ul className={`absolute left-0 top-full z-10 min-w-52 rounded-md border border-border bg-background p-2 shadow-md ${solutionsOpen ? 'block' : 'hidden'}`}>
              <li><Link className="block min-h-11 rounded px-3 py-3 hover:bg-background-alt" href="/solutions/enterprise" id="desktop-solutions-enterprise">{t('enterprise')}</Link></li>
              <li><Link className="block min-h-11 rounded px-3 py-3 hover:bg-background-alt" href="/solutions/ai">{t('ai')}</Link></li>
            </ul>
          </div>
          {links.map(([key, href]) => <Link aria-current={routeIsActive(href) ? 'page' : undefined} className={activeLinkClass(href)} href={href} key={key}>{t(key)}</Link>)}
        </nav>
        <div className="hidden items-center gap-4 lg:flex"><LanguageToggle /><Link className={`${buttonStyles('primary', 'sm')} whitespace-nowrap`} href="/contact">{common('contact')}</Link></div>
        <MobileNav />
      </div>
    </header>
  );
}
