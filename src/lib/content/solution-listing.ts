import type { ListingItem } from '@/components/listing/types';
import { listingItems, ratioToSize } from '@/content/listings';
import type { Locale, Solution } from '@/content/types';

/**
 * Đổi danh sách giải pháp (mdx) thành thẻ cho `ListingExplorer`, theo đúng thứ tự `slugs`.
 * Ảnh thẻ: `cardImage` (ảnh giao diện thật) → fallback `heroShot` → bỏ ảnh.
 */
export function toSolutionItems(locale: Locale, solutions: Solution[], slugs: readonly string[], fallbackAlt: (title: string) => string): ListingItem[] {
  return slugs.flatMap((slug) => {
    const solution = solutions.find((candidate) => candidate.slug === slug);
    if (!solution) return [];
    const meta = listingItems[locale][slug];
    const shot = solution.cardImage ?? solution.heroShot;
    const featureTitles = solution.features.map((feature) => (typeof feature === 'string' ? feature : feature.title));
    const item: ListingItem = {
      id: slug,
      href: `/solutions/${solution.category}/${slug}`,
      title: solution.title,
      subtitle: meta?.subtitle,
      description: solution.description,
      chips: meta?.chips ?? featureTitles.slice(0, 3),
      icon: meta?.icon ?? 'layers',
      theme: meta?.theme ?? 'teal',
      categories: meta?.categories ?? [],
      keywords: featureTitles.join(' '),
      linkLabel: solution.title,
      media: shot ? { kind: 'window', src: shot.src, alt: shot.alt ?? fallbackAlt(solution.title), ...ratioToSize(shot.ratio ?? 1.6) } : undefined,
    };
    return [item];
  });
}
