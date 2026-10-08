import type { BreadcrumbItem } from './Breadcrumb';
import { Breadcrumb } from './Breadcrumb';

interface PageHeaderProps {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  variant?: 'centered' | 'left';
}

export function PageHeader({ title, description, breadcrumbs, variant = 'left' }: PageHeaderProps) {
  const centered = variant === 'centered';

  return (
    <header className={`mx-auto w-full max-w-container px-4 py-12 sm:px-6 md:py-16 lg:px-8 ${centered ? 'text-center' : ''}`}>
      <div className={centered ? 'mx-auto max-w-3xl' : ''}>
        <Breadcrumb items={breadcrumbs} />
        <h1 className="mt-6 text-display font-bold leading-tight text-text-primary">{title}</h1>
        <p className={`mt-4 text-body-lg leading-relaxed text-text-secondary ${centered ? 'mx-auto max-w-[65ch]' : 'max-w-[65ch]'}`}>{description}</p>
      </div>
    </header>
  );
}
