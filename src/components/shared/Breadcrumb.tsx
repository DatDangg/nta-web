import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  /** Căn giữa breadcrumb — dùng khi hero căn giữa để trục giữa khớp tiêu đề. */
  centered?: boolean;
  items: BreadcrumbItem[];
}

export function Breadcrumb({ centered = false, items }: BreadcrumbProps) {
  const t = useTranslations('nav');
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
