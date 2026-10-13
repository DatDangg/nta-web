import type { CSSProperties } from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { AccentText, HeroWaves } from '@/components/listing/ListingHero';
import { ListingIcon, type ListingIconName } from '@/components/listing/icons';
import { SplitText } from '@/components/motion/SplitText';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { Container } from '@/components/ui/Container';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

const STATS: { key: 'projects' | 'partners' | 'satisfaction'; icon: ListingIconName }[] = [
  { key: 'projects', icon: 'users' },
  { key: 'partners', icon: 'building' },
  { key: 'satisfaction', icon: 'smile' },
];

/**
 * Hero trang /about theo mockup CR-014: trái = breadcrumb pill, "Về NTA", tagline, mô tả, 3 chỉ số;
 * phải = ảnh thật tòa Kim Hoàn. Khác ListingHero: ảnh là nội dung (không chỉ trang trí) nên
 * vẫn hiện ở mobile, xếp dưới chữ.
 */
export async function AboutHero() {
  const t = await getTranslations('about');

  return (
    <div className="relative isolate bg-[#f7fbfb]">
      <HeroWaves className="h-[720px]" />
      <header className="pb-12 pt-8 md:pb-16 lg:pt-10">
        <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0">
            <div className="motion-load" data-motion-off style={delay(0)}>
              <Breadcrumb items={[{ label: t('title') }]} variant="pill" />
            </div>
            <h1 className="mt-7 text-[clamp(2.5rem,1.6rem+3.4vw,4.25rem)] font-bold leading-[1.05] tracking-[-0.03em] text-text-primary" data-motion-off>
              <SplitText text={t('hero.titleLead')} /> <AccentText>{t('hero.titleAccent')}</AccentText>
            </h1>
            <p className="motion-load mt-3 text-[clamp(1.625rem,1.15rem+1.9vw,2.6rem)] font-bold leading-[1.15] tracking-[-0.02em] text-text-primary" data-motion-off style={delay(200)}>
              {t('hero.tagline')}
            </p>
            <p className="motion-load mt-5 max-w-[62ch] text-body-lg leading-relaxed text-text-secondary" data-motion-off style={delay(350)}>
              {t('hero.description')}
            </p>
            <ul className="motion-load mt-8 grid gap-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[#cdeee6]" data-motion-off style={delay(500)}>
              {STATS.map((stat) => (
                <li className="flex items-center gap-3.5 sm:px-4 sm:first:pl-0" key={stat.key}>
                  <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#cdeee6] bg-white/90 text-primary shadow-[0_8px_20px_-10px_rgb(0_158_135/0.55)]">
                    <ListingIcon className="size-6" name={stat.icon} strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-2xl font-bold leading-tight text-text-primary">{t(`stats.${stat.key}.value`)}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-text-secondary">{t(`stats.${stat.key}.label`)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="motion-load relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-[0_30px_60px_-30px_rgb(15_60_70/0.45)]" data-motion-off style={delay(300)}>
            <Image
              alt={t('hero.imageAlt')}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1280px) 560px, (min-width: 1024px) 45vw, 100vw"
              src="/images/about/building-kim-hoan.webp"
            />
          </div>
        </Container>
      </header>
    </div>
  );
}
