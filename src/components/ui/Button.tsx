import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2, type LucideIcon } from 'lucide-react';

/**
 * The product's only button.
 *
 * Theming runs through Tailwind `dark:` variants rather than a prop, so a button
 * is styled correctly whether or not the caller knows the current theme. The
 * `darkMode` prop is still accepted for source compatibility and ignored.
 */
const button = cva(
  'group relative inline-flex font-medium transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-triagen-secondary dark:focus-visible:ring-gray-400 dark:focus-visible:ring-offset-gray-900',
  {
    variants: {
      variant: {
        primary:
          'bg-triagen-primary text-white hover:bg-triagen-secondary dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white',
        secondary:
          'bg-white text-triagen-primary border border-triagen-border-light hover:bg-neutral-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700/80',
        outline:
          'border border-triagen-border-light text-triagen-primary hover:bg-neutral-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800/40',
        ghost:
          'text-triagen-secondary hover:bg-neutral-100 hover:text-triagen-primary dark:text-gray-300 dark:hover:bg-gray-800/40 dark:hover:text-gray-100',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm rounded-sm',
        md: 'px-5 py-2.5 text-[0.9rem] rounded',
        lg: 'px-6 py-3 text-base rounded',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

const ICON_SIZES = {
  sm: 'h-4 w-4',
  md: 'h-[1.1rem] w-[1.1rem]',
  lg: 'h-5 w-5',
} as const;

const ALIGNMENTS = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const;

interface ButtonProps extends VariantProps<typeof button> {
  children?: React.ReactNode;
  size?: keyof typeof ICON_SIZES;
  isLoading?: boolean;
  /** @deprecated Theming is handled by `dark:` variants; kept for compatibility. */
  darkMode?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  contentAlignment?: keyof typeof ALIGNMENTS;
  className?: string;
  title?: string;
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  iconPosition = 'right',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  contentAlignment = 'center',
  className,
  title,
}: Readonly<ButtonProps>) {
  const iconSize = ICON_SIZES[size];

  return (
    <button
      className={button({ variant, size, fullWidth, className })}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
      aria-busy={isLoading}
      title={title}
    >
      <span className={`relative flex w-full items-center gap-2 ${ALIGNMENTS[contentAlignment]}`}>
        {isLoading ? (
          <Loader2 className={`${iconSize} animate-spin`} aria-hidden="true" />
        ) : (
          Icon && iconPosition === 'left' && <Icon className={iconSize} aria-hidden="true" />
        )}
        {children && <span>{children}</span>}
        {!isLoading && Icon && iconPosition === 'right' && (
          <Icon className={iconSize} aria-hidden="true" />
        )}
      </span>
    </button>
  );
}

export default Button;
