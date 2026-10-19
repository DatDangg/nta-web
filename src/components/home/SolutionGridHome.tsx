import type { CSSProperties } from 'react';
import Image from 'next/image';
import { ListingIcon } from '@/components/listing/icons';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import type { HomeSolutionCard } from '@/content/home';
import { Link } from '@/i18n/navigation';
import { HomeSectionHeader } from './HomeSectionHeader';

/**
 * Ảnh tan vào nền thẻ (mẫu CR-018 `5.webp`): mờ dần sang trái, giao (intersect) với lớp mờ mép trên 25%.
 * Nửa trái ảnh là nền sáng nên mờ hết cũng không mất chủ thể (~45–95% bề ngang ảnh).
 */
const photoFadeMask = 'linear-gradient(to right, transparent, #000 45%), linear-gradient(to bottom, transparent, #000 25%)';
const photoFade = {
  maskImage: photoFadeMask,
  WebkitMaskImage: photoFadeMask,
  maskComposite: 'intersect',
  WebkitMaskComposite: 'source-in',
} satisfies CSSProperties;

type SolutionGridHomeProps = {
  solutions: HomeSolutionCard[];
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  description: string;
};

/**
 * Khối "Giải pháp" trang chủ theo mockup CR-016 (`2.webp` nửa trên).
 * Dùng `Container` 1280 chung để mép trái/phải thẳng các section khác (R-01b, CR-040; trước đây rộng riêng 1400px).
 */
export function SolutionGridHome({ solutions, eyebrow, titleLead, titleAccent, description }: SolutionGridHomeProps) {
  return (
    <section aria-labelledby="home-solutions-title" className="bg-background-alt py-12 md:py-16 xl:py-24">
      <Container>
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
      </Container>
    </section>
  );
}

/**
 * Thẻ giải pháp riêng của trang chủ (không dùng `SolutionCard` dùng chung).
 * Ảnh chụp 3:2 (chủ thể ở ~45–95% bề ngang, ~15–85% chiều cao) trong khung đúng tỉ lệ 3:2 (không cắt),
 * mờ sang trái + mép trên (`photoFade`). Khung không bao giờ nằm dưới chữ (CR-018 review M1):
 * - Mobile + lg (chữ full bề ngang thẻ): khung là dải ảnh trong flow ở đáy thẻ, dưới link, tràn sát mép thẻ
 *   bằng margin âm bằng padding.
 * - md (1 cột ~720px) + xl (3 cột ~430px): cột chữ 56%, khung `absolute` neo góc phải-dưới (md 55%, xl 80% bề ngang)
 *   → chủ thể bắt đầu ở ~70% (md) / ~56% (xl) bề ngang thẻ, ngoài cột chữ; phần khung dưới cột chữ đã mờ trong suốt
 *   nên không cần lớp nền phủ.
 * Tiêu đề không xuống dòng ở xl (mẫu `5.webp`): phần tràn nằm ở nửa trên thẻ, phía trên khung ảnh.
 * Dùng `next/image` trực tiếp vì `HomeImage` dùng chung không hỗ trợ `fill`.
 */
function SolutionHomeCard({ solution }: { solution: HomeSolutionCard }) {
  return (
    <article className="relative isolate flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface p-5 shadow-xs md:min-h-[16rem] md:p-6">
      <div className="flex flex-1 flex-col md:max-w-[56%] lg:max-w-none xl:max-w-[56%]">
        <div className="flex items-start gap-4">
          <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-md border border-[#cdeee6] bg-surface text-primary shadow-[0_8px_20px_-12px_rgb(0_158_135/0.55)]">
            <ListingIcon className="size-6" name={solution.icon} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h3 className="text-xl font-bold leading-tight text-text-primary xl:whitespace-nowrap">{solution.title}</h3>
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

      <div
        className="pointer-events-none relative -z-10 -mx-5 -mb-5 mt-2 aspect-[3/2] md:absolute md:bottom-0 md:right-0 md:m-0 md:w-[55%] lg:relative lg:-mx-6 lg:-mb-6 lg:mt-2 lg:w-auto xl:absolute xl:m-0 xl:w-[80%]"
        style={photoFade}
      >
        <Image
          alt={solution.alt}
          className="object-cover"
          fill
          sizes="(min-width: 1280px) 360px, (min-width: 1024px) 33vw, (min-width: 768px) 55vw, 100vw"
          src={solution.image}
        />
      </div>
    </article>
  );
}
