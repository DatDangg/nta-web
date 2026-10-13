import { useTranslations } from 'next-intl';
import { ListingIcon, type ListingIconName } from '@/components/listing/icons';
import { COMPANY_CONTACT } from '@/lib/contact/company-info';

function IconBadge({ name }: { name: ListingIconName }) {
  return (
    <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#cdeee6] bg-[#effaf7] text-primary-active xl:size-12">
      <ListingIcon className="size-5 xl:size-6" name={name} strokeWidth={1.9} />
    </span>
  );
}

/**
 * Card thông tin liên hệ trang `/contact` (R-10 §2): SĐT · Email · Địa chỉ, Google Maps nhúng, tiện ích văn phòng.
 * Dữ liệu từ `company-info.ts` (dùng chung với Footer + JSON-LD).
 */
export function ContactDetails() {
  const t = useTranslations('contact');
  const { phone, email, address, map } = COMPANY_CONTACT;
  const items = [
    { icon: 'call' as const, title: t('info.phone'), value: <a className="hover:text-primary-active hover:underline" href={phone.href}>{phone.display}</a>, note: t('info.phoneNote') },
    { icon: 'mail' as const, title: t('info.email'), value: <a className="break-words hover:text-primary-active hover:underline xl:whitespace-nowrap" href={email.href}>{email.display}</a>, note: t('info.emailNote') },
    { icon: 'pin' as const, title: t('info.address'), value: <address className="not-italic">{address.line1}</address>, note: address.line2 },
  ];
  const office = [
    { icon: 'car' as const, title: t('office.parking'), note: t('office.parkingNote') },
    { icon: 'train' as const, title: t('office.transit'), note: t('office.transitNote') },
    { icon: 'building' as const, title: t('office.central'), note: t('office.centralNote') },
  ];

  return (
    <section aria-labelledby="contact-info-title" className="rounded-2xl border border-border bg-surface p-5 shadow-[0_24px_60px_-32px_rgb(0_110_100/0.35)] sm:p-6">
      <h2 className="sr-only" id="contact-info-title">{t('info.title')}</h2>
      {/* 3 cột khi card đủ rộng (sm–md full width, xl cột trái); lg cột trái hẹp → xếp dọc. */}
      <ul className="grid gap-5 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)_minmax(0,1.25fr)] sm:gap-0 sm:divide-x sm:divide-border lg:grid-cols-1 lg:gap-4 lg:divide-x-0 xl:grid-cols-[auto_auto_minmax(0,1fr)] xl:gap-0 xl:divide-x">
        {items.map((item) => (
          <li className="flex items-start gap-3 sm:px-3 sm:first:pl-0 sm:last:pr-0 lg:px-0 xl:px-3 xl:first:pl-0 xl:last:pr-0" key={item.icon}>
            <IconBadge name={item.icon} />
            <div className="min-w-0 pt-0.5 text-sm leading-relaxed">
              <h3 className="text-base font-semibold text-text-primary">{item.title}</h3>
              <div className="mt-1 text-text-primary">{item.value}</div>
              <p className="text-[13px] text-text-secondary">{item.note}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-background-alt">
        <iframe
          className="block aspect-[4/3] w-full sm:aspect-[5/2]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={map.embedUrl}
          title={t('map.title')}
        />
      </div>
      <a className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary-active hover:underline" href={map.openUrl} rel="noopener noreferrer" target="_blank">
        <ListingIcon className="size-4" name="pin" strokeWidth={2} />
        {t('map.open')}
        <span className="sr-only"> {t('map.newTab')}</span>
      </a>

      <h3 className="mt-6 text-lg font-bold text-text-primary">{t('office.title')}</h3>
      <ul className="mt-4 grid gap-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border lg:grid-cols-1 lg:gap-4 lg:divide-x-0 xl:grid-cols-3 xl:gap-0 xl:divide-x">
        {office.map((item) => (
          <li className="flex items-center gap-3 sm:px-3 sm:first:pl-0 sm:last:pr-0 lg:px-0 xl:px-3 xl:first:pl-0 xl:last:pr-0" key={item.icon}>
            <IconBadge name={item.icon} />
            <span className="text-sm leading-snug">
              <span className="block font-semibold text-text-primary">{item.title}</span>
              <span className="block text-text-secondary">{item.note}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
