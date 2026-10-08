import 'server-only';

import { MDXRemote } from 'next-mdx-remote/rsc';

export function RenderMdx({ source }: { source: string }) {
  return <MDXRemote source={source} />;
}
