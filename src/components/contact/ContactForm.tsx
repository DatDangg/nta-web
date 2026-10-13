'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { CONTACT_NEEDS, COMPANY_MAX_LENGTH } from '@/lib/contact/company-info';
import { useContactForm, type ContactField } from '@/lib/contact/useContactForm';

const FIELDS = ['name', 'email', 'phone', 'company', 'need', 'message'] as const satisfies readonly ContactField[];
const FIELD_IDS: Record<(typeof FIELDS)[number], string> = {
  name: 'contact-name', email: 'contact-email', phone: 'contact-phone',
  company: 'contact-company', need: 'contact-need', message: 'contact-message',
};
const MESSAGE_MAX = 500;
const OPTIONS = { requirePhone: true, requireNeed: true, messageMax: MESSAGE_MAX };

/** Form trang `/contact` (R-10 §3): SĐT + Nhu cầu bắt buộc, nội dung 10–500. CTA form ở trang giải pháp dùng `CTAForm`. */
export function ContactForm() {
  const t = useTranslations('contact');
  const state = useContactForm({
    name: t('errors.name'), email: t('errors.email'), phone: t('errors.phone'), company: t('errors.company'),
    need: t('errors.need'), message: t('errors.messageShort'), rateLimit: t('rateLimit'), sendError: t('sendError'), summary: t('summary'),
  }, FIELDS, OPTIONS);
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
    return <div aria-live="polite" className="grid justify-items-start gap-4 rounded-md bg-background-alt p-6" role="status">
      <h3 ref={successRef} tabIndex={-1} className="text-h3 font-semibold text-text-primary">{t('successTitle')}</h3>
      <p className="text-text-secondary">{t('success')}</p>
      <Button onClick={state.reset}>{t('sendAnother')}</Button>
    </div>;
  }

  const hasFieldErrors = FIELDS.some((field) => state.errors[field]);
  const field = (name: (typeof FIELDS)[number]) => ({
    id: FIELD_IDS[name],
    label: t(`labels.${name}`),
    error: state.errors[name],
    value: state.values[name],
    showRequiredMark: true,
    onBlur: () => state.validateField(name),
  });

  return <form aria-busy={state.status === 'submitting'} className="grid gap-5" noValidate onSubmit={handleSubmit}>
    {(state.status === 'error' || state.status === 'rate-limit') && <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-sm border border-error-ink p-4 text-error-ink">
      <p>{state.summary}</p>
      {state.status === 'error' && hasFieldErrors && <ul className="mt-2 list-inside list-disc">{FIELDS.filter((name) => state.errors[name]).map((name) => <li key={name}><a className="underline" href={`#${FIELD_IDS[name]}`}>{t(`labels.${name}`)}</a></li>)}</ul>}
    </div>}
    <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-end lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Input {...field('name')} autoComplete="name" maxLength={100} minLength={2} placeholder={t('placeholders.name')} required onChange={(event) => state.updateField('name', event.target.value)} />
      <Input {...field('email')} autoComplete="email" placeholder={t('placeholders.email')} required type="email" onChange={(event) => state.updateField('email', event.target.value)} />
      <Input {...field('phone')} autoComplete="tel" inputMode="numeric" placeholder={t('placeholders.phone')} required type="tel" onChange={(event) => state.updateField('phone', event.target.value)} />
      <Input {...field('company')} autoComplete="organization" maxLength={COMPANY_MAX_LENGTH} placeholder={t('placeholders.company')} onChange={(event) => state.updateField('company', event.target.value)} />
    </div>
    <Select {...field('need')} options={CONTACT_NEEDS.map((key) => ({ value: key, label: t(`needs.${key}`) }))} placeholder={t('placeholders.need')} required onChange={(event) => state.updateField('need', event.target.value)} />
    <Textarea
      {...field('message')}
      counter={<><span aria-hidden="true">{state.values.message.length}/{MESSAGE_MAX}</span><span className="sr-only">{t('form.counter', { count: state.values.message.length, max: MESSAGE_MAX })}</span></>}
      maxLength={MESSAGE_MAX}
      minLength={10}
      placeholder={t('placeholders.message')}
      required
      rows={4}
      onChange={(event) => state.updateField('message', event.target.value)}
    />
    <div hidden aria-hidden="true"><input tabIndex={-1} autoComplete="off" name="website" value={state.values.honeypot} onChange={(event) => state.updateField('honeypot', event.target.value)} /></div>
    {state.status === 'error' && !hasFieldErrors && <Button variant="secondary" onClick={() => void state.submit()}>{t('retry')}</Button>}
    <Button className="w-full sm:ml-auto sm:w-auto sm:min-w-52" disabled={state.status === 'submitting'} type="submit" size="lg">
      {state.status === 'submitting'
        ? <><span aria-hidden="true" className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />{t('submitting')}</>
        : <>{t('form.submit')}<svg aria-hidden="true" className="ml-2 size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg></>}
    </Button>
  </form>;
}
