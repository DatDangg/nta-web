import type { CaseStudy } from '@/content/types';

type MetaBarProps = { caseStudy: CaseStudy; labels: { client: string; sector: string; year: string } };

/**
 * Thanh metadata (khách hàng · ngành · năm).
 *
 * Đường kẻ trên/dưới nằm TRONG khối `prose` 720px để khớp mép với các khối chữ bên dưới
 * ("Thách thức" · "Giải pháp"). Nếu đặt `border-y` lên `Container` 1280 thì đường kẻ sẽ
 * dài hơn nội dung, nhìn lệch. Ở mobile (<1024px) 720px vượt khung nên `max-w` không có tác dụng,
 * kẻ vẫn khớp mép.
 */
export function MetaBar({ caseStudy, labels }: MetaBarProps) {
  return (
    <dl className="max-w-[720px] border-y border-border px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:flex md:flex-wrap md:gap-8">
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
    </dl>
  );
}