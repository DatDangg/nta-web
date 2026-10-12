import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ListingIcon } from './icons';
import { listingThemes } from './themes';
import type { ListingCta, ListingItem, ListingMedia } from './types';

function CardLink({ href, className, children, label, style }: { href: string; className: string; children: ReactNode; label?: string; style?: CSSProperties }) {
  // Neo trong trang → <a> thường (Link của next-intl sẽ gắn tiền tố locale vào neo).
  if (href.startsWith('#')) {
    return <a aria-label={label} className={className} href={href} style={style}>{children}</a>;
  }
  return <Link aria-label={label} className={className} href={href} style={style}>{children}</Link>;
}

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus';

function CardMedia({ media, glow }: { media: ListingMedia; glow: string }) {
  if (media.kind === 'phone') {
    return (
      <div className="relative mx-auto -mb-24 mt-2 w-[50%] max-w-[200px] sm:absolute sm:right-[5%] sm:top-[6%] sm:mx-0 sm:mb-0 sm:mt-0 sm:w-[37%] sm:max-w-[210px]">
        <div aria-hidden="true" className={`absolute -inset-6 -z-10 rounded-full opacity-40 blur-3xl ${glow}`} />
        <div className="rotate-[5deg] rounded-[34px] bg-[#1d1d1f] p-[5px] shadow-[0_30px_50px_-20px_rgb(20_20_40/0.55)] transition-transform duration-slow ease-out-expo group-hover:rotate-[3deg] group-hover:-translate-y-1">
          <div className="relative aspect-[9/18.5] overflow-hidden rounded-[29px] bg-black">
            <Image alt={media.alt} className="size-full object-cover object-top" height={media.height} sizes="(min-width: 1024px) 210px, 60vw" src={media.src} width={media.width} />
            <span aria-hidden="true" className="absolute left-1/2 top-2 h-[14px] w-[34%] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>
      </div>
    );
  }

  if (media.kind === 'photo') {
    return (
      <div className="relative mx-6 mb-6 aspect-[16/10] overflow-hidden rounded-[22px] shadow-[0_20px_40px_-24px_rgb(15_40_60/0.5)] ring-1 ring-white/80 sm:absolute sm:inset-y-4 sm:right-4 sm:mx-0 sm:mb-0 sm:aspect-auto sm:w-[44%]">
        <Image alt={media.alt} className="size-full object-cover object-center" height={media.height} sizes="(min-width: 1024px) 300px, 90vw" src={media.src} width={media.width} />
      </div>
    );
  }

  return (
    <div className="relative -mb-10 ml-6 mt-2 sm:absolute sm:-right-[18%] sm:top-[26%] sm:mb-0 sm:ml-0 sm:mt-0 sm:w-[68%]">
      <div aria-hidden="true" className={`absolute -inset-8 -z-10 rounded-full opacity-35 blur-3xl ${glow}`} />
      <div
        className="rounded-[18px] border border-white/90 bg-white/70 p-1.5 shadow-[0_30px_60px_-24px_rgb(15_40_60/0.45)] backdrop-blur transition-transform duration-slow ease-out-expo group-hover:-translate-y-1"
        style={{ transform: 'perspective(1400px) rotateY(-14deg) rotateX(6deg) rotateZ(1deg)' }}
      >
        <div aria-hidden="true" className="flex items-center gap-1 px-2 pb-1.5 pt-1">
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[12px] bg-white">
          <Image alt={media.alt} className="size-full object-cover object-left-top" height={media.height} sizes="(min-width: 1024px) 460px, 90vw" src={media.src} width={media.width} />
        </div>
      </div>
    </div>
  );
}

/** Thẻ lớn kiểu ảnh mẫu: nền gradient theo theme, ô icon, tiêu đề + phụ đề, mô tả, chip, nút mũi tên, ảnh bên phải. */
export function ListingCard({ item, style }: { item: ListingItem; style?: CSSProperties }) {
  const theme = listingThemes[item.theme];
  const hasMedia = item.media != null;

  return (
    <CardLink
      className={`listing-card-in group relative flex h-full min-h-[350px] flex-col overflow-hidden rounded-[28px] border border-white text-text-primary shadow-[0_20px_44px_-28px_rgb(15_60_70/0.45)] ring-1 ring-black/[0.04] transition-[transform,box-shadow] duration-base ease-out-expo hover:-translate-y-1 hover:shadow-[0_28px_56px_-28px_rgb(15_60_70/0.5)] ${theme.card} ${focusRing}`}
      href={item.href}
      label={item.linkLabel}
      style={style}
    >
      <div className={`relative z-10 flex flex-1 flex-col p-6 sm:p-7 ${hasMedia ? (item.media?.kind === 'phone' ? 'sm:max-w-[64%]' : item.media?.kind === 'photo' ? 'sm:max-w-[56%]' : 'sm:max-w-[50%]') : ''}`}>
        <div className="flex flex-wrap items-center gap-3">
          <span aria-hidden="true" className={`flex size-14 shrink-0 items-center justify-center rounded-[18px] text-white ring-1 ring-white/40 ${theme.tile}`}>
            <ListingIcon className="size-7" name={item.icon} strokeWidth={2} />
          </span>
          {item.status && (
            <span className={`inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-medium shadow-xs ${theme.ink}`}>
              <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
              {item.status}
            </span>
          )}
        </div>
        <h3 className="mt-5 text-[1.375rem] font-bold leading-tight tracking-[-0.01em]">{item.title}</h3>
        {item.subtitle && <p className="mt-1.5 font-medium leading-snug text-text-primary/85">{item.subtitle}</p>}
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-secondary">{item.description}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          {item.chips.length > 0 && (
            <ul className="flex min-w-0 flex-1 flex-wrap gap-2">
              {item.chips.map((chip) => (
                <li className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${theme.chip}`} key={chip}>{chip}</li>
              ))}
            </ul>
          )}
          <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-text-primary shadow-[0_8px_18px_-8px_rgb(15_40_60/0.4)] transition-[background-color,color,transform] duration-base group-hover:translate-x-0.5 group-hover:bg-primary group-hover:text-white">
            <ListingIcon className="size-5" name="arrow" strokeWidth={2} />
          </span>
        </div>
      </div>
      {item.media && <CardMedia glow={theme.glow} media={item.media} />}
    </CardLink>
  );
}

/** Thẻ viền đứt cuối lưới (ảnh mẫu "Thêm sản phẩm mới"): mời liên hệ / dẫn sang trang khác. */
export function ListingCtaCard({ cta, wide = false, style }: { cta: ListingCta; wide?: boolean; style?: CSSProperties }) {
  return (
    <div
      className={`listing-card-in flex h-full rounded-[28px] border-2 border-dashed border-[#cfe7e2] bg-white/70 p-7 backdrop-blur ${wide ? 'flex-col items-center gap-5 text-center md:flex-row md:text-left' : 'min-h-[300px] flex-col items-center justify-center text-center'}`}
      style={style}
    >
      <span aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-[20px] bg-primary-light text-primary">
        <ListingIcon className="size-8" name={cta.icon} strokeWidth={2} />
      </span>
      <div className={wide ? 'md:flex-1' : 'mt-6'}>
        <h3 className="text-[1.375rem] font-bold leading-tight">{cta.title}</h3>
        <p className={`mt-2 leading-relaxed text-text-secondary ${wide ? '' : 'mx-auto max-w-[28ch]'}`}>{cta.description}</p>
      </div>
      <CardLink
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary px-6 font-medium text-primary-active transition-colors hover:bg-primary hover:text-white ${wide ? '' : 'mt-6'} ${focusRing}`}
        href={cta.href}
      >
        {cta.label}
        <ListingIcon className="size-4" name="arrow" strokeWidth={2.2} />
      </CardLink>
    </div>
  );
}
