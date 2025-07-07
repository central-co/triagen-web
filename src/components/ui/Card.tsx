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
  const baseClasses = 'rounded-3xl border transition-all duration-300';
  
  const variantClasses = {
    default: darkMode
      ? 'bg-gray-800/30 border-gray-700/50'
      : 'bg-white/40 border-triagen-petrol/10',
    glass: darkMode
      ? 'backdrop-blur-xl bg-gray-800/40 border-gray-700/50'
      : 'backdrop-blur-xl bg-white/50 border-triagen-petrol/10',
    solid: darkMode
      ? 'bg-gray-800 border-gray-700'
      : 'bg-white border-triagen-light-text/20'
  };
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const hoverClasses = hoverEffect 
    ? onClick 
      ? 'hover:scale-[1.005] hover:shadow-lg cursor-pointer' + (darkMode ? ' hover:bg-gray-800/60' : ' hover:bg-white/70')
      : 'hover:scale-[1.005] hover:shadow-lg' + (darkMode ? ' hover:bg-gray-800/50' : ' hover:bg-white/60')
    : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`;

  const Component = onClick ? 'button' : 'div';

  return (
    <Component className={classes} onClick={onClick}>
      {children}
    </Component>
  );
}

export default Card;