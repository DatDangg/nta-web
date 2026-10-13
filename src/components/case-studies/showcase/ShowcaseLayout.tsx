import { Container } from '@/components/ui/Container';
import type { BreadcrumbItem } from '@/components/shared/Breadcrumb';
import type { CaseStudyShowcase } from '@/content/types';
import type { GlassTile } from '@/components/listing/GlassVisual';
import { ShowcaseCTA } from './ShowcaseCTA';
import { ShowcaseFaq } from './ShowcaseFaq';
import { ShowcaseFeatures } from './ShowcaseFeatures';
import { ShowcaseHero } from './ShowcaseHero';
import { ShowcaseOverview } from './ShowcaseOverview';
import { ShowcasePhotos } from './ShowcasePhotos';
import { ShowcaseTechnology } from './ShowcaseTechnology';
import { ShowcaseVision } from './ShowcaseVision';

type Props = { showcase: CaseStudyShowcase; breadcrumbs: BreadcrumbItem[]; tiles?: GlassTile[] };

/** Bố cục `layout: showcase` cho trang chi tiết case study (ảnh mẫu Óc Eo – Ba Thê). */
export function ShowcaseLayout({ showcase, breadcrumbs, tiles }: Props) {
  return (
    <>
      <ShowcaseHero breadcrumbs={breadcrumbs} hero={showcase.hero} tiles={tiles} />
      <ShowcaseOverview pillars={showcase.pillars} stats={showcase.stats} />
      {showcase.note && (
        <Container>
          <p className="-mt-4 mb-6 text-xs leading-relaxed text-text-secondary md:-mt-6">{showcase.note}</p>
        </Container>
      )}
      <div className="bg-gradient-to-b from-white via-[#f6fbfa] to-white">
        <ShowcaseTechnology technology={showcase.technology} tiles={showcase.photos.items} />
      </div>
      <ShowcasePhotos photos={showcase.photos} />
      <ShowcaseVision vision={showcase.vision} />
      {showcase.features && <ShowcaseFeatures features={showcase.features} />}
      {showcase.faq && <ShowcaseFaq faq={showcase.faq} />}
      <ShowcaseCTA cta={showcase.cta} />
    </>
  );
}
