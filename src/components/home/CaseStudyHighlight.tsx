import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/ui/Reveal';
import { HomeImage } from '@/components/shared/HomeImage';

type FeaturedStudy = {
  title: string;
  description: string;
  href: string;
  image: string;
  alt: string;
};

export async function CaseStudyHighlight({ study, title }: { study: FeaturedStudy; title: string }) {
  const t = await getTranslations('common.cta');
  return (
    <section className="bg-background-alt py-12 md:py-16 xl:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="mb-8 text-h2 font-bold leading-tight">{title}</h2>
          <article className="grid overflow-hidden rounded-lg bg-background md:grid-cols-2">
            <HomeImage alt={study.alt} className="aspect-[16/10] h-full w-full bg-surface-sunken object-cover" sizes="(min-width: 768px) 50vw, 100vw" src={study.image} />
            <div className="flex flex-col items-start justify-center p-6 md:p-8 xl:p-12">
              <h3 className="text-h3 font-semibold leading-tight">{study.title}</h3>
              <p className="mt-4 text-text-secondary">{study.description}</p>
              <Link className="mt-5 inline-flex min-h-11 items-center text-primary underline-offset-4 hover:underline" href={study.href.replace(/^\/en(?=\/)/, '')}>{t('viewCaseStudies')}</Link>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
