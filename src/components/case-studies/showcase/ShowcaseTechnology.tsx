import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import type { CaseStudyShowcase } from '@/content/types';
import { ArrowRight, Eyebrow } from './icons';
import { VmsMock } from './VmsMock';

type Props = { technology: CaseStudyShowcase['technology']; tiles: { src: string; alt: string }[] };

const NODE_ICONS = [
  // Camera cố định
  <path d="M3 7h12l4 3-4 3H3V7Zm4 6v4M4 17h6" key="cam" />,
  // Flycam
  <path d="M5 6h4M15 6h4M7 6v2M17 6v2M8 10h8l-1.5 4h-5L8 10Zm4 4v2m-4-6-2-2m12 2 2-2" key="drone" />,
  // Màn VMS
  <path d="M3 5h18v11H3V5Zm6 15h6m-3-4v4M7 12l3-3 2 2 4-4" key="vms" />,
];

/**
 * Khối "Kết hợp Camera AI và Flycam": chữ trái, sơ đồ 3 nút → màn VMS minh hoạ bên phải.
 * Màn VMS dựng bằng HTML (không phải ảnh chụp sản phẩm) → luôn có caption "minh hoạ".
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
            {technology.nodes.map((node, index) => (
              <li className="relative flex flex-col items-center rounded-xl bg-white px-2 py-3 text-center shadow-sm" key={node}>
                <svg aria-hidden="true" className="size-7 text-text-primary" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 24 24">
                  {NODE_ICONS[index % NODE_ICONS.length]}
                </svg>
                <span className="mt-2 text-xs font-medium leading-snug text-text-primary">{node}</span>
                <span aria-hidden="true" className="absolute -bottom-5 left-1/2 h-5 w-px bg-[rgb(0_158_135/0.4)] sm:-bottom-7 sm:h-7" />
              </li>
            ))}
          </ul>
          <VmsMock alerts={technology.alerts} tiles={tiles} />
          <figcaption className="mt-4 text-center text-xs text-text-secondary">{technology.caption}</figcaption>
        </figure>
      </Container>
    </section>
  );
}
