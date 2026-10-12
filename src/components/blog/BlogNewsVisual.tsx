import type { CSSProperties } from 'react';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

const GLASS = 'border border-white/80 bg-white/45 shadow-[0_24px_60px_-20px_rgb(0_110_100/0.35),inset_0_1px_0_rgb(255_255_255/0.9)] backdrop-blur-xl';
const TILT = { transform: 'perspective(1100px) rotateY(-18deg) rotateX(8deg) rotateZ(-6deg)' };

/** Quả cầu kính teal (bóng sáng lệch trái-trên). */
function Sphere({ className, style }: { className: string; style?: CSSProperties }) {
  return (
    <span
      className={`listing-float absolute rounded-full bg-[radial-gradient(circle_at_32%_28%,#ffffff_0%,#9ff3e3_22%,#2dd4bf_58%,#0b9f8a_100%)] shadow-[0_18px_36px_-12px_rgb(0_158_135/0.55)] ${className}`}
      style={style}
    />
  );
}

/**
 * Minh hoạ trang trí hero `/blog` (mockup "Tin tức & Cập nhật"): tấm kính nghiêng 3D mang "tờ báo"
 * (khối tiêu đề, dòng chữ, ô ảnh) + quả cầu kính trôi nhẹ. Thuần CSS/SVG, không ảnh render sẵn.
 */
export function BlogNewsVisual() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-[11/9] w-full max-w-[540px]" data-motion-off>
      <div className="absolute -right-8 top-[12%] size-72 rounded-full bg-[#5eead4] opacity-25 blur-3xl" />
      <div className="absolute inset-x-[4%] bottom-[6%] h-[34%] rounded-[50%] border border-white/70 bg-white/20" style={{ transform: 'rotateX(68deg)' }} />
      <div className="listing-float absolute left-[18%] top-[8%] h-[72%] w-[66%]" style={delay(100)}>
        <div className={`relative size-full rounded-[36px] ${GLASS}`} style={TILT}>
          <div className="absolute inset-[7%] flex flex-col gap-[6%] rounded-[26px] border border-white/70 bg-[linear-gradient(160deg,rgb(255_255_255/0.7),rgb(178_240_228/0.4))] p-[8%]">
            <div className="flex gap-[7%]">
              <div className="flex aspect-[4/3] w-[48%] flex-col justify-center gap-[12%] rounded-[14px] bg-[linear-gradient(140deg,#2dd4bf,#0b9f8a)] px-[9%] shadow-[0_12px_24px_-12px_rgb(0_158_135/0.7)]">
                <span className="h-[9%] w-full rounded-full bg-white/90" />
                <span className="h-[9%] w-3/4 rounded-full bg-white/80" />
                <span className="h-[9%] w-5/6 rounded-full bg-white/80" />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-[14%]">
                <span className="h-2 w-full rounded-full bg-white" />
                <span className="h-2 w-4/5 rounded-full bg-white" />
                <span className="h-2 w-full rounded-full bg-white" />
              </div>
            </div>
            <div className="flex flex-1 gap-[7%]">
              <div className="flex flex-1 flex-col justify-center gap-[14%]">
                <span className="h-2 w-full rounded-full bg-white" />
                <span className="h-2 w-5/6 rounded-full bg-white" />
                <span className="h-2 w-2/3 rounded-full bg-white" />
              </div>
              <svg className="w-[44%] self-center drop-shadow-[0_10px_18px_rgb(0_158_135/0.35)]" fill="none" viewBox="0 0 120 96">
                <rect fill="url(#blog-news-photo)" height="96" rx="16" width="120" />
                <circle cx="38" cy="32" fill="#fff" fillOpacity="0.9" r="10" />
                <path d="M10 84 46 50l20 18 18-14 26 30H10Z" fill="#fff" fillOpacity="0.85" />
                <defs>
                  <linearGradient id="blog-news-photo" x1="0" x2="1" y1="0" y2="1">
                    <stop stopColor="#5eead4" />
                    <stop offset="1" stopColor="#0b9f8a" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Sphere className="left-[4%] top-[48%] size-[15%]" style={delay(350)} />
      <Sphere className="right-[4%] top-[4%] size-[11%]" style={delay(500)} />
      <Sphere className="bottom-[16%] right-[14%] size-[7%]" style={delay(650)} />
    </div>
  );
}
