export const cardLinkClass = 'group block rounded-lg text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus motion-safe:transition-[transform,box-shadow] motion-safe:duration-base motion-safe:ease-out-expo motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-sm';
export const cardImageClass = 'aspect-[16/10] w-full rounded-lg bg-surface-sunken object-cover';
export const cardImageWideClass = 'aspect-[16/9] w-full rounded-lg bg-surface-sunken object-cover';
export const cardImageSizes = '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw';
export const cardGridClass = 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3';

// Khung ảnh của card — khớp `cardImageClass`/`cardImageWideClass` để next/image tính
// intrinsic size đúng, tránh layout shift và méo ảnh.
export const CARD_IMAGE_RATIO = { width: 1600, height: 1000 } as const;
export const CARD_IMAGE_WIDE_RATIO = { width: 1600, height: 900 } as const;
export const SQUARE_IMAGE_RATIO = { width: 400, height: 400 } as const;
