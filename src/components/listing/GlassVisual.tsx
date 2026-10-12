import type { CSSProperties } from 'react';
import Image from 'next/image';
import { ListingIcon, type ListingIconName } from './icons';
import { listingThemes, type ListingTheme } from './themes';

export interface GlassTile {
  icon: ListingIconName;
  theme: ListingTheme;
}

export interface GlassMedia {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** `window` = ảnh chụp giao diện (thêm thanh cửa sổ 3 chấm) · `photo` = ảnh minh hoạ bo góc. */
  frame?: 'window' | 'photo';
  /** Căn ảnh theo đỉnh — ảnh giao diện cao hơn khung bị cắt đáy thay vì cắt đầu. */
  alignTop?: boolean;
}

interface GlassVisualProps {
  tiles: GlassTile[];
  /** Thẻ kính nhỏ ("AI · for a smarter everyday life"). */
  card?: { title: string; text: string };
  /** Có ảnh → ảnh nằm trên tấm kính chính (trang chi tiết). Không có → bố cục 3D kiểu ảnh mẫu. */
  media?: GlassMedia;
  className?: string;
}

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

const GLASS = 'border border-white/80 bg-white/45 shadow-[0_24px_60px_-20px_rgb(0_110_100/0.35),inset_0_1px_0_rgb(255_255_255/0.9)] backdrop-blur-xl';

function Tile({ tile, className, style }: { tile: GlassTile; className: string; style?: CSSProperties }) {
  return (
    <div aria-hidden="true" className={`listing-float absolute flex items-center justify-center rounded-[26%] text-white ring-1 ring-white/40 ${listingThemes[tile.theme].tile} ${className}`} style={style}>
      <ListingIcon className="size-[48%]" name={tile.icon} strokeWidth={2} />
    </div>
  );
}

function InfoCard({ card, className, style }: { card: NonNullable<GlassVisualProps['card']>; className: string; style?: CSSProperties }) {
  return (
    <div aria-hidden="true" className={`listing-float absolute rounded-[26px] p-5 ${GLASS} ${className}`} style={style}>
      <p className="text-2xl font-bold italic leading-none text-primary-active">{card.title}</p>
      <p className="mt-2 max-w-[11ch] text-[15px] font-medium italic leading-snug text-text-primary/80">{card.text}</p>
      <span className="absolute bottom-4 right-4 flex size-8 items-center justify-center rounded-full bg-primary text-white shadow-[0_6px_14px_-4px_rgb(0_158_135/0.7)]">
        <ListingIcon className="size-4" name="arrow" strokeWidth={2.2} />
      </span>
    </div>
  );
}

/**
 * Hình minh hoạ kính 3D bên phải hero (ảnh mẫu "Ứng dụng AI"): tấm kính nghiêng, ô icon
 * gradient trôi nhẹ, thẻ kính nhỏ. Thuần CSS — không cần ảnh render sẵn, đổi icon theo trang.
 */
export function GlassVisual({ tiles, card, media, className = '' }: GlassVisualProps) {
  const [a, b, c] = tiles;

  if (media) {
    const frame = media.frame ?? 'window';
    return (
      <div className={`relative mx-auto w-full max-w-[640px] pb-6 pt-4 sm:px-6 ${className}`} data-motion-off>
        <div aria-hidden="true" className="absolute inset-x-[8%] top-[6%] -z-10 h-[86%] rotate-[-4deg] rounded-[40px] border border-white/70 bg-white/30 backdrop-blur-md" />
        <div aria-hidden="true" className="absolute -right-6 bottom-0 -z-10 size-56 rounded-full bg-[#5eead4] opacity-30 blur-3xl" />
        <figure className={`motion-load relative overflow-hidden rounded-[22px] p-2 ${GLASS}`} style={delay(250)}>
          {frame === 'window' && (
            <div aria-hidden="true" className="flex items-center gap-1.5 px-2.5 pb-2 pt-1">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </div>
          )}
          <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-white">
            <Image
              alt={media.alt}
              className={`size-full object-cover ${media.alignTop ? 'object-top' : 'object-center'}`}
              height={media.height}
              priority
              sizes="(min-width: 1280px) 620px, (min-width: 1024px) 48vw, 100vw"
              src={media.src}
              width={media.width}
            />
          </div>
        </figure>
        {a && <Tile className="-left-1 -top-1 size-14 sm:size-16 lg:-left-4" style={{ ...delay(450), transform: 'rotate(-10deg)' }} tile={a} />}
        {b && <Tile className="-right-1 top-[34%] size-12 sm:size-14 lg:-right-3" style={{ ...delay(600), transform: 'rotate(8deg)' }} tile={b} />}
        {c && <Tile className="bottom-0 right-[18%] size-11 sm:size-12" style={{ ...delay(750), transform: 'rotate(-6deg)' }} tile={c} />}
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={`relative mx-auto aspect-[11/9] w-full max-w-[540px] ${className}`} data-motion-off>
      <div className="absolute -right-10 top-[10%] size-72 rounded-full bg-[#5eead4] opacity-25 blur-3xl" />
      {/* Tấm kính phía sau + tấm kính chính, nghiêng 3D */}
      <div className="listing-float absolute right-[2%] top-[0%] h-[96%] w-[52%]" style={delay(100)}>
        <div className={`size-full rounded-[44px] ${GLASS}`} style={{ transform: 'perspective(1100px) rotateY(-22deg) rotateX(10deg) rotateZ(-8deg)' }}>
          <div className="absolute inset-[5%] rounded-[36px] border border-white/70 bg-[linear-gradient(160deg,rgb(255_255_255/0.55),rgb(178_240_228/0.35))]" />
          <div className="absolute left-1/2 top-[3%] h-1.5 w-[22%] -translate-x-1/2 rounded-full bg-white/80" />
        </div>
      </div>
      <div className="absolute right-[-6%] top-[8%] h-[84%] w-[38%] rounded-[40px] border border-white/60 bg-white/20 backdrop-blur-sm" style={{ transform: 'perspective(1100px) rotateY(-22deg) rotateX(10deg) rotateZ(-8deg)' }} />
      {/* Đường sáng uốn cong */}
      <svg className="absolute inset-0 size-full" fill="none" viewBox="0 0 540 440">
        <path d="M10 390C140 330 230 300 330 230S470 90 540 70" stroke="url(#glass-line)" strokeLinecap="round" strokeWidth="2" />
        <defs>
          <linearGradient id="glass-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
      {a && <Tile className="right-[22%] top-[14%] size-[19%]" style={{ ...delay(350), transform: 'rotate(-8deg)' }} tile={a} />}
      {b && <Tile className="right-[5%] top-[38%] size-[17%]" style={{ ...delay(500), transform: 'rotate(-6deg)' }} tile={b} />}
      {c && <Tile className="bottom-[14%] right-[12%] size-[14%]" style={{ ...delay(650), transform: 'rotate(-10deg)' }} tile={c} />}
      {card && <InfoCard card={card} className="left-[6%] top-[42%] w-[38%] min-w-[180px]" style={{ ...delay(550), transform: 'rotate(8deg)' }} />}
    </div>
  );
}
