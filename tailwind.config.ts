import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-active': 'var(--color-primary-active)',
        'primary-light': 'var(--color-primary-light)',
        accent: 'var(--color-accent)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        'background-alt': 'var(--color-background-alt)',
        surface: 'var(--color-surface)',
        'surface-sunken': 'var(--color-surface-sunken)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-inverse': 'var(--color-text-inverse)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        focus: 'var(--color-focus)',
        error: 'var(--color-error)',
        'error-ink': 'var(--color-error-ink)',
        success: 'var(--color-success)',
        'success-ink': 'var(--color-success-ink)',
        warning: 'var(--color-warning)',
        'warning-ink': 'var(--color-warning-ink)',
        overlay: 'var(--color-overlay)',
        skeleton: 'var(--color-skeleton)',
        // Nền tối + token đi kèm (spec §2.1). `accent-ink` nổi bật hơn trên nền ink:
        // `primary` (#009e87) đạt ~5.3:1 trên #111827, `accent` (#21d9ad) đạt ~9.8:1.
        ink: 'var(--color-ink)',
        'ink-surface': 'var(--color-ink-surface)',
        'ink-border': 'var(--color-ink-border)',
        'ink-text': 'var(--color-ink-text)',
        'ink-text-secondary': 'var(--color-ink-text-secondary)',
        'accent-ink': 'var(--color-accent-ink)',
      },
      backgroundImage: { 'gradient-soft': 'var(--bg-gradient-soft)' },
      maxWidth: { container: '1280px' },
      spacing: {
        // Khoảng cách co giãn cho hero/section lớn (spec §2.2) → `py-hero`, `pt-section`, …
        hero: 'var(--space-hero)',
        section: 'var(--space-section)',
      },
      fontFamily: { sans: ['var(--font-sans)'], mono: ['var(--font-mono)'] },
      fontSize: {
        hero: 'var(--text-hero)',
        display: 'var(--text-display)',
        h2: 'var(--text-h2)',
        h3: 'var(--text-h3)',
        'body-lg': 'var(--text-body-lg)',
        base: 'var(--text-base)',
        sm: 'var(--text-sm)',
        xs: 'var(--text-xs)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      zIndex: {
        base: 'var(--z-base)',
        sticky: 'var(--z-sticky)',
        header: 'var(--z-header)',
        drawer: 'var(--z-drawer)',
        modal: 'var(--z-modal)',
      },
      transitionDuration: { fast: '150ms', base: '250ms', slow: '400ms' },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-out-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
