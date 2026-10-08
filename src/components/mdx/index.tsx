import type { ComponentProps } from 'react';

function ArticleImage(props: ComponentProps<'img'>) {
  return <img {...props} alt={props.alt ?? ''} loading={props.loading ?? 'lazy'} className="my-8 aspect-auto h-auto w-full rounded-md" />;
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
