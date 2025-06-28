
import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  darkMode?: boolean;
  className?: string;
  hoverEffect?: boolean;
  variant?: 'default' | 'glass' | 'solid';
  padding?: 'sm' | 'md' | 'lg';
}

function Card({
  children,
  darkMode = false,
  className = '',
  hoverEffect = false,
  variant = 'glass',
  padding = 'md'
}: CardProps) {
  const baseClasses = 'rounded-3xl border transition-all duration-500';
  
  const variantClasses = {
    default: darkMode
      ? 'bg-gray-800/30 border-gray-700/50'
      : 'bg-white/30 border-gray-200/50',
    glass: darkMode
      ? 'backdrop-blur-xl bg-gray-800/40 border-gray-700/50'
      : 'backdrop-blur-xl bg-white/40 border-gray-200/50',
    solid: darkMode
      ? 'bg-gray-800 border-gray-700'
      : 'bg-white border-gray-200'
  };
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const hoverClasses = hoverEffect 
    ? 'hover:scale-[1.02] hover:shadow-2xl' 
    : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`;

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

export default Card;
