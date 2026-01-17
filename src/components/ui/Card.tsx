import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  neonBorder?: boolean;
  borderColor?: 'cyan' | 'magenta' | 'purple';
  variant?: 'default' | 'dark';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  neonBorder = false,
  borderColor = 'cyan',
  variant = 'dark'
}) => {
  const borderColors = {
    cyan: 'border-[#4ad3e5]',
    magenta: 'border-[#ff5da2]',
    purple: 'border-[#a855f7]'
  };

  const bgColors = {
    default: 'bg-[var(--color-dark-card)]',
    dark: 'bg-[var(--color-dark-card)]'
  };

  return (
    <div 
      className={`
        ${bgColors[variant]} rounded-[5px] p-6 
        ${neonBorder 
          ? `border-2 ${borderColors[borderColor]}` 
          : 'border border-[#4ad3e5]'
        }
        ${className}
      `}
      style={{ color: 'var(--color-light)' }}
    >
      {children}
    </div>
  );
};