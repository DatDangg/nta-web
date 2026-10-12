import type { BlogCategory, Post } from '@/content/types';
import { isBlogCategory } from './categories';

/** R-09a §Phân trang. */
export const BLOG_PAGE_SIZE = 12;
/** Số bài ở khối nổi bật (1 lớn + 2 nhỏ) khi không lọc/tìm. */
export const BLOG_FEATURED_COUNT = 3;

export interface BlogListingParams {
  category: BlogCategory | null;
  query: string;
  page: number;
}

export const DEFAULT_BLOG_PARAMS: BlogListingParams = { category: null, query: '', page: 1 };

/** Bỏ dấu tiếng Việt + `đ→d` để "tri tue" khớp "Trí tuệ". */
export function normalizeSearchText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}

/** Đọc `?category&q&page` — category lạ → Tất cả; page không hợp lệ → 1 (kẹp trên ở `paginate`). */
export function parseBlogParams(searchParams: Pick<URLSearchParams, 'get'>): BlogListingParams {
  const rawCategory = searchParams.get('category');
  const requestedPage = Number(searchParams.get('page'));
  return {
    category: isBlogCategory(rawCategory) ? rawCategory : null,
    query: (searchParams.get('q') ?? '').trim(),
    page: Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
  };
}

/** Chuỗi query cho URL — bỏ tham số rỗng, không giữ `page` (đổi lọc → về trang 1). */
export function buildBlogQueryString(category: BlogCategory | null, query: string): string {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  const trimmed = query.trim();
  if (trimmed) params.set('q', trimmed);
  const text = params.toString();
  return text ? `?${text}` : '';
}

export function isFilterActive(params: BlogListingParams): boolean {
  return params.category !== null || params.query !== '';
}

/** Lọc theo danh mục AND từ khoá (tiêu đề + tóm tắt). */
export function filterPosts(posts: Post[], category: BlogCategory | null, query: string): Post[] {
  const needle = normalizeSearchText(query);
  return posts.filter((post) => {
    if (category && post.category !== category) return false;
    if (!needle) return true;
    return normalizeSearchText(`${post.title} ${post.excerpt}`).includes(needle);
  });
}

export function paginate<T>(items: T[], requestedPage: number): { pageItems: T[]; page: number; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / BLOG_PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  return { pageItems: items.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE), page, totalPages };
}
