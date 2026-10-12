import Image from 'next/image';

const LOGO_MARK_SRC = '/images/brand/logo-mark.png';
const LOGO_MARK_WIDTH = 480;
const LOGO_MARK_HEIGHT = 397;

/**
 * Logo thương hiệu NTA — chỉ dùng mark, không kèm wordmark chữ "NTA".
 * Dùng chung cho Header/Footer.
 *
 * Mark là glyph "N" dạng kính (xanh cyan) nền trong suốt — `logo-mark.png` đã được trim
 * sát viền nên không cần padding thủ công.
 *
 * `alt=""` + `aria-hidden`: tên thương hiệu do `aria-label` ở `<Link>` bao ngoài mang
 * (`homeLabel` = "NTA, trang chủ" / "NTA, home"), thêm alt sẽ đọc trùng.
 */
export function BrandLogo({ className = '', priority = false }: { className?: string; priority?: boolean }) {
  return (
    <span className={`inline-flex items-center ${className}`.trim()}>
      <Image
        alt=""
        aria-hidden="true"
        className="h-9 w-auto"
        height={LOGO_MARK_HEIGHT}
        priority={priority}
        src={LOGO_MARK_SRC}
        width={LOGO_MARK_WIDTH}
      />
    </span>
  );
}
