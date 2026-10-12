import Image from 'next/image';
import { Breadcrumb, type BreadcrumbItem } from '@/components/shared/Breadcrumb';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import type { CaseStudyShowcase } from '@/content/types';
import { ArrowRight, Eyebrow } from './icons';

type Props = { hero: CaseStudyShowcase['hero']; breadcrumbs: BreadcrumbItem[] };

/**
 * Hero landing case study (ảnh mẫu Óc Eo): chữ trái, ảnh lớn bo góc bên phải.
 * Mobile: chữ trước, ảnh xếp dưới. Nền gradient teal rất nhạt + chấm trang trí.
 */
export function ShowcaseHero({ hero, breadcrumbs }: Props) {
  const isAnchor = hero.primaryCta.href.startsWith('#');
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#effaf7] via-white to-white pb-10 pt-8 md:pb-14 lg:pt-10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-40 -z-10 size-72 rounded-full bg-[radial-gradient(circle,rgb(0_158_135/0.10),transparent_70%)]" />
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,11fr)_minmax(0,13fr)] lg:gap-10">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <div className="mt-4"><Eyebrow>{hero.eyebrow}</Eyebrow></div>
          <h1 className="mt-5 text-[clamp(2rem,1.3rem+2vw,3rem)] font-bold leading-[1.15] tracking-[-0.02em] text-text-primary">
            <span className="block">{hero.titleLead}</span>
            <span className="block bg-gradient-to-r from-[#0fa3b1] via-[#0b9488] to-[#0d9a6c] bg-clip-text pb-[0.06em] text-transparent">{hero.titleAccent}</span>
          </h1>
          <p className="mt-4 text-lg font-semibold text-text-primary">{hero.subtitle}</p>
          <p className="mt-3 max-w-[56ch] leading-relaxed text-text-secondary">{hero.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a className={`${buttonStyles('primary', 'lg')} gap-2 shadow-[0_10px_24px_rgb(0_158_135/0.28)]`} href={hero.primaryCta.href} {...(isAnchor ? {} : { rel: 'noopener' })}>
              {hero.primaryCta.label}
              <ArrowRight />
            </a>
            {hero.video && (
              <a className="group inline-flex min-h-11 items-center gap-3 font-medium text-text-primary" href={hero.video.href} rel="noopener noreferrer" target="_blank">
                <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-primary shadow-sm transition-colors group-hover:border-primary">
                  <svg className="ml-0.5 size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5-13-7.5Z" /></svg>
                </span>
                {hero.video.label}
              </a>
            )}
          </div>
        </div>
        <div className="relative">
          <Image
            alt={hero.image.alt}
            className="h-auto w-full rounded-[28px] object-cover shadow-lg"
            height={989}
            priority
            sizes="(min-width: 1280px) 720px, (min-width: 1024px) 58vw, 100vw"
            src={hero.image.src}
            width={1590}
          />
        </div>
      </Container>
    </section>
  );
}
