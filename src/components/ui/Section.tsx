import type { HTMLAttributes } from 'react';
import { Container, type ContainerSize } from './Container';

export type SectionVariant = 'default' | 'alt' | 'accent' | 'ink';

/**
 * `standard` — padding chuẩn của site (`py-12 md:py-16 xl:py-24`).
 * `large` — padding co giãn theo viewport (`--space-section`) cho hero và CTA cuối.
 */
type SectionSpacing = 'standard' | 'large';

type SectionProps = HTMLAttributes<HTMLElement> & {
  variant?: SectionVariant;
  /** Bề rộng nội dung — dùng lại `ContainerSize` (Container là nguồn duy nhất). */
  size?: ContainerSize;
  /** Cỡ padding dọc của section. Không phải bề rộng nội dung — xem `size`. */
  spacing?: SectionSpacing;
};

const variantStyles: Record<SectionVariant, string> = {
  default: 'bg-background text-text-primary',
  alt: 'bg-background-alt text-text-primary',
  accent: 'bg-primary text-text-inverse',
  // Nền tối cho section AI. Dùng kèm `text-ink-text` — `--color-primary` không đạt
  // contrast trên nền này (spec §2.1).
  ink: 'bg-ink text-ink-text',
};

const spacingStyles: Record<SectionSpacing, string> = {
  standard: 'py-12 md:py-16 xl:py-24',
  large: 'py-section',
};

export function Section({
  variant = 'default',
  size = 'default',
  spacing = 'standard',
  className = '',
  children,
  ...sectionProps
}: SectionProps) {
  return (
    <section
      className={`${spacingStyles[spacing]} ${variantStyles[variant]} ${className}`.trim()}
      {...sectionProps}
    >
      <Container size={size}>{children}</Container>
    </section>
  );
}
