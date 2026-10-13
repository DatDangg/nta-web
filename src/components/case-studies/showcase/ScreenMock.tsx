import Image from 'next/image';
import type { CaseStudyShowcase } from '@/content/types';

type Props = { screen: NonNullable<NonNullable<CaseStudyShowcase['technology']>['screen']> };

/**
 * Màn hình (cùng khung với VmsMock) chứa ảnh chụp giao diện phần mềm thật (vd DentGo) — dùng thay VmsMock khi
 * case study có `technology.screen`. Ảnh có alt riêng (không `aria-hidden` như VmsMock dựng HTML).
 */
export function ScreenMock({ screen }: Props) {
  return (
    <div className="mx-auto mt-5 max-w-[580px] sm:mt-7">
      <div className="overflow-hidden rounded-xl border-[6px] border-[#1f2937] bg-white shadow-lg">
        <Image alt={screen.alt} className="h-auto w-full" height={screen.height} sizes="(min-width: 1024px) 580px, 92vw" src={screen.src} width={screen.width} />
      </div>
      <div aria-hidden="true" className="mx-auto h-3 w-10 bg-[#1f2937]" />
      <div aria-hidden="true" className="mx-auto h-1.5 w-28 rounded-full bg-[#1f2937]" />
    </div>
  );
}
