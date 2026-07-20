import React from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  darkMode?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  contentAlignment?: 'left' | 'center' | 'right';
  className?: string;
  title?: string;
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  darkMode = false,
  icon: Icon,
  iconPosition = 'right',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  contentAlignment = 'center',
  className = '',
  title
}: Readonly<ButtonProps>) {
  const baseClasses = 'group relative font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-triagen-secondary';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-sm',
    md: 'px-5 py-2.5 text-[0.9rem] rounded',
    lg: 'px-6 py-3 text-base rounded'
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-[1.1rem] w-[1.1rem]',
    lg: 'h-5 w-5'
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-triagen-primary text-white hover:bg-triagen-secondary',
    secondary: darkMode
      ? 'bg-gray-800 text-gray-100 border border-gray-600 hover:bg-gray-700/80'
      : 'bg-white text-triagen-primary border border-triagen-border-light hover:bg-neutral-50',
    outline: darkMode
      ? 'border border-gray-600 text-gray-300 hover:bg-gray-800/30'
      : 'border border-triagen-border-light text-triagen-primary hover:bg-neutral-50',
    ghost: darkMode
      ? 'text-gray-300 hover:bg-gray-800/30 hover:text-gray-100'
      : 'text-triagen-secondary hover:bg-neutral-100 hover:text-triagen-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
      aria-busy={isLoading}
      title={title}
    >
      <span className={`relative flex items-center gap-2 ${alignmentClasses[contentAlignment]}`}>
        {isLoading ? (
          <Loader2 className={`${iconSizeClasses[size]} animate-spin`} aria-hidden="true" />
        ) : (
          Icon && iconPosition === 'left' && <Icon className={iconSizeClasses[size]} aria-hidden="true" />
        )}
        {children && <span>{children}</span>}
        {!isLoading && Icon && iconPosition === 'right' && (
          <Icon className={iconSizeClasses[size]} aria-hidden="true" />
        )}
      </span>
    </button>
  );
}

export default Button;
