import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gradient' | 'solid';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'gradient',
  className = '' 
}) => {
  const baseStyles = 'px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center justify-center font-[\'Source_Code_Pro\']';
  
  const variants = {
    gradient: 'bg-gradient-to-r from-[#ff5da2] to-[#4ad3e5] text-[#111827]',
    solid: 'bg-transparent text-[var(--color-light)] border border-[#4ad3e5]'
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
