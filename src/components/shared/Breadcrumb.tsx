import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ListingIcon } from '@/components/listing/icons';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  /** Căn giữa breadcrumb — dùng khi hero căn giữa để trục giữa khớp tiêu đề. */
  centered?: boolean;
  items: BreadcrumbItem[];
  /**
   * `pill` — kiểu ảnh mẫu trang danh sách: viên thuốc trắng mờ, icon nhà thay chữ "Trang chủ",
   * mục hiện tại màu thương hiệu. `plain` (mặc định) — dòng chữ xám như cũ.
   */
  variant?: 'plain' | 'pill';
}

export function Breadcrumb({ centered = false, items, variant = 'plain' }: BreadcrumbProps) {
  const t = useTranslations('nav');

  if (variant === 'pill') {
    const crumbs = items.slice(-2);
    return (
      <nav aria-label="Breadcrumb" className={centered ? 'flex justify-center' : ''}>
        <ol className="inline-flex max-w-full flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full border border-white/80 bg-white/75 px-4 py-1.5 text-sm text-text-secondary shadow-[0_6px_20px_-8px_rgb(15_60_70/0.18)] backdrop-blur-md sm:px-5">
          <li className="flex items-center">
            <Link aria-label={t('home')} className="inline-flex size-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-light" href="/">
              <ListingIcon className="size-[18px]" name="home" strokeWidth={2} />
            </Link>
          </li>
          {crumbs.map((item, index) => {
            const isCurrent = index === crumbs.length - 1;
            return (
              <li className="flex items-center gap-2.5" key={`${item.label}-${index}`}>
                {index > 0 && <span aria-hidden="true" className="text-text-secondary/70">›</span>}
                {isCurrent || !item.href ? (
                  <span aria-current={isCurrent ? 'page' : undefined} className={isCurrent ? 'font-medium text-primary-active' : undefined}>{item.label}</span>
                ) : (
                  <Link className="inline-flex min-h-8 items-center transition-colors hover:text-primary" href={item.href}>{item.label}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  const crumbs = [{ label: t('home'), href: '/' }, ...items.slice(-2)];

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
      <ol className={`flex flex-wrap items-center gap-2 ${centered ? 'justify-center' : ''}`}>
        {crumbs.map((item, index) => {
          const isCurrent = index === crumbs.length - 1;
          return (
            <li className="flex items-center gap-2" key={`${item.label}-${index}`}>
              {index > 0 && <span aria-hidden="true">›</span>}
              {isCurrent || !item.href ? (
                <span aria-current={isCurrent ? 'page' : undefined} className={isCurrent ? 'text-text-primary' : undefined}>{item.label}</span>
              ) : (
                <Link className="min-h-11 inline-flex items-center hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus" href={item.href}>{item.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
