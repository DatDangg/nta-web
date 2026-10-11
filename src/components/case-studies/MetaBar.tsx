import type { CaseStudy } from '@/content/types';
import { Container } from '@/components/ui/Container';

type MetaBarProps = { caseStudy: CaseStudy; labels: { client: string; sector: string; year: string } };

/**
 * Thanh metadata (khách hàng · ngành · năm).
 *
 * `border-y` đặt BÊN TRONG `Container` mặc định 1280 → mép đường kẻ khớp mép nội dung của
 * các khối bên dưới ("Thách thức" · "Giải pháp"). Nội dung trong kẻ giới hạn 720px, bám trái.
 */
export function MetaBar({ caseStudy, labels }: MetaBarProps) {
  return (
    <Container as="dl" className="border-y border-border py-6">
      <div className="grid max-w-[720px] grid-cols-1 gap-4 sm:grid-cols-3 md:flex md:flex-wrap md:gap-8">
        {[
          { label: labels.client, value: caseStudy.client },
          { label: labels.sector, value: caseStudy.sector },
          { label: labels.year, value: String(caseStudy.year) },
        ]
          .filter((item) => item.value)
          .map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-sm text-text-secondary">{item.label}</dt>
              <dd className="mt-1 font-medium text-text-primary">{item.value}</dd>
            </div>
          ))}
      </div>
    </Container>
  );
}