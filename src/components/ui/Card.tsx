import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Surface container. Like Button, it themes itself through `dark:` variants, so
 * the `darkMode` prop is accepted only for source compatibility.
 */
const card = cva(
  'rounded-lg border transition-[border-color,box-shadow] duration-200 ease-out bg-white border-triagen-border-light dark:bg-gray-900 dark:border-gray-800',
  {
    variants: {
      padding: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hoverEffect: {
        true: 'hover:shadow-sm hover:border-neutral-300 dark:hover:border-gray-700',
        false: '',
      },
      clickable: {
        true: 'cursor-pointer text-left w-full',
        false: '',
      },
    },
    defaultVariants: {
      padding: 'md',
      hoverEffect: false,
      clickable: false,
    },
  },
);

interface CardProps extends Omit<VariantProps<typeof card>, 'clickable'> {
  children: React.ReactNode;
  /** @deprecated Theming is handled by `dark:` variants; kept for compatibility. */
  darkMode?: boolean;
  className?: string;
  /** Retained for call-site compatibility; all variants render the same surface. */
  variant?: 'default' | 'glass' | 'solid';
  onClick?: () => void;
}

function Card({
  children,
  className,
  hoverEffect = false,
  padding = 'md',
  onClick,
}: Readonly<CardProps>) {
  const classes = card({ padding, hoverEffect, clickable: Boolean(onClick), className });

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {children}
      </button>
    );
  }

  return <div className={classes}>{children}</div>;
}

export default Card;
