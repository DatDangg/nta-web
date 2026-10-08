import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';

interface CTABannerProps {
  title: string;
  description: string;
  variant?: 'primary' | 'alt';
  href?: string;
}

export function CTABanner({ title, description, variant = 'primary', href = '/contact' }: CTABannerProps) {
  const t = useTranslations('common.cta');
  const primary = variant === 'primary';

  return (
    <section className={`px-4 py-12 md:py-16 ${primary ? 'bg-primary text-text-inverse' : 'bg-background-alt text-text-primary'}`}>
      <div className="mx-auto flex w-full max-w-container flex-col items-start gap-6 sm:px-2 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-h2 font-bold leading-tight">{title}</h2>
          <p className={`mt-3 text-body-lg ${primary ? 'text-text-inverse' : 'text-text-secondary'}`}>{description}</p>
        </div>
        <Link className={`${buttonStyles(primary ? 'inverse' : 'primary', 'md')} shrink-0 whitespace-nowrap`} href={href}>{t('contact')}</Link>
      </div>
    </section>
  );
}
