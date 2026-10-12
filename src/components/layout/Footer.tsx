import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/Container';
import { BrandLogo } from './BrandLogo';
import { LanguageToggle } from './LanguageToggle';

const SOCIALS = [
  {
    id: 'facebook',
    href: 'https://www.facebook.com/',
    path: 'M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8h3.4Z',
  },
  {
    id: 'linkedin',
    href: 'https://www.linkedin.com/company/nta-solution',
    path: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM10 9h3.8v1.7h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.1c0-1.22-.02-2.8-1.7-2.8-1.7 0-1.96 1.33-1.96 2.7V21h-4z',
  },
  {
    id: 'youtube',
    href: 'https://www.youtube.com/',
    path: 'M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.5a2.5 2.5 0 0 0 1.8-1.8C23 15.2 23 12 23 12ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z',
  },
] as const;

type SocialLabels = Record<(typeof SOCIALS)[number]['id'], string>;
type Column = { title: string; links: { href: string; label: string }[] };

function FooterBrand({ homeLabel, labels, tagline }: { homeLabel: string; labels: SocialLabels; tagline: string }) {
  return (
    <div className="sm:col-span-2 lg:col-span-3">
      <Link aria-label={homeLabel} className="inline-flex" href="/"><BrandLogo /></Link>
      <p className="mt-4 max-w-xs text-sm text-text-secondary">{tagline}</p>
      <div className="mt-6 flex items-center gap-3">
        {SOCIALS.map(({ id, href, path }) => (
          <a
            aria-label={labels[id]}
            className="flex size-11 items-center justify-center rounded-full bg-background-alt text-text-primary transition-colors duration-fast ease-out-expo hover:text-primary-active"
            href={href}
            key={id}
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d={path} /></svg>
          </a>
        ))}
      </div>
    </div>
  );
}

function FooterLinks({ columns }: { columns: Column[] }) {
  return (
    <div className="sm:col-span-2 lg:col-span-6 lg:border-l lg:border-border lg:pl-8">
      <div className="grid gap-8 sm:grid-cols-3">
        {columns.map((column) => (
          <section key={column.title}>
            <h2 className="text-base font-semibold">{column.title}</h2>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link className="text-sm text-text-secondary hover:text-primary-active" href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function SupportCard({ title, link }: { title: string; link: string }) {
  return (
    <div className="sm:col-span-2 lg:col-span-3 lg:self-center">
      <Link className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm transition-shadow duration-fast hover:shadow-md" href="/contact">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-active">
          <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
            <path d="M21 14a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2Z" />
            <path d="M3 14a2 2 0 0 1 2-2h1v6H5a2 2 0 0 1-2-2v-2Z" />
          </svg>
        </span>
        <span className="flex-1">
          <span className="block font-semibold text-text-primary">{title}</span>
          <span className="block text-sm text-text-secondary">{link}</span>
        </span>
        <svg aria-hidden="true" className="size-5 shrink-0 text-primary-active" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}

/**
 * Footer toàn site (VI+EN): nền ảnh sáng trang trí (`footer-bg.jpg`, `alt=""` + `aria-hidden`)
 * phủ trên `bg-background`, cột thương hiệu (logo + tagline + social), 3 cột link, card hỗ trợ
 * dẫn `/contact`, thanh legal (copyright + `LanguageToggle`).
 *
 * `Container` là nguồn bề rộng duy nhất — KHÔNG đặt `px-*` ở `<footer>`. Chỉ link tới route
 * đã tồn tại (mục không có trang trong ảnh goal đã lược bỏ).
 */
export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const columns: Column[] = [
    {
      title: t('aboutGroup'),
      links: [
        { href: '/about', label: t('intro') },
        { href: '/contact', label: nav('contact') },
      ],
    },
    {
      title: t('solutionsGroup'),
      links: [
        { href: '/solutions/enterprise', label: nav('enterprise') },
        { href: '/solutions/ai', label: nav('ai') },
        { href: '/products', label: t('aiApps') },
        { href: '/case-studies', label: nav('caseStudies') },
      ],
    },
    {
      title: t('contentGroup'),
      links: [
        { href: '/products', label: nav('products') },
        { href: '/blog', label: nav('news') },
      ],
    },
  ];
  const socialLabels: SocialLabels = {
    facebook: t('socialFacebook'),
    linkedin: t('socialLinkedIn'),
    youtube: t('socialYouTube'),
  };

  return (
    <footer className="relative overflow-hidden bg-background">
      <Image alt="" aria-hidden className="object-cover" fill sizes="100vw" src="/images/home/footer-bg.jpg" />
      <Container className="relative py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8">
          <FooterBrand homeLabel={nav('homeLabel')} labels={socialLabels} tagline={t('tagline')} />
          <FooterLinks columns={columns} />
          <SupportCard link={t('supportLink')} title={t('supportTitle')} />
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">{t('copyright')}</p>
          <LanguageToggle />
        </div>
      </Container>
    </footer>
  );
}
