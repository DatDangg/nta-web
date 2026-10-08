import { useTranslations } from 'next-intl';

export function OfficeHours() {
  const t = useTranslations('contact');
  return <section aria-labelledby="office-hours-title" className="grid gap-2">
    <h2 id="office-hours-title" className="text-h3 font-semibold text-text-primary">{t('hoursTitle')}</h2>
    <p className="text-text-secondary">{t('hours')}</p>
  </section>;
}
