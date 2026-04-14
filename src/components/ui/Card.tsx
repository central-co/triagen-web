import React from 'react';

interface CardProps {
  children: React.ReactNode;
  darkMode?: boolean;
  className?: string;
  hoverEffect?: boolean;
  variant?: 'default' | 'glass' | 'solid';
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

function Card({
  children,
  darkMode = false,
  className = '',
  hoverEffect = false,
  variant = 'glass',
  padding = 'md',
  onClick
}: CardProps) {
  const baseClasses = 'rounded border transition-all duration-300';

  const variantClasses = {
    default: darkMode
      ? 'bg-gray-900 border-gray-800'
      : 'bg-white border-neutral-200',
    glass: darkMode
      ? 'bg-gray-900 border-gray-800'
      : 'bg-white border-neutral-200',
    solid: darkMode
      ? 'bg-gray-900 border-gray-800'
      : 'bg-white border-neutral-200'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverClasses = hoverEffect
    ? onClick
      ? 'hover:shadow-sm cursor-pointer' + (darkMode ? ' hover:border-gray-700' : ' hover:border-neutral-300')
      : 'hover:shadow-sm' + (darkMode ? ' hover:border-gray-700' : ' hover:border-neutral-300')
    : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`;

  const Component = onClick ? 'button' : 'div';

  return (
    <Component className={classes} onClick={onClick} {...(onClick ? { type: 'button' as const } : {})}>
      {children}
    </Component>
  );
}

export default Card;
