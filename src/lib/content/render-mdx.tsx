import 'server-only';

import { MDXRemote } from 'next-mdx-remote/rsc';
import type { MDXComponents } from 'mdx/types';

export function RenderMdx({ source, components }: { source: string; components?: MDXComponents }) {
  return <MDXRemote components={components} source={source} />;
}
