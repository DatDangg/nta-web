import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CapabilityGrid } from '@/components/about/CapabilityGrid';
import { MilestoneTimeline } from '@/components/about/MilestoneTimeline';
import { MissionBlock } from '@/components/about/MissionBlock';
import { PartnerLogos } from '@/components/about/PartnerLogos';
import { TeamGrid } from '@/components/about/TeamGrid';
import { CTABanner } from '@/components/shared/CTABanner';
import { PageHeader } from '@/components/shared/PageHeader';
import { getAboutData } from '@/lib/content/about';
import type { Locale } from '@/content/types';

const aboutMetadata: Record<Locale, { title: string; description: string }> = {
  vi: {
    title: 'Về NTA | NTA',
    description: 'Tìm hiểu về NTA và năng lực phát triển giải pháp doanh nghiệp, trí tuệ nhân tạo cùng ứng dụng di động thực tế cho doanh nghiệp và tổ chức tại Việt Nam.',
  },
  en: {
    title: 'About NTA | NTA',
    description: 'Learn about NTA and our expertise in enterprise solutions, artificial intelligence and practical mobile apps for businesses and organizations across Vietnam.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  const metadata = aboutMetadata[locale];
  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      languages: {
        vi: 'https://ntasolution.vn/about',
        en: 'https://ntasolution.vn/en/about',
        'x-default': 'https://ntasolution.vn/about',
      },
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  setRequestLocale(locale);
  const [t, about] = await Promise.all([getTranslations('about'), getAboutData(locale)]);
  if (!about) notFound();

  const team = about.team.map((member, index) => ({
    ...member,
    name: t.has(`team.${index === 0 ? 'consulting' : 'product'}.name`)
      ? t(`team.${index === 0 ? 'consulting' : 'product'}.name`)
      : member.name,
    role: t.has(`team.${index === 0 ? 'consulting' : 'product'}.role`)
      ? t(`team.${index === 0 ? 'consulting' : 'product'}.role`)
      : member.role,
  }));

  return (
    <>
      <PageHeader breadcrumbs={[{ label: t('title') }]} description={t('description')} title={t('title')} variant="centered" />
      <MissionBlock mission={about.mission} title={t('missionTitle')} />
      <CapabilityGrid capabilities={about.capabilities} title={t('capabilitiesTitle')} />
      <TeamGrid fallback={t('imageFallback')} members={team} title={t('teamTitle')} />
      <MilestoneTimeline milestones={about.milestones} title={t('milestonesTitle')} />
      <PartnerLogos partners={about.partners} title={t('partnersTitle')} />
      <CTABanner description={t('ctaDescription')} title={t('ctaTitle')} variant="alt" />
    </>
  );
}
