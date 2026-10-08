import type { ComponentProps } from 'react';
import Image from 'next/image';

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

export const mdxComponents = {
  h1: (props: ComponentProps<'h1'>) => <h2 {...props} />,
  h2: (props: ComponentProps<'h2'>) => <h2 {...props} />,
  h3: (props: ComponentProps<'h3'>) => <h3 {...props} />,
  p: (props: ComponentProps<'p'>) => <p {...props} />,
  a: (props: ComponentProps<'a'>) => <a {...props} className="underline underline-offset-4" />,
  ul: (props: ComponentProps<'ul'>) => <ul {...props} />,
  ol: (props: ComponentProps<'ol'>) => <ol {...props} />,
  li: (props: ComponentProps<'li'>) => <li {...props} />,
  blockquote: (props: ComponentProps<'blockquote'>) => <blockquote {...props} />,
  img: ArticleImage,
  code: (props: ComponentProps<'code'>) => <code {...props} />,
  pre: (props: ComponentProps<'pre'>) => <pre {...props} />,
};
