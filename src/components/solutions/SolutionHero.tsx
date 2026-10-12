import { Container } from '@/components/ui/Container';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { ShotImage } from './ShotImage';

export interface HeroBreadcrumb {
  label: string;
  href?: string;
}

type SolutionHeroProps = {
  /** Đường dẫn breadcrumb đầy đủ (không cần `Trang chủ` — `Breadcrumb` tự thêm). */
  breadcrumbs: HeroBreadcrumb[];
  title: string;
  description: string;
  /** Ảnh sản phẩm. Rỗng → bỏ qua hẳn khối ảnh, không để khung rỗng. */
  image?: string;
  imageAlt?: string;
  /** Tỉ lệ ảnh đo sẵn — quyết định cơ chế hiển thị, xem `shotLayout`. */
  imageRatio?: number;
  /**
   * Giới hạn bề rộng riêng cho ảnh gần vuông.
   *
   * Ảnh ~1.06 ở bề rộng 1280 sẽ cao ~1200px, chiếm gần hết viewport. `max-w-[960px]`
   * co nó còn ~906px rồi `max-h` xử lý tiếp — nhỏ hơn ảnh 1.36 nhưng không méo, không mất khung.
   */
  imageMaxW?: string;
  /**
   * Chú thích dưới ảnh hero (`<figcaption>` trong `<figure>`) — chỉ HRM dùng
   * ("Giao diện minh hoạ" / "Illustrative interface", spec §7). Thiếu → không caption.
   */
  caption?: string;
  /**
   * Đường dẫn TƯƠNG ĐỐI, không có tiền tố locale — `Link` của next-intl tự thêm
   * (`/contact` → `/contact` ở VI, `/en/contact` ở EN). KHÔNG truyền URL tuyệt đối.
   */
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string; ariaLabel?: string };
};

/**
 * Hero dùng chung cho cả 4 trang giải pháp.
 *
 * **2 container, 2 mục đích khác nhau** (spec §3):
 * - phần **text** dùng `size="narrow"` (520px) để **căn giữa** — đây là khối duy nhất
 *   trên site được thiết kế theo trục giữa.
 * - phần **ảnh** dùng `default` (1280px) để ảnh tràn rộng. Dùng `narrow` cho ảnh sẽ bóp
 *   thành dải hẹp 520px, lệch tỉ lệ giữa các trang.
 *
 * Breadcrumb căn giữa theo trục của hero — không thì nó lệch trái giữa chừng so với H1.
 */
export function SolutionHero({
  breadcrumbs,
  title,
  description,
  image,
  imageAlt,
  imageRatio,
  imageMaxW = 'max-w-full',
  caption,
  primaryCta,
  secondaryCta,
}: SolutionHeroProps) {
  // Hero dùng `max-h` lớn hơn zig-zag (640 vs 420) vì ảnh có trọn bề rộng 1280.
  // Nguồn duy nhất — không thêm `max-h-*` ở nơi khác (xem `MAX_H` bên dưới).
  const MAX_H = 'max-h-[420px] lg:max-h-[640px]';

  return (
    <header className="bg-gradient-soft py-hero">
      <Container size="narrow">
        <div className="text-center">
          <Breadcrumb centered items={breadcrumbs} />
          <h1 className="mt-6 text-display font-bold tracking-tight text-text-primary">{title}</h1>
          <p className="mx-auto mt-4 max-w-[62ch] text-body-lg text-text-secondary">
            {description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {/* `Link` của next-intl: tự thêm tiền tố locale + prefetch. KHÔNG dùng
                `localizedPath()` ở đây — hàm đó trả URL tuyệt đối theo NEXT_PUBLIC_SITE_URL,
                nên trên preview (Vercel) bấm nút sẽ nhảy sang domain production. */}
            <Link className={`${buttonStyles('primary', 'lg')} w-full sm:w-auto`} href={primaryCta.href}>
              {primaryCta.label}
            </Link>
            <Link
              aria-label={secondaryCta.ariaLabel}
              className={`${buttonStyles('outline', 'lg')} w-full sm:w-auto`}
              href={secondaryCta.href}
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>
      </Container>

      {image ? (
        <Container className="mt-12 sm:mt-16">
          {/* Caption chỉ render khi có (`caption` prop) — HRM là mock vẽ tay nên mọi ảnh
              phải nói rõ (spec §7). Figure/figcaption semantic để screen reader đọc
              alt trước, caption sau. */}
          {/* mx-auto BẮT BUỘC khi imageMaxW hẹp hơn Container (HRM 960px) —
              không thì figure dính mép trái thay vì căn giữa. */}
          <figure className={`${imageMaxW} mx-auto`}>
            <ShotImage
              alt={imageAlt ?? ''}
              height={1440}
              maxH={MAX_H}
              priority
              ratio={imageRatio}
              skin={`${imageMaxW} mx-auto rounded-lg border border-border shadow-lg`}
              sizes="(max-width: 1024px) 100vw, 1280px"
              src={image}
            />
            {caption ? (
              <figcaption className="mt-3 text-body-sm text-text-secondary text-center">
                {caption}
              </figcaption>
            ) : null}
          </figure>
        </Container>
      ) : null}
    </header>
  );
}