import type { CSSProperties, ReactNode } from 'react';

export type MarqueeItem = string | { label: string; icon?: ReactNode };

type MarqueeProps = {
  items: MarqueeItem[];
  /** Giây cho 1 vòng; mặc định theo số item để tốc độ đọc đều. */
  duration?: number;
  reverse?: boolean;
  className?: string;
  label?: string;
};

function Sparkle() {
  return (
    <svg aria-hidden="true" className="marquee-sep size-4 shrink-0 text-primary" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2c.5 4.9 2.6 7.6 10 10-7.4 2.4-9.5 5.1-10 10-.5-4.9-2.6-7.6-10-10 7.4-2.4 9.5-5.1 10-10Z" />
    </svg>
  );
}

/**
 * Dải chữ chạy ngang vô tận (running line / marquee của trang tham chiếu Helpdesk) — thuần CSS.
 * Danh sách nhân đôi, bản thứ 2 `aria-hidden`; track dịch -50% rồi lặp ⇒ liền mạch.
 * Item có thể kèm icon (`{ label, icon }`) — hiển thị trong ô tròn trắng trước nhãn.
 * Rê chuột → tạm dừng; reduced-motion → đứng yên (rule toàn cục trong globals.css).
 */
export function Marquee({ items, duration, reverse = false, className = '', label }: MarqueeProps) {
  if (items.length === 0) return null;
  const style = { '--marquee-duration': `${duration ?? Math.max(24, items.length * 4)}s` } as CSSProperties;
  return (
    <div aria-label={label} className={`marquee ${reverse ? 'marquee-reverse' : ''} ${className}`.trim()} data-motion-off role={label ? 'region' : undefined} style={style}>
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <ul aria-hidden={copy === 1 ? true : undefined} className="marquee-list" key={copy}>
            {items.map((item, i) => {
              const { label, icon } = typeof item === 'string' ? { label: item, icon: undefined } : item;
              return (
                <li className="marquee-item" key={`${label}-${i}`}>
                  <span className="marquee-label">
                    {icon ? <span className="marquee-icon">{icon}</span> : null}
                    <span>{label}</span>
                  </span>
                  <Sparkle />
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}
