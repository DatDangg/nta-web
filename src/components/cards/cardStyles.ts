export const cardLinkClass = 'group block rounded-lg text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus motion-safe:transition-[transform,box-shadow] motion-safe:duration-base motion-safe:ease-out-expo motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-sm';
export const cardImageClass = 'aspect-[16/10] w-full rounded-lg bg-surface-sunken object-cover';

/**
 * Khung ảnh **poster sản phẩm** (tỉ lệ dọc 9/16).
 *
 * Ảnh onboarding của 2 app (`music-app`/`hair-style-ai`) là poster dọc 941×1672 có chữ khắc sẵn.
 * Khung 16/10 (`cardImageClass`) sẽ cắt mất chữ ở đáy poster, nên thẻ sản phẩm dùng riêng khung này
 * để hiện đủ ảnh (user chốt 2026-10-12). Ảnh cùng tỉ lệ khung ⇒ `object-cover` không cắt gì.
 */
export const cardPosterImageClass = 'aspect-[9/16] w-full rounded-lg bg-surface-sunken object-cover';

/**
 * Khung ảnh cho **thẻ dùng ảnh giao diện thật** (change `2026-10-12-solution-card-real-images`).
 *
 * Tách riêng `cardImageClass` vì khung này **cắt đáy** để mọi thẻ cao đều nhau, còn
 * `cardImageClass` dùng `object-cover` cho ảnh SVG phẳng (thẻ case study).
 * KHÔNG gộp: đổi khung này sẽ kéo theo `CaseStudyCard`.
 */
export const cardShotFrameClass = 'aspect-[16/10] w-full overflow-hidden rounded-t-lg bg-surface-sunken';
export const cardImageWideClass = 'aspect-[16/9] w-full rounded-lg bg-surface-sunken object-cover';
export const cardImageSizes = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw';
export const cardGridClass = 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3';

// Khung ảnh của card — khớp `cardImageClass`/`cardImageWideClass` để next/image tính
// intrinsic size đúng, tránh layout shift và méo ảnh.
export const CARD_IMAGE_RATIO = { width: 1600, height: 1000 } as const;
export const CARD_IMAGE_WIDE_RATIO = { width: 1600, height: 900 } as const;
export const SQUARE_IMAGE_RATIO = { width: 400, height: 400 } as const;

// Khung poster sản phẩm 9/16 — khớp `cardPosterImageClass` và ảnh gốc 941×1672.
export const CARD_POSTER_IMAGE_RATIO = { width: 900, height: 1600 } as const;
