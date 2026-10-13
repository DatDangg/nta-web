import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import type { CaseStudyShowcase } from '@/content/types';
import { Eyebrow } from './icons';

type Props = { vision: NonNullable<CaseStudyShowcase['vision']> };

/**
 * "Hướng tới tương lai": chữ trái, thẻ trích dẫn phải, ảnh di tích mờ dần làm nền góc phải.
 * Không có `quote` (không có trích dẫn thật — BR-004) → ẩn thẻ trích dẫn, chỉ giữ đoạn mô tả.
 */
export function ShowcaseVision({ vision }: Props) {
  const hasQuote = Boolean(vision.quote);
  return (
    <section className="relative isolate overflow-hidden py-12 md:py-16">
      {vision.image && (
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 hidden w-[42%] lg:block">
          <Image alt="" className="object-cover opacity-90 [mask-image:linear-gradient(to_right,transparent,black_45%)]" fill sizes="42vw" src={vision.image.src} />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-white/60" />
        </div>
      )}
      <Container className={hasQuote ? 'grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,5fr)_minmax(0,2fr)]' : 'grid items-center gap-10'}>
        <div>
          <Eyebrow>{vision.eyebrow}</Eyebrow>
          <h2 className="mt-4 whitespace-pre-line text-[clamp(1.75rem,1.4rem+1.3vw,2.375rem)] font-bold leading-tight text-text-primary">{vision.title}</h2>
          <p className="mt-4 max-w-[56ch] leading-relaxed text-text-secondary">{vision.description}</p>
        </div>
        {vision.quote && (
          <figure className="rounded-2xl border border-border bg-white/90 p-7 shadow-md backdrop-blur-sm">
            <svg aria-hidden="true" className="size-9 text-primary" fill="currentColor" viewBox="0 0 32 32">
              <path d="M4 18c0-6 3.5-10 9-11v4c-3 1-4.5 3.2-4.6 5H13v9H4v-7Zm15 0c0-6 3.5-10 9-11v4c-3 1-4.5 3.2-4.6 5H28v9h-9v-7Z" />
            </svg>
            <blockquote className="mt-4 italic leading-relaxed text-text-secondary">{vision.quote}</blockquote>
            <span aria-hidden="true" className="mt-6 block h-1 w-12 rounded-full bg-primary" />
            {vision.quoteSource && <figcaption className="mt-3 text-sm font-medium text-text-primary">{vision.quoteSource}</figcaption>}
          </figure>
        )}
      </Container>
    </section>
  );
}
