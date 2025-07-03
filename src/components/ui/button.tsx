
import React from 'react';
import { Loader2, DivideIcon as LucideIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  darkMode?: boolean;
  icon?: typeof LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
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
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'group relative font-semibold transition-all duration-300 hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  };
  
  const variantClasses = {
    primary: 'bg-triagen-dark-bg text-white hover:bg-triagen-primary-blue hover:shadow-xl focus:ring-triagen-primary-blue/50',
    secondary: darkMode 
      ? 'bg-gray-800/70 text-gray-100 border border-triagen-border-dark hover:bg-gray-700/80 hover:border-gray-500/50 focus:ring-gray-500/50' 
      : 'bg-white/70 text-triagen-dark-bg border border-triagen-border-light hover:bg-white/90 hover:border-triagen-text-light/50 focus:ring-triagen-primary-blue/50',
    outline: darkMode
      ? 'border-2 border-triagen-border-dark text-gray-300 hover:border-gray-500/50 hover:bg-gray-800/30 focus:ring-gray-500/50'
      : 'border-2 border-triagen-border-light text-triagen-dark-bg hover:border-triagen-text-light/50 hover:bg-white/30 focus:ring-triagen-primary-blue/50',
    ghost: darkMode
      ? 'text-gray-300 hover:bg-gray-800/30 focus:ring-gray-500/50'
      : 'text-triagen-dark-bg hover:bg-white/30 focus:ring-triagen-primary-blue/50',
    danger: darkMode
      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50'
      : 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50',
    success: 'bg-triagen-secondary-green text-white hover:bg-triagen-secondary-green/90 focus:ring-triagen-secondary-green/50'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      <div className="relative flex items-center justify-center space-x-2">
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Carregando...</span>
          </>
        ) : (
          <>
            {Icon && iconPosition === 'left' && (
              <Icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            )}
            {children && <span>{children}</span>}
            {Icon && iconPosition === 'right' && (
              <Icon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            )}
          </>
        )}
      </div>
    </button>
  );
}

export default Button;
