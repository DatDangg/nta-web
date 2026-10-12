import Image from 'next/image';

const LOGO_LOCKUP_SRC = '/images/brand/logo-lockup.png';
const LOGO_LOCKUP_WIDTH = 488;
const LOGO_LOCKUP_HEIGHT = 137;

/**
 * Logo thương hiệu NTA — lockup đầy đủ: mark + wordmark chữ "NTA" + tagline "ELEVATING INTELLIGENCE".
 * Dùng chung cho Header/Footer.
 *
 * Lockup là PNG nền trong suốt (`logo-lockup.png`) đã crop sát nội dung, tỉ lệ 488:137 giữ qua `w-auto`.
 * `h-10` (40px) vừa header 64px mobile / 72px desktop.
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
        className="h-10 w-auto"
        height={LOGO_LOCKUP_HEIGHT}
        priority={priority}
        src={LOGO_LOCKUP_SRC}
        width={LOGO_LOCKUP_WIDTH}
      />
    </span>
  );
}
