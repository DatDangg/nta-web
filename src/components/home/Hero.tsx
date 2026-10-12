import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { HomeImage } from '@/components/shared/HomeImage';

export async function Hero() {
  const t = await getTranslations('home');
  const cta = await getTranslations('common.cta');

  return (
    <section className="bg-background py-12 md:py-16 xl:py-24">
      <Container className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] xl:gap-16">
        <Reveal className="text-center md:text-left">
          <h1 className="text-hero font-bold leading-[1.12] tracking-[-0.02em]">{t('heroTitle')}</h1>
          <p className="mx-auto mt-6 max-w-[65ch] text-body-lg text-text-secondary md:mx-0">{t('heroDescription')}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
            <Link className={buttonStyles('primary', 'lg')} href="/contact">{cta('contact')}</Link>
            <Link className={buttonStyles('outline', 'lg')} href="/solutions/enterprise">{cta('viewSolutions')}</Link>
          </div>
        </Reveal>
        <Reveal>
          <HomeImage
            alt={t('heroImageAlt')}
            className="w-full rounded-lg bg-surface-sunken object-contain"
            height={1902}
            priority
            sizes="(min-width: 768px) 45vw, 100vw"
            src="/images/solutions/v2/enterprise-hero.png"
            width={2656}
          />
        </Reveal>
      </Container>
    </section>
  );
}
