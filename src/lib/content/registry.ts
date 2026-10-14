import 'server-only';

import { getHomeContent as getFileHomeContent, type HomeContent } from '@/content/home';
import { detailTiles, listingCtas, listingItems, listingLabels, listingPages, type ListingItemMeta } from '@/content/listings';
import { solutionOverview } from '@/content/solutions/overview';
import type { GlassTile } from '@/components/listing/GlassVisual';
import type { Locale } from '@/content/types';
import { HOME_SLUG, LISTING_LABELS_SLUG } from '@/db/content-rules';
import type { ContentCollection } from '@/db/schema';
import { aiSlugs, enterpriseSlugs, productSlugs } from './slug';
import { getContentSource } from './source';
import { getEntries } from './store';

// Registry nội dung dạng object TS (slug, listing, home, overview) đọc theo cờ CONTENT_SOURCE (CR-031 P3-T02):
//   file = hằng TS hiện tại (hành vi cũ) · db = collection tương ứng trong content_entries (quy ước khoá: tools/db/file-source.ts).
// Lỗi DB được store ném ra (không trả rỗng); bản ghi singleton thiếu → ném lỗi rõ thay vì render trang thiếu nội dung.

export type RegistryGroup = 'enterprise' | 'ai' | 'product';
export type ListingPages = (typeof listingPages)[Locale];
export type ListingCtas = (typeof listingCtas)[Locale];
export type ListingLabels = (typeof listingLabels)[Locale];
export type SolutionOverview = (typeof solutionOverview)[Locale];

const FILE_REGISTRY: Record<RegistryGroup, readonly string[]> = { enterprise: enterpriseSlugs, ai: aiSlugs, product: productSlugs };

// Key bắt buộc của collection keyed mà trang truy cập trực tiếp (vd listingPages.ai) — lấy từ chính dữ liệu file để không lệch.
const LISTING_PAGE_KEYS = Object.keys(listingPages.vi) as (keyof ListingPages)[];
const SOLUTION_OVERVIEW_KEYS = Object.keys(solutionOverview.vi) as (keyof SolutionOverview)[];

// Collection dạng "mỗi key 1 bản ghi": dựng lại Record theo thứ tự sort_order (store đã sắp) — không dựa thứ tự key jsonb.
async function readKeyed<T>(collection: ContentCollection, locale: Locale): Promise<Record<string, T>> {
  const entries = await getEntries(collection, locale);
  return Object.fromEntries(entries.map((entry) => [entry.slug, entry.data as T]));
}

// Như readKeyed nhưng thiếu key bắt buộc → ném lỗi rõ (thay vì TypeError undefined ở trang).
async function readKeyedRequired<T extends object>(collection: ContentCollection, locale: Locale, requiredKeys: readonly (keyof T)[]): Promise<T> {
  const record = await readKeyed<unknown>(collection, locale);
  const missing = requiredKeys.filter((key) => !(String(key) in record));
  if (missing.length > 0) throw new Error(`[content-registry] Thiếu bản ghi ${collection}/${locale}/${missing.join(', ')} trong DB`);
  return record as T;
}

async function readSingleton<T>(collection: ContentCollection, slug: string, locale: Locale): Promise<T> {
  const entry = (await getEntries(collection, locale)).find((candidate) => candidate.slug === slug);
  if (!entry) throw new Error(`[content-registry] Thiếu bản ghi ${collection}/${locale}/${slug} trong DB`);
  return entry.data as T;
}

/** Slug của 1 nhóm theo thứ tự hiển thị. Registry không theo ngôn ngữ → DB đọc bản `vi` (seed ghi giống nhau cho vi/en). */
export async function getRegistrySlugs(group: RegistryGroup): Promise<string[]> {
  if (getContentSource() === 'file') return [...FILE_REGISTRY[group]];
  const entries = await getEntries('slug_registry', 'vi');
  return entries.filter((entry) => entry.data.group === group).map((entry) => entry.slug);
}

export async function isRegisteredSlug(group: RegistryGroup, slug: string): Promise<boolean> {
  return (await getRegistrySlugs(group)).includes(slug);
}

export async function getListingPages(locale: Locale): Promise<ListingPages> {
  if (getContentSource() === 'file') return listingPages[locale];
  return readKeyedRequired<ListingPages>('listing_page', locale, LISTING_PAGE_KEYS);
}

export async function getListingItems(locale: Locale): Promise<Record<string, ListingItemMeta>> {
  if (getContentSource() === 'file') return listingItems[locale];
  return readKeyed<ListingItemMeta>('listing_item', locale);
}

export async function getListingCtas(locale: Locale): Promise<ListingCtas> {
  if (getContentSource() === 'file') return listingCtas[locale];
  return readKeyedRequired<ListingCtas>('listing_cta', locale, LISTING_PAGE_KEYS);
}

export async function getListingLabels(locale: Locale): Promise<ListingLabels> {
  if (getContentSource() === 'file') return listingLabels[locale];
  return readSingleton<ListingLabels>('listing_labels', LISTING_LABELS_SLUG, locale);
}

export async function getHomeContent(locale: Locale): Promise<HomeContent> {
  if (getContentSource() === 'file') return getFileHomeContent(locale);
  return readSingleton<HomeContent>('home', HOME_SLUG, locale);
}

export async function getSolutionOverview(locale: Locale): Promise<SolutionOverview> {
  if (getContentSource() === 'file') return solutionOverview[locale];
  return readKeyedRequired<SolutionOverview>('solution_overview', locale, SOLUTION_OVERVIEW_KEYS);
}

export async function getDetailTiles(locale: Locale, slug: string): Promise<GlassTile[]> {
  return detailTiles((await getListingItems(locale))[slug]);
}
