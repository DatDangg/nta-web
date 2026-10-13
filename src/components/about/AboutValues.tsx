import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { AccentText } from '@/components/listing/ListingHero';
import { ListingIcon, type ListingIconName } from '@/components/listing/icons';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';

function ValueCard({ icon, title, children }: { icon: ListingIconName; title: string; children: ReactNode }) {
  return (
    <article className="h-full rounded-[20px] border border-[#cdeee6] bg-white/80 p-6 shadow-[0_18px_40px_-28px_rgb(15_60_70/0.35)]">
      <div className="flex items-center gap-3">
        <ListingIcon className="size-7 shrink-0 text-primary" name={icon} strokeWidth={2} />
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="mt-4 text-[0.9375rem] leading-relaxed text-text-secondary">{children}</div>
    </article>
  );
}

/** Khối "Sứ mệnh của chúng tôi" (CR-014): trái eyebrow + H2, phải 3 thẻ Sứ mệnh · Tầm nhìn · Giá trị cốt lõi. */
export async function AboutValues() {
  const t = await getTranslations('about');
  const coreItems: string[] = t.raw('values.core.items');

  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] lg:items-center lg:gap-8">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <span aria-hidden="true" className="text-lg leading-none text-text-secondary/70">›</span>
            {t('missionTitle')}
          </p>
          <h2 className="mt-4 text-[clamp(1.75rem,1.3rem+1.6vw,2.4rem)] font-bold leading-[1.2] tracking-[-0.02em] text-text-primary">
            {t('values.titleLead')} <AccentText>{t('values.titleAccent')}</AccentText>
          </h2>
        </div>
        <Reveal className="grid gap-5 md:grid-cols-3" stagger>
          <ValueCard icon="target" title={t('values.mission.title')}>
            <p>{t('values.mission.text')}</p>
          </ValueCard>
          <ValueCard icon="eye" title={t('values.vision.title')}>
            <p>{t('values.vision.text')}</p>
          </ValueCard>
          <ValueCard icon="gem" title={t('values.core.title')}>
            <ul className="space-y-2">
              {coreItems.map((item) => (
                <li className="flex items-start gap-2.5" key={item}>
                  <span aria-hidden="true" className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </ValueCard>
        </Reveal>
      </div>
    </Section>
  );
}
