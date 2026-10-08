import Image from 'next/image';
import type { CaseStudy } from '@/content/types';

type ImageGalleryProps = { images: CaseStudy['gallery']; title: string };

export function ImageGallery({ images, title }: ImageGalleryProps) {
  if (images.length === 0) return null;
  return <section aria-label={title} className="py-8"><h2 className="text-h2 font-bold">{title}</h2><ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{images.map((image) => <li key={image.src}><Image alt={image.alt} className="h-auto w-full rounded-md" height={640} sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" src={image.src} width={960} /></li>)}</ul></section>;
}
