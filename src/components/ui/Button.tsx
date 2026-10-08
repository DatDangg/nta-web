import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-text-inverse hover:bg-primary-hover active:bg-primary-active',
  secondary: 'border border-transparent bg-background-alt text-text-primary hover:border-strong hover:bg-border',
  ghost: 'bg-transparent text-primary-active hover:bg-background-alt',
  outline: 'border border-border bg-transparent text-primary-active hover:bg-background-alt',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-4 text-sm',
  md: 'min-h-11 px-5 text-base',
  lg: 'min-h-12 px-6 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-w-11 items-center justify-center rounded-full font-medium transition-[background-color,border-color,color,transform] duration-fast ease-out-expo active:scale-[0.98] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim()}
      {...buttonProps}
    />
  );
}
