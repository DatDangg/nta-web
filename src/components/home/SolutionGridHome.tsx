import type { CSSProperties } from 'react';
import Image from 'next/image';
import { ListingIcon } from '@/components/listing/icons';
import { Reveal } from '@/components/ui/Reveal';
import type { HomeSolutionCard } from '@/content/home';
import { Link } from '@/i18n/navigation';
import { HomeSectionHeader } from './HomeSectionHeader';

/**
 * Ảnh minh hoạ tan vào nền thẻ: CHỈ mờ dần sang trái (mẫu CR-017 `4.webp`) — mép trên/dưới/phải
 * giữ nguyên để ảnh tràn sát mép thẻ.
 */
const illustrationFade = {
  maskImage: 'linear-gradient(to right, transparent, #000 50%)',
  WebkitMaskImage: 'linear-gradient(to right, transparent, #000 50%)',
} satisfies CSSProperties;

type SolutionGridHomeProps = {
  solutions: HomeSolutionCard[];
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  description: string;
};

/** Khối "Giải pháp" trang chủ theo mockup CR-016 (`2.webp` nửa trên). */
export function SolutionGridHome({ solutions, eyebrow, titleLead, titleAccent, description }: SolutionGridHomeProps) {
  return (
    <section aria-labelledby="home-solutions-title" className="bg-background-alt py-12 md:py-16 xl:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <Reveal>
          <HomeSectionHeader
            accentOnNewLine
            description={description}
            eyebrow={eyebrow}
            headingId="home-solutions-title"
            titleAccent={titleAccent}
            titleLead={titleLead}
          />
        </Reveal>
        <Reveal className="mt-8 grid grid-cols-1 gap-6 lg:mt-10 lg:grid-cols-3" stagger>
          {solutions.map((solution) => (
            <SolutionHomeCard key={solution.href} solution={solution} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Thẻ giải pháp riêng của trang chủ (không dùng `SolutionCard` dùng chung).
 * Ảnh phủ full chiều cao nửa phải thẻ (`-z-10`, tràn sát mép, bo góc nhờ `overflow-hidden`), mờ dần sang trái.
 * Lớp nền surface→trong suốt (trên ảnh, dưới chữ) ở MỌI breakpoint giữ cột trái gần trắng như mẫu;
 * ảnh đậm chỉ hiện rõ từ ~60–75% bề rộng thẻ sang phải.
 * Thẻ rộng (md 1 cột, xl 3 cột): cột chữ 56%. Thẻ hẹp (mobile, lg 3 cột): chữ full bề rộng → nền phủ dài hơn ở lg.
 * `object-[40%_50%]`: khung ảnh dọc cắt ngang ảnh 3:2 — lệch trái để chủ thể (giữa ảnh) rơi vào phía phải khung, ngoài vùng mờ.
 * Dùng `next/image` trực tiếp vì `HomeImage` dùng chung không hỗ trợ `fill`.
 */
function SolutionHomeCard({ solution }: { solution: HomeSolutionCard }) {
  return (
    <article className="relative isolate flex h-full min-h-[18rem] flex-col overflow-hidden rounded-lg border border-border bg-surface p-5 shadow-xs md:p-6">
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[60%]" style={illustrationFade}>
        <Image alt={solution.alt} className="object-cover object-[40%_50%]" fill sizes="(min-width: 1280px) 260px, (min-width: 1024px) 20vw, 60vw" src={solution.image} />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-surface from-40% to-transparent to-75% lg:to-90% xl:to-75%" />

      <div className="flex flex-1 flex-col md:max-w-[56%] lg:max-w-none xl:max-w-[56%]">
        <div className="flex items-start gap-4">
          <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-md border border-[#cdeee6] bg-surface text-primary shadow-[0_8px_20px_-12px_rgb(0_158_135/0.55)]">
            <ListingIcon className="size-6" name={solution.icon} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h3 className="text-xl font-bold leading-tight text-text-primary">{solution.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{solution.description}</p>
          </div>
        </div>

        <ul className="mt-5 space-y-3">
          {solution.bullets.map((bullet) => (
            <li className="flex items-center gap-3 text-sm text-text-primary" key={bullet.label}>
              <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                <ListingIcon className="size-4" name={bullet.icon} strokeWidth={2} />
              </span>
              <span className="min-w-0">{bullet.label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-5">
          <Link
            className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-active underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
            href={solution.href.replace(/^\/en(?=\/)/, '')}
          >
            {solution.linkLabel}
            <span aria-hidden="true" className="motion-safe:transition-transform motion-safe:group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
