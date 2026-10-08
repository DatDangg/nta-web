import type { HTMLAttributes } from 'react';

type SectionVariant = 'default' | 'alt' | 'accent';

type SectionProps = HTMLAttributes<HTMLElement> & {
  variant?: SectionVariant;
};

const variantStyles: Record<SectionVariant, string> = {
  default: 'bg-background text-text-primary',
  alt: 'bg-background-alt text-text-primary',
  accent: 'bg-primary text-text-inverse',
};

export function Section({
  variant = 'default',
  className = '',
  children,
  ...sectionProps
}: SectionProps) {
  return (
    <section
      className={`py-12 md:py-16 xl:py-24 ${variantStyles[variant]} ${className}`.trim()}
      {...sectionProps}
    >
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
