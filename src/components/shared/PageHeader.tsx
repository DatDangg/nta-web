import type { BreadcrumbItem } from './Breadcrumb';
import { Breadcrumb } from './Breadcrumb';
import { Container } from '@/components/ui/Container';

interface PageHeaderProps {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  variant?: 'centered' | 'left';
}

export function PageHeader({ title, description, breadcrumbs, variant = 'left' }: PageHeaderProps) {
  const centered = variant === 'centered';

  return (
    <header className={`py-12 md:py-16 ${centered ? 'text-center' : ''}`}>
      <Container>
      <div className={centered ? 'mx-auto max-w-3xl' : ''}>
        <Breadcrumb items={breadcrumbs} />
        <h1 className="mt-6 text-display font-bold leading-tight text-text-primary">{title}</h1>
        <p className={`mt-4 text-body-lg leading-relaxed text-text-secondary ${centered ? 'mx-auto max-w-[65ch]' : 'max-w-[65ch]'}`}>{description}</p>
      </div>
      </Container>
    </header>
  );
}
