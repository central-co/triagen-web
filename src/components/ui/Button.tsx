import React from 'react';
import { Loader2, DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'primary-solid' | 'secondary' | 'outline' | 'outline-purple' | 'ghost' | 'danger' | 'success' | 'green-test' | 'purple-test' | 'favorite-toggle';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  darkMode?: boolean;
  icon?: typeof LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  contentAlignment?: 'left' | 'center' | 'right';
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
  contentAlignment = 'center'
}: Readonly<ButtonProps>) {
  const baseClasses = 'group relative font-medium transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-sm',
    md: 'px-5 py-2.5 text-[0.9rem] rounded',
    lg: 'px-6 py-3 text-base rounded'
  };

  const variantClasses = {
    primary: darkMode
      ? 'bg-triagen-primary text-white hover:bg-triagen-secondary focus:ring-triagen-primary/50'
      : 'bg-triagen-primary text-white hover:bg-triagen-secondary focus:ring-triagen-primary/50',
    'primary-solid': darkMode
      ? 'bg-triagen-primary text-white hover:bg-triagen-secondary focus:ring-triagen-primary/50'
      : 'bg-triagen-primary text-white hover:bg-triagen-secondary focus:ring-triagen-primary/50',
    secondary: darkMode
      ? 'bg-gray-800 text-gray-100 border border-gray-600 hover:bg-gray-700/80 focus:ring-gray-500/50'
      : 'bg-white text-triagen-primary border border-neutral-200 hover:bg-neutral-50 focus:ring-neutral-200/50',
    outline: darkMode
      ? 'border border-gray-600 text-gray-300 hover:bg-gray-800/30'
      : 'border border-neutral-200 text-triagen-primary hover:bg-neutral-50',
    'outline-purple': darkMode
      ? 'border border-triagen-primary text-triagen-primary hover:bg-triagen-primary/5'
      : 'border border-triagen-primary text-triagen-primary hover:bg-triagen-primary/5',
    'green-test': darkMode
      ? 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700'
      : 'bg-white border border-neutral-200 text-triagen-primary hover:bg-neutral-50',
    'purple-test': darkMode
      ? 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700'
      : 'bg-white border border-neutral-200 text-triagen-primary hover:bg-neutral-50',
    'favorite-toggle': darkMode
      ? 'text-yellow-400 hover:text-yellow-300'
      : 'text-gray-400 hover:text-gray-800',
    ghost: darkMode
      ? 'text-gray-300 hover:bg-gray-800/30 hover:text-gray-100'
      : 'text-triagen-secondary hover:bg-neutral-100 hover:text-triagen-primary',
    danger: darkMode
      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50'
      : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50',
    success: darkMode
      ? 'bg-triagen-primary text-white hover:bg-triagen-secondary'
      : 'bg-triagen-primary text-white hover:bg-triagen-secondary'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass}`;

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
    >
      <div className={`relative flex items-center ${alignmentClasses[contentAlignment]} space-x-2`}>
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Carregando...</span>
          </>
        ) : (
          <>
            {Icon && iconPosition === 'left' && (
              <Icon className="h-5 w-5 group-hover:scale-105 transition-transform duration-200" />
            )}
            {children && <span>{children}</span>}
            {Icon && iconPosition === 'right' && (
              <Icon className="h-5 w-5 group-hover:scale-105 transition-transform duration-200" />
            )}
          </>
        )}
      </div>
    </button>
  );
}

export default Button;
