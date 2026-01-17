import React from 'react';
import logoSvg from '@/assets/images/logos/logo.svg';

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={logoSvg} 
        alt="Pair Connect Logo" 
        className="w-10 h-10 object-contain"
      />
      <span className="text-2xl font-bold gradient-text font-poppins">Pair Connect</span>
    </div>
  );
};