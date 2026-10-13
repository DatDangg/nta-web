import type { ListingIconName } from '@/components/listing/icons';
import { listingItems, listingPages } from '@/content/listings';
import type { Locale } from '@/content/types';
import { getAllSolutions } from './solutions';
import { aiSlugs, enterpriseSlugs } from './slug';

export interface SolutionsMenuItem {
  slug: string;
  href: string;
  title: string;
  subtitle?: string;
  icon: ListingIconName;
}

export interface SolutionsMenuGroup {
  key: 'enterprise' | 'ai';
  href: string;
  title: string;
  tagline: string;
  description: string;
  icon: ListingIconName;
  items: SolutionsMenuItem[];
}

const groups = [
  { key: 'enterprise', icon: 'building', slugs: enterpriseSlugs },
  { key: 'ai', icon: 'cpu', slugs: aiSlugs },
] as const;

/**
 * Dữ liệu mega menu "Giải pháp" ở Header: tên/mô tả nhóm lấy từ hero trang danh sách,
 * mục con là giải pháp thật (mdx) theo thứ tự slug, icon + mô tả ngắn lấy từ thẻ danh sách.
 */
export async function getSolutionsMenu(locale: Locale): Promise<SolutionsMenuGroup[]> {
  const solutions = await getAllSolutions(locale);
  return groups.map(({ key, icon, slugs }) => {
    const page = listingPages[locale][key];
    const items = slugs.flatMap((slug) => {
      const solution = solutions.find((candidate) => candidate.slug === slug);
      if (!solution) return [];
      const meta = listingItems[locale][slug];
      return [{ slug, href: `/solutions/${key}/${slug}`, title: solution.title, subtitle: meta?.subtitle, icon: meta?.icon ?? 'layers' }];
    });
    return { key, href: `/solutions/${key}`, title: page.title, tagline: `${page.lead} ${page.accent}`, description: page.description, icon, items };
  });
}
