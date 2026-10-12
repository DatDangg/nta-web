import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { HeroVisual } from '@/components/home/HeroVisual';
import type { HomeContent } from '@/content/home';

type HeroProps = {
  panels: HomeContent['heroPanels'];
};

export async function Hero({ panels }: HeroProps) {
  const t = await getTranslations('home');
  const cta = await getTranslations('common.cta');

  return (
    // Nền gradient sáng trắng→xanh nhạt (khớp ảnh mẫu ảnh 2). Overflow-hidden để
    // Ảnh full-bleed phải không tạo scroll ngang.
    <section className="overflow-hidden bg-gradient-to-b from-white via-white to-[#e8f0f3] py-12 md:py-16 xl:py-20">
      {/* Text 42% / ảnh 58% — ảnh lớn tràn mép phải, khớp ảnh mẫu ảnh 2. */}
      <Container className="grid items-center gap-10 md:grid-cols-[0.85fr_1.15fr] xl:gap-12">
        <Reveal className="text-center md:text-left">
          {/* Tiêu đề 2 màu: lead đen + accent teal (ảnh mẫu: "doanh nghiệp Việt" teal).
              Size nhỏ hơn `--text-hero` để 4 dòng split không vượt khung. */}
          <h1 className="text-[clamp(2.5rem,2rem+2.5vw,4.25rem)] font-bold leading-[1.08] tracking-[-0.02em]">
            <span className="block">{t('heroTitleLead')}</span>
            <span className="block text-primary">{t('heroTitleAccent')}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[60ch] text-body-lg text-text-secondary md:mx-0">{t('heroDescription')}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
            <Link className={buttonStyles('primary', 'lg')} href="/contact">
              {cta('contact')}
              <svg aria-hidden className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link className={buttonStyles('outline', 'lg')} href="/solutions/enterprise">{cta('viewSolutions')}</Link>
          </div>
        </Reveal>
        {/* Ảnh tràn ra mép phải section (`hero-bleed-right`), bỏ khung bo góc/nền xám.
            Mobile: ảnh full cột, xếp dưới chữ — margin bleed chỉ áp từ md.
            Panels kính + wordmark NTA nổi trên ảnh (trong HeroVisual), chỉ desktop. */}
        <Reveal className="hero-bleed-right">
          <HeroVisual imageAlt={t('heroImageAlt')} panels={panels} />
        </Reveal>
      </Container>
    </section>
  );
}
