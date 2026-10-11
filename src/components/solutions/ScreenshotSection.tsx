import { HomeImage } from '@/components/shared/HomeImage';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';

export function ScreenshotSection({ images, title, imageAlt }: { images: string[]; title: string; imageAlt: string }) {
  if (images.length === 0) return null;

  return (
    <Section>
      <h2 className="text-h2 font-semibold">{title}</h2>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2">
        {images.map((src) => (
          <li key={src}>
            <HomeImage alt={imageAlt} className="h-auto w-full rounded-lg" height={1900} sizes="(min-width: 640px) 50vw, 100vw" src={src} width={2600} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
