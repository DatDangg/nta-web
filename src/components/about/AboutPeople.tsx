import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { AccentText } from '@/components/listing/ListingHero';
import { ListingIcon } from '@/components/listing/icons';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';

/**
 * Khối "Con người NTA" (CR-014): ảnh đội ngũ trái, giới thiệu + nút cuộn tới TeamGrid (`#team`) phải.
 * Ảnh `team-people-temp.webp` là ảnh AI TẠM cắt từ mockup (794×267) — thay ảnh đội ngũ thật sau.
 */
export async function AboutPeople() {
  const t = await getTranslations('about');

  return (
    <Section className="!pt-0">
      <Reveal className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
        <div className="relative h-[220px] w-full min-w-0 overflow-hidden rounded-[24px] shadow-[0_24px_50px_-30px_rgb(15_60_70/0.45)] sm:h-[280px] lg:h-[320px]">
          <Image
            alt={t('people.imageAlt')}
            className="object-cover"
            fill
            sizes="(min-width: 1280px) 680px, (min-width: 1024px) 55vw, 100vw"
            src="/images/about/team-people-temp.webp"
          />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <span aria-hidden="true" className="text-lg leading-none text-text-secondary/70">›</span>
            {t('people.eyebrow')}
          </p>
          <h2 className="mt-4 text-[clamp(1.6rem,1.25rem+1.3vw,2.1rem)] font-bold leading-[1.25] tracking-[-0.02em] text-text-primary">
            {t('people.titleLead')} <AccentText>{t('people.titleAccent')}</AccentText>
          </h2>
          <p className="mt-4 max-w-[62ch] leading-relaxed text-text-secondary">{t('people.description')}</p>
          <a className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full border border-primary px-6 text-sm font-semibold text-primary transition-colors hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus" href="#team">
            {t('people.cta')}
            <ListingIcon className="size-4" name="arrow" strokeWidth={2} />
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
