import React from 'react';
import { Stack } from '@/types';

interface StackBadgeProps {
  stack: Stack | null | undefined;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const getStackColor = (stack: Stack): string => {
  switch (stack) {
    case 'Frontend':
      return 'border-[#069a9a] text-[#069a9a]';
    case 'Backend':
      return 'border-[#ff5da2] text-[#ff5da2]';
    case 'Fullstack':
      return 'border-[#a16ee4] text-[#a16ee4]';
    default:
      return 'border-[#4ad3e5] text-[#4ad3e5]';
  }
};

// Helper function to get stack color as hex for inline styles
export const getStackColorHex = (stack: Stack): string => {
  switch (stack) {
    case 'Frontend':
      return '#069a9a';
    case 'Backend':
      return '#ff5da2';
    case 'Fullstack':
      return '#a16ee4';
    default:
      return '#4ad3e5';
  }
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  switch (size) {
    case 'sm':
      return 'text-xs px-2 py-0.5';
    case 'md':
      return 'text-sm px-3 py-1';
    case 'lg':
      return 'text-base px-4 py-1.5';
    default:
      return 'text-xs px-2 py-0.5';
  }
};

export const StackBadge: React.FC<StackBadgeProps> = ({ 
  stack, 
  className = '', 
  size = 'sm' 
}) => {
  if (!stack) return null;
  
  const colorClasses = getStackColor(stack);
  const sizeClasses = getSizeClasses(size);
  
  return (
    <span
      className={`${colorClasses} ${sizeClasses} border bg-[var(--color-dark-bg)] rounded font-medium inline-flex items-center justify-center ${className}`}
    >
      {stack}
    </span>
  );
};
