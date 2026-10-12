import Image from 'next/image';

const LOGO_MARK_SRC = '/images/brand/logo-mark.png';
const LOGO_MARK_WIDTH = 480;
const LOGO_MARK_HEIGHT = 397;

/**
 * Logo thương hiệu NTA (mark + wordmark "NTA") dùng chung cho Header/Footer.
 *
 * Mark là glyph "N" dạng kính (xanh cyan) nền trong suốt — `logo-mark.png` đã được trim
 * sát viền nên đặt cạnh wordmark chỉ cần `gap`, không cần padding thủ công.
 *
 * `alt=""` + `aria-hidden`: phần chữ "NTA" và `aria-label` ở `<Link>` bao ngoài đã đủ
 * ngữ nghĩa cho screen reader, thêm alt sẽ đọc trùng.
 */
export function BrandLogo({ className = '', priority = false }: { className?: string; priority?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <Image
        alt=""
        aria-hidden="true"
        className="h-9 w-auto"
        height={LOGO_MARK_HEIGHT}
        priority={priority}
        src={LOGO_MARK_SRC}
        width={LOGO_MARK_WIDTH}
      />
      <span className="text-xl font-semibold tracking-tight text-text-primary">NTA</span>
    </span>
  );
}
