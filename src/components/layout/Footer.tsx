import React from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import logoSvg from '@/assets/images/logos/logo.svg';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--color-dark-card)] py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="w-8 h-8 shrink-0">
            <img 
              src={logoSvg} 
              alt="Pair Connect Logo" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Copyright */}
          <p className="text-[var(--color-light)] text-center text-sm">
            © {new Date().getFullYear()} <span className="font-bold">Pair Connect</span>. All Rights Reserved.
          </p>

          {/* Social Media */}
          <div className="flex items-center gap-4">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--color-light)] hover:text-cyan transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--color-light)] hover:text-cyan transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--color-light)] hover:text-cyan transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
