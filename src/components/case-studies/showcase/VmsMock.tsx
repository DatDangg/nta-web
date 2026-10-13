import Image from 'next/image';
import type { CaseStudyShowcase } from '@/content/types';

type Props = { alerts: NonNullable<NonNullable<CaseStudyShowcase['technology']>['alerts']>; tiles: { src: string; alt: string }[] };

/**
 * Màn hình VMS minh hoạ (dựng bằng HTML, `aria-hidden`): cột camera · bản đồ · danh sách cảnh báo.
 * Màu có alpha viết dạng `rgb(... / a)` arbitrary — token màu là `var()` thuần nên modifier `/NN`
 * của Tailwind KHÔNG sinh CSS (bài học change hero-banner round 2).
 */
export function VmsMock({ alerts, tiles }: Props) {
  const [mapTile, ...cameraTiles] = tiles;
  return (
    <div aria-hidden="true" className="mx-auto mt-5 max-w-[560px] sm:mt-7">
      <div className="rounded-xl border-[6px] border-[#1f2937] bg-[#0f172a] p-2 shadow-lg">
        <div className="grid grid-cols-[1fr_2.2fr_1.5fr] gap-1.5">
          <div className="grid gap-1.5">
            {cameraTiles.slice(0, 4).map((tile) => (
              <div className="relative aspect-video overflow-hidden rounded-[3px]" key={tile.src}>
                <Image alt="" className="object-cover" fill sizes="80px" src={tile.src} />
              </div>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-[3px]">
            {mapTile && <Image alt="" className="object-cover saturate-[1.1]" fill sizes="240px" src={mapTile.src} />}
            <span className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgb(33_217_173/0.8)] shadow-[0_0_18px_rgb(33_217_173/0.6)]" />
          </div>
          <ul className="flex flex-col gap-1.5">
            {alerts.map((alert) => (
              <li className="flex items-start gap-1.5 rounded-[3px] bg-white/5 p-1.5" key={alert.title}>
                <span className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-[2px] bg-[#ef4444] text-[8px] font-bold text-white">!</span>
                <span className="min-w-0">
                  <span className="block truncate text-[9px] font-semibold leading-tight text-white sm:text-[10px]">{alert.title}</span>
                  <span className="block truncate text-[8px] leading-tight text-white/60 sm:text-[9px]">{alert.meta}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto h-3 w-10 bg-[#1f2937]" />
      <div className="mx-auto h-1.5 w-28 rounded-full bg-[#1f2937]" />
    </div>
  );
}
