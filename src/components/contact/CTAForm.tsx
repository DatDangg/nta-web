'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useContactForm, type ContactField } from '@/lib/contact/useContactForm';

const FIELDS = ['name', 'email', 'message'] as const satisfies readonly ContactField[];
const FIELD_IDS = { name: 'cta-contact-name', email: 'cta-contact-email', message: 'cta-contact-message' };

export function CTAForm() {
  const t = useTranslations('contact');
  const state = useContactForm({
    name: t('errors.name'), email: t('errors.email'), phone: t('errors.phone'), message: t('errors.message'),
    rateLimit: t('rateLimit'), sendError: t('sendError'), summary: t('summary'),
  }, FIELDS);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.status === 'error' || state.status === 'rate-limit') summaryRef.current?.focus();
    if (state.status === 'success') successRef.current?.focus();
  }, [state.status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await state.submit();
  }

  if (state.status === 'success') {
    return <section aria-live="polite" className="grid justify-items-start gap-4 rounded-md bg-background-alt p-6" role="status">
      <h2 ref={successRef} tabIndex={-1} className="text-h3 font-semibold text-text-primary">{t('successTitle')}</h2>
      <p className="text-text-secondary">{t('success')}</p>
      <Button onClick={state.reset}>{t('sendAnother')}</Button>
    </section>;
  }

  const hasFieldErrors = FIELDS.some((field) => state.errors[field]);
  return <section aria-labelledby="cta-form-title" className="bg-background-alt py-12 md:py-16 xl:py-24">
    <div className="mx-auto grid w-full max-w-container gap-8 px-4 sm:px-6 lg:px-8 md:grid-cols-2">
      <h2 id="cta-form-title" className="text-h2 font-semibold text-text-primary">{t('consultationTitle')}</h2>
      <form aria-busy={state.status === 'submitting'} className="grid gap-6" noValidate onSubmit={handleSubmit}>
        {(state.status === 'error' || state.status === 'rate-limit') && <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-sm border border-error-ink p-4 text-error-ink">
          <p>{state.summary}</p>
          {state.status === 'error' && hasFieldErrors && <ul className="mt-2 list-inside list-disc">{FIELDS.filter((field) => state.errors[field]).map((field) => <li key={field}><a className="underline" href={`#${FIELD_IDS[field]}`}>{t(`labels.${field}`)}</a></li>)}</ul>}
        </div>}
        <Input id={FIELD_IDS.name} autoComplete="name" required minLength={2} maxLength={100} label={t('labels.name')} helper={t('helpers.name')} error={state.errors.name} value={state.values.name} onBlur={() => state.validateField('name')} onChange={(event) => state.updateField('name', event.target.value)} />
        <Input id={FIELD_IDS.email} autoComplete="email" required type="email" label={t('labels.email')} helper={t('helpers.email')} error={state.errors.email} value={state.values.email} onBlur={() => state.validateField('email')} onChange={(event) => state.updateField('email', event.target.value)} />
        <Textarea id={FIELD_IDS.message} required minLength={10} maxLength={2000} label={t('labels.message')} helper={t('helpers.message')} error={state.errors.message} value={state.values.message} onBlur={() => state.validateField('message')} onChange={(event) => state.updateField('message', event.target.value)} />
        <div hidden aria-hidden="true"><input tabIndex={-1} autoComplete="off" name="website" value={state.values.honeypot} onChange={(event) => state.updateField('honeypot', event.target.value)} /></div>
        <Button type="submit" disabled={state.status === 'submitting'}>{state.status === 'submitting' ? <><span aria-hidden="true" className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />{t('submitting')}</> : t('submit')}</Button>
      </form>
    </div>
  </section>;
}
