import { useTranslations } from 'next-intl';

export function ContactInfo() {
  const t = useTranslations('contact');
  return <section aria-labelledby="contact-info-title" className="grid content-start gap-6">
    <h2 id="contact-info-title" className="text-h3 font-semibold text-text-primary">{t('infoTitle')}</h2>
    <dl className="grid gap-4">
      {(['hotline', 'email', 'address'] as const).map((item) => <div key={item} className="border-b border-border pb-4">
        <dt className="font-medium text-text-primary">{t(`info.${item}`)}</dt>
        <dd className="mt-1 text-text-secondary">{t(`placeholders.${item}`)}</dd>
      </div>)}
    </dl>
  </section>;
}
