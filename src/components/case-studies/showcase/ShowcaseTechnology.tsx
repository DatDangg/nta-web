import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import type { CaseStudyShowcase, ShowcaseNodeIcon } from '@/content/types';
import { ArrowRight, Eyebrow } from './icons';
import { ScreenMock } from './ScreenMock';
import { VmsMock } from './VmsMock';

type Props = { technology: NonNullable<CaseStudyShowcase['technology']>; tiles: { src: string; alt: string }[] };

const NODE_ICONS: Record<ShowcaseNodeIcon, ReactNode> = {
  // Camera cố định
  camera: <path d="M3 7h12l4 3-4 3H3V7Zm4 6v4M4 17h6" />,
  // Flycam
  drone: <path d="M5 6h4M15 6h4M7 6v2M17 6v2M8 10h8l-1.5 4h-5L8 10Zm4 4v2m-4-6-2-2m12 2 2-2" />,
  // Màn VMS
  vms: <path d="M3 5h18v11H3V5Zm6 15h6m-3-4v4M7 12l3-3 2 2 4-4" />,
  // Lịch hẹn
  calendar: <path d="M4 6h16v14H4V6Zm0 4h16M8 3v4m8-4v4m-8 7h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />,
  // Hồ sơ bệnh án
  records: <path d="M7 3h7l4 4v14H7V3Zm7 0v4h4M10 11h5M10 14h5M10 17h3" />,
  // Kho – thu chi
  inventory: <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 9 8-4.5M12 12 4 7.5M12 12v9" />,
  // Chụp ảnh / chọn ảnh
  photo: <path d="M4 8h3l2-3h6l2 3h3v11H4V8Zm8 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />,
  // AI xử lý
  ai: <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3Zm6 11 .9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14Z" />,
  // Nghe nhạc
  music: <path d="M9 18V6l11-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />,
  // Lưu và chia sẻ
  share: <path d="M12 3v12m0-12L8 7m4-4 4 4M5 13v6h14v-6" />,
};
const DEFAULT_ORDER: ShowcaseNodeIcon[] = ['camera', 'drone', 'vms'];

/**
 * Khối công nghệ: chữ trái + nút "xem chi tiết giải pháp"; phải là sơ đồ 3 nút → màn hình.
 * Màn hình: `screen` (ảnh chụp phần mềm thật, vd DentGo) hoặc VMS dựng HTML (Óc Eo) — VMS luôn
 * kèm caption "minh hoạ".
 */
export function ShowcaseTechnology({ technology, tiles }: Props) {
  return (
    <section className="scroll-mt-24 py-12 md:py-16" id={technology.id}>
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div>
          <Eyebrow>{technology.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[clamp(1.75rem,1.4rem+1.3vw,2.375rem)] font-bold leading-tight text-text-primary">{technology.title}</h2>
          <p className="mt-4 max-w-[60ch] leading-relaxed text-text-secondary">{technology.description}</p>
          {technology.cta && (
            <Link className={`${buttonStyles('primary', 'lg')} mt-8 gap-2`} href={technology.cta.href}>
              {technology.cta.label}
              <ArrowRight />
            </Link>
          )}
        </div>

        <figure className="rounded-3xl bg-gradient-to-br from-primary-light to-[#f4fbfa] p-5 sm:p-8">
          <ul className="relative grid grid-cols-3 gap-3 sm:gap-6">
            {technology.nodes.map((node, index) => {
              const label = typeof node === 'string' ? node : node.label;
              const icon = typeof node === 'string' ? DEFAULT_ORDER[index % DEFAULT_ORDER.length] : node.icon;
              return (
                <li className="relative flex flex-col items-center rounded-xl bg-white px-2 py-3 text-center shadow-sm" key={label}>
                  <svg aria-hidden="true" className="size-7 text-text-primary" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 24 24">
                    {NODE_ICONS[icon]}
                  </svg>
                  <span className="mt-2 text-xs font-medium leading-snug text-text-primary">{label}</span>
                  <span aria-hidden="true" className="absolute -bottom-5 left-1/2 h-5 w-px bg-[rgb(0_158_135/0.4)] sm:-bottom-7 sm:h-7" />
                </li>
              );
            })}
          </ul>
          {technology.screen ? <ScreenMock screen={technology.screen} /> : <VmsMock alerts={technology.alerts ?? []} tiles={tiles} />}
          <figcaption className="mt-4 text-center text-xs text-text-secondary">{technology.caption}</figcaption>
        </figure>
      </Container>
    </section>
  );
}
