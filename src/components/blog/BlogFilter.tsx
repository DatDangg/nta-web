'use client';

import { useSearchParams } from 'next/navigation';
import type { Post } from '@/content/types';
import { PostCard } from '@/components/cards/PostCard';
import { Pagination } from '@/components/ui/Pagination';

type BlogFilterProps = {
  posts: Post[];
  imageAltTemplate: string;
};

const PAGE_SIZE = 9;

export function BlogFilter({ imageAltTemplate, posts }: BlogFilterProps) {
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  const requestedPage = Number(searchParams.get('page'));
  const page = Number.isInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, Math.max(1, totalPages))
    : 1;
  const visiblePosts = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visiblePosts.map((post) => (
          <li key={post.slug}>
            <PostCard imageAlt={imageAltTemplate.replace('{title}', post.title)} post={post} />
          </li>
        ))}
      </ul>
      {totalPages > 1 && <div className="mt-10"><Pagination currentPage={page} totalPages={totalPages} /></div>}
    </>
  );
}
