import React from 'react';
import { Loader2, DivideIcon as LucideIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
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
  const baseClasses = 'group relative font-semibold transition-all duration-300 hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100';
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  };
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl',
    secondary: darkMode 
      ? 'bg-gray-800/50 text-gray-300 border border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50' 
      : 'bg-white/50 text-gray-700 border border-gray-300/50 hover:bg-white/70 hover:border-gray-400/50',
    outline: darkMode
      ? 'border-2 border-gray-600/50 text-gray-300 hover:border-gray-500/50 hover:bg-gray-800/30'
      : 'border-2 border-gray-300/50 text-gray-700 hover:border-gray-400/50 hover:bg-white/30',
    ghost: darkMode
      ? 'text-gray-300 hover:bg-gray-800/30'
      : 'text-gray-700 hover:bg-white/30'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
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
