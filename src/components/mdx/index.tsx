import type { ComponentProps } from 'react';
import Image from 'next/image';
import { NewsImage } from './news-image';

function ArticleImage(props: ComponentProps<'img'>) {
  if (
    typeof props.width === 'number' &&
    typeof props.height === 'number' &&
    typeof props.src === 'string'
  ) {
    return (
      <Image
        {...props}
        alt={props.alt ?? ''}
        height={props.height}
        loading={props.loading ?? 'lazy'}
        sizes="100vw"
        src={props.src}
        width={props.width}
        className="my-8 aspect-auto h-auto w-full rounded-md"
      />
    );
  }

  // Markdown images without intrinsic dimensions cannot reserve layout space reliably with next/image.
  return <img {...props} alt={props.alt ?? ''} loading={props.loading ?? 'lazy'} decoding="async" className="my-8 aspect-auto h-auto w-full rounded-md" />;
}

// Không dùng @tailwindcss/typography: Tailwind preflight reset h/p/ul/ol về thẻ trần,
// nên style thân bài nằm ở đây theo design tokens (CR-023).
const articleHeadingClass = 'mb-4 mt-12 scroll-mt-24 text-h3 font-semibold leading-snug text-text-primary first:mt-0';

function withClass(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

export const mdxComponents = {
  h1: ({ className, ...props }: ComponentProps<'h1'>) => <h2 {...props} className={withClass(articleHeadingClass, className)} />,
  h2: ({ className, ...props }: ComponentProps<'h2'>) => <h2 {...props} className={withClass(articleHeadingClass, className)} />,
  h3: ({ className, ...props }: ComponentProps<'h3'>) => (
    <h3 {...props} className={withClass('mb-3 mt-8 text-body-lg font-semibold text-text-primary first:mt-0', className)} />
  ),
  p: ({ className, ...props }: ComponentProps<'p'>) => <p {...props} className={withClass('my-5 leading-relaxed', className)} />,
  a: ({ className, ...props }: ComponentProps<'a'>) => (
    <a
      {...props}
      className={withClass(
        'rounded-sm text-primary underline underline-offset-4 [overflow-wrap:anywhere] hover:text-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        className,
      )}
    />
  ),
  ul: ({ className, ...props }: ComponentProps<'ul'>) => <ul {...props} className={withClass('my-5 list-disc space-y-2 pl-6', className)} />,
  ol: ({ className, ...props }: ComponentProps<'ol'>) => <ol {...props} className={withClass('my-5 list-decimal space-y-2 pl-6', className)} />,
  li: ({ className, ...props }: ComponentProps<'li'>) => <li {...props} className={withClass('leading-relaxed marker:text-text-secondary', className)} />,
  blockquote: ({ className, ...props }: ComponentProps<'blockquote'>) => (
    <blockquote {...props} className={withClass('my-6 border-l-4 border-border-strong pl-4 italic text-text-secondary', className)} />
  ),
  hr: ({ className, ...props }: ComponentProps<'hr'>) => <hr {...props} className={withClass('my-10 border-border', className)} />,
  img: ArticleImage,
  NewsImage,
  code: ({ className, ...props }: ComponentProps<'code'>) => (
    <code {...props} className={withClass('rounded-sm bg-surface-sunken px-1 py-0.5 font-mono text-sm', className)} />
  ),
  pre: ({ className, ...props }: ComponentProps<'pre'>) => (
    // Code trong pre bỏ nền/padding inline để không bị double bg.
    <pre {...props} className={withClass('my-6 overflow-x-auto rounded-md bg-surface-sunken p-4 text-sm [&_code]:bg-transparent [&_code]:p-0', className)} />
  ),
};
