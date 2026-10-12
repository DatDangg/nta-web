import type { BreadcrumbItem } from '@/components/shared/Breadcrumb';
import type { CaseStudyShowcase } from '@/content/types';
import { ShowcaseCTA } from './ShowcaseCTA';
import { ShowcaseHero } from './ShowcaseHero';
import { ShowcaseOverview } from './ShowcaseOverview';
import { ShowcasePhotos } from './ShowcasePhotos';
import { ShowcaseTechnology } from './ShowcaseTechnology';
import { ShowcaseVision } from './ShowcaseVision';

type Props = { showcase: CaseStudyShowcase; breadcrumbs: BreadcrumbItem[] };

/** Bố cục `layout: showcase` cho trang chi tiết case study (ảnh mẫu Óc Eo – Ba Thê). */
export function ShowcaseLayout({ showcase, breadcrumbs }: Props) {
  return (
    <>
      <ShowcaseHero breadcrumbs={breadcrumbs} hero={showcase.hero} />
      <ShowcaseOverview pillars={showcase.pillars} stats={showcase.stats} />
      <div className="bg-gradient-to-b from-white via-[#f6fbfa] to-white">
        <ShowcaseTechnology technology={showcase.technology} tiles={showcase.photos.items} />
      </div>
      <ShowcasePhotos photos={showcase.photos} />
      <ShowcaseVision vision={showcase.vision} />
      <ShowcaseCTA cta={showcase.cta} />
    </>
  );
}
