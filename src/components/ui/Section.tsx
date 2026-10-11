import type { HTMLAttributes } from 'react';
import { Container } from './Container';

type SectionVariant = 'default' | 'alt' | 'accent';

type SectionProps = HTMLAttributes<HTMLElement> & {
  variant?: SectionVariant;
  size?: 'default' | 'prose' | 'narrow';
};

const variantStyles: Record<SectionVariant, string> = {
  default: 'bg-background text-text-primary',
  alt: 'bg-background-alt text-text-primary',
  accent: 'bg-primary text-text-inverse',
};

export function Section({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...sectionProps
}: SectionProps) {
  return (
    <section
      className={`py-12 md:py-16 xl:py-24 ${variantStyles[variant]} ${className}`.trim()}
      {...sectionProps}
    >
      <Container size={size}>{children}</Container>
    </section>
  );
}
