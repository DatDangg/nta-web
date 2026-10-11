import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

interface CTABannerProps {
  title: string;
  description: string;
  variant?: 'primary' | 'alt';
  href?: string;
}

export function CTABanner({ title, description, variant = 'primary', href = '/contact' }: CTABannerProps) {
  const t = useTranslations('common.cta');
  const primary = variant === 'primary';

  // Padding nằm trong <Container>, KHÔNG đặt px-* ở <section>: nếu không sẽ cộng dồn
  // (section px-4 + container px-4) và lệch so với mọi section khác trên site.
  return (
    <section className={`py-12 md:py-16 ${primary ? 'bg-primary text-text-inverse' : 'bg-background-alt text-text-primary'}`}>
      <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-h2 font-bold leading-tight">{title}</h2>
          <p className={`mt-3 text-body-lg ${primary ? 'text-text-inverse' : 'text-text-secondary'}`}>{description}</p>
        </div>
        <Link className={`${buttonStyles(primary ? 'inverse' : 'primary', 'md')} shrink-0 whitespace-nowrap`} href={href}>{t('contact')}</Link>
      </Container>
    </section>
  );
}