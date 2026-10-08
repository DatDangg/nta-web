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
      },
      backgroundImage: { 'gradient-soft': 'var(--bg-gradient-soft)' },
      maxWidth: { container: '1280px' },
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
