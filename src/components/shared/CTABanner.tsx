import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

interface CTABannerProps {
  title: string;
  description: string;
  /**
   * Giữ cho tương thích với 7 caller hiện có (home `primary`, các trang khác `alt`).
   * Sau redesign, dải CTA dùng CÙNG một ảnh nền teal ở mọi trang; `variant` chỉ còn chọn
   * màu nền teal dự phòng khi ảnh không tải được (`primary` sáng hơn `alt`).
   */
  variant?: 'primary' | 'alt';
  href?: string;
}

const BULLET_ICONS = {
  bulletConsulting: (
    <svg aria-hidden="true" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect height="12" rx="2" width="18" x="3" y="4" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  ),
  bulletSolution: (
    <svg aria-hidden="true" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  ),
  bulletDeploy: (
    <svg aria-hidden="true" className="size-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  ),
} as const;

const BULLETS = ['bulletConsulting', 'bulletSolution', 'bulletDeploy'] as const;

/**
 * Dải CTA cuối trang (mọi route): nền ảnh teal + chữ trắng, 3 gạch đầu dòng có icon,
 * nút pill trắng "Liên hệ tư vấn" kèm mũi tên.
 *
 * Ảnh nền là ảnh trang trí (`alt=""` + `aria-hidden`) dùng `next/image fill`; overlay gradient
 * giữ contrast chữ trắng đạt AA trên vùng nội dung. `Container` là nguồn bề rộng duy nhất —
 * KHÔNG đặt `px-*` ở `<section>`.
 */
export function CTABanner({ title, description, variant = 'primary', href = '/contact' }: CTABannerProps) {
  const t = useTranslations('common.cta');
  const base = variant === 'primary' ? 'bg-primary' : 'bg-primary-active';

  return (
    <section className={`relative overflow-hidden py-12 text-text-inverse md:py-16 ${base}`}>
      <Image alt="" aria-hidden className="object-cover" fill sizes="100vw" src="/images/home/footer-cta-bg.jpg" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/25 to-transparent" />
      <Container className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-h2 font-bold leading-tight">{title}</h2>
          <p className="mt-3 text-body-lg text-text-inverse">{description}</p>
          <ul className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            {BULLETS.map((bullet, index) => (
              <li className="flex items-center gap-3" key={bullet}>
                {index > 0 && <span aria-hidden="true" className="hidden h-5 w-px bg-white/40 sm:block" />}
                {BULLET_ICONS[bullet]}
                <span className="text-sm">{t(bullet)}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link className={`${buttonStyles('inverse', 'md')} shrink-0 gap-2 whitespace-nowrap`} href={href}>
          {t('contact')}
          <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </Container>
    </section>
  );
}
