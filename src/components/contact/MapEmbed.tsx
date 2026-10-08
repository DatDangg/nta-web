import { useTranslations } from 'next-intl';

export function MapEmbed() {
  const t = useTranslations('contact');
  return <div className="aspect-video w-full overflow-hidden rounded-md bg-background-alt">
    <iframe className="h-full w-full border-0" loading="lazy" src="https://www.google.com/maps?q=Vietnam&output=embed" title={t('mapTitle')} />
  </div>;
}
