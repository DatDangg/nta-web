'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { LanguageToggle } from './LanguageToggle';

const items = [
  ['products', '/products'], ['caseStudies', '/case-studies'], ['news', '/blog'], ['about', '/about'], ['contact', '/contact'],
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const t = useTranslations('nav');
  const common = useTranslations('common.cta');

  useEffect(() => {
    if (!open) return;
    const focusables = () => panel.current?.querySelectorAll<HTMLElement>('a, button');
    focusables()?.[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
      if (event.key === 'Tab') {
        const elements = focusables();
        if (!elements?.length) return;
        if (event.shiftKey && (document.activeElement === elements[0] || !panel.current?.contains(document.activeElement))) { event.preventDefault(); elements[elements.length - 1].focus(); }
        if (!event.shiftKey && (document.activeElement === elements[elements.length - 1] || !panel.current?.contains(document.activeElement))) { event.preventDefault(); elements[0].focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return <>
    <button aria-controls="mobile-navigation" aria-expanded={open} aria-label={open ? t('closeMenu') : t('openMenu')} className="flex size-11 items-center justify-center rounded-full lg:hidden" onClick={() => setOpen(!open)} ref={trigger} type="button"><span aria-hidden="true" className="text-2xl">{open ? '×' : '☰'}</span></button>
    <div aria-hidden={!open} className={`fixed inset-0 z-drawer overflow-hidden lg:hidden ${open ? '' : 'pointer-events-none'}`}>
      <button aria-label={t('closeMenu')} className={`absolute inset-0 bg-overlay transition-opacity duration-base ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => { setOpen(false); trigger.current?.focus(); }} tabIndex={-1} type="button" />
      <div aria-label={t('label')} aria-modal="true" className={`absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col bg-background p-6 shadow-md transition-transform duration-base ${open ? 'translate-x-0' : 'translate-x-full'}`} id="mobile-navigation" inert={open ? undefined : true} ref={panel} role="dialog">
        <div className="mb-6 flex justify-end"><button aria-label={t('closeMenu')} className="min-h-11 min-w-11 rounded-full" onClick={() => { setOpen(false); trigger.current?.focus(); }} type="button">×</button></div>
        <nav aria-label={t('label')} className="flex flex-col"><div className="border-b border-border py-2"><p className="flex min-h-11 items-center">{t('solutions')}</p><Link className="flex min-h-11 items-center pl-4 text-sm text-text-secondary" href="/solutions/enterprise">{t('enterprise')}</Link><Link className="flex min-h-11 items-center pl-4 text-sm text-text-secondary" href="/solutions/ai">{t('ai')}</Link></div>{items.map(([key, href]) => <Link className="flex min-h-11 items-center border-b border-border py-2" href={href} key={key}>{t(key)}</Link>)}</nav>
        <div className="mt-6"><LanguageToggle /></div>
        <Link className={`mt-6 w-full ${buttonStyles('primary', 'sm')}`} href="/contact">{common('contact')}</Link>
      </div>
    </div>
  </>;
}
