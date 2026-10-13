import type { CSSProperties } from 'react';
import { HomeImage } from '@/components/shared/HomeImage';
import { ListingIcon } from '@/components/listing/icons';
import { Reveal } from '@/components/ui/Reveal';
import type { HomeSolutionCard } from '@/content/home';
import { Link } from '@/i18n/navigation';
import { HomeSectionHeader } from './HomeSectionHeader';

/**
 * Ảnh minh hoạ tan vào nền thẻ: giao 2 gradient (mờ dần sang trái và lên trên).
 * `source-in` là tên cũ (WebKit) của `intersect` — cùng cách làm với `AboutHero`.
 */
const illustrationFade = {
  maskImage: 'linear-gradient(to right, transparent, #000 40%), linear-gradient(to bottom, transparent, #000 35%)',
  WebkitMaskImage: 'linear-gradient(to right, transparent, #000 40%), linear-gradient(to bottom, transparent, #000 35%)',
  maskComposite: 'intersect',
  WebkitMaskComposite: 'source-in',
} as CSSProperties;

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
 * Chữ nằm trên lớp ảnh (`z-10`); ảnh chỉ trang trí phía phải-dưới. Cột chữ chỉ thu hẹp ~60%
 * khi thẻ đủ rộng (md 1 cột, xl 3 cột); lúc hẹp (mobile, lg 3 cột) ảnh nhỏ + mờ để không cạnh tranh chữ.
 */
function SolutionHomeCard({ solution }: { solution: HomeSolutionCard }) {
  return (
    <article className="relative isolate flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface p-5 shadow-xs md:p-6">
      <div
        className="pointer-events-none absolute bottom-0 right-0 -z-10 w-[55%] opacity-30 md:w-[48%] md:opacity-100 lg:w-[60%] lg:opacity-30 xl:w-[52%] xl:opacity-100"
        style={illustrationFade}
      >
        <HomeImage alt={solution.alt} className="h-auto w-full" height={1051} sizes="(min-width: 1280px) 220px, (min-width: 768px) 360px, 50vw" src={solution.image} width={1496} />
      </div>

      <div className="flex flex-1 flex-col md:max-w-[60%] lg:max-w-none xl:max-w-[64%]">
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
