import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { HeroBackground, HeroMobileImage } from '@/components/home/HeroVisual';
import type { HomeContent } from '@/content/home';

type HeroProps = {
  panels: HomeContent['heroPanels'];
};

export async function Hero({ panels }: HeroProps) {
  const t = await getTranslations('home');
  const cta = await getTranslations('common.cta');

  return (
    // Desktop (lg+): toàn bộ ảnh hero-banner làm NỀN full-bleed của section, chữ HTML nằm bên trái
    // trên vùng thành phố đã được phủ trắng mờ (khớp ảnh mẫu). Panel kính nằm trên ảnh (HeroBackground).
    // Mobile/tablet (< lg): chữ trên nền trắng, ảnh xếp bên dưới.
    <section className="relative isolate overflow-hidden bg-white lg:flex lg:h-[clamp(540px,46vw,820px)] lg:items-center">
      <HeroBackground imageAlt={t('heroImageAlt')} panels={panels} />

      <Container className="relative z-10 w-full py-12 md:py-16 lg:py-0">
        <Reveal className="text-center md:text-left lg:max-w-[40%] xl:max-w-[44%]">
          {/* Tiêu đề 2 phần: lead đen + accent gradient teal→xanh lá (ảnh mẫu: "doanh nghiệp Việt"). */}
          <h1 className="text-[clamp(2.5rem,0.5rem+4.4vw,5.75rem)] font-bold leading-[1.05] tracking-[-0.03em] text-text-primary">
            <span className="block">{t('heroTitleLead')}</span>
            <span className="block bg-gradient-to-r from-[#0fa3b1] via-[#0b9488] to-[#0d9a6c] bg-clip-text pb-[0.08em] text-transparent [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
              {t('heroTitleAccent')}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[48ch] text-body-lg text-text-secondary md:mx-0">{t('heroDescription')}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
            <Link className={`${buttonStyles('primary', 'lg')} rounded-full shadow-[0_10px_24px_rgb(0_158_135/0.28)]`} href="/contact">
              {cta('contact')}
              <svg aria-hidden className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link className={`${buttonStyles('outline', 'lg')} rounded-full bg-white/80 backdrop-blur-sm`} href="/solutions/enterprise">
              {cta('viewSolutions')}
            </Link>
          </div>
        </Reveal>
      </Container>

      <HeroMobileImage imageAlt={t('heroImageAlt')} />
    </section>
  );
}
