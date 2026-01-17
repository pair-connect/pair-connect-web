import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Theme, ThemeContextType } from '@/types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize theme immediately to prevent flash
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      const initialTheme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
      
      // Apply theme immediately before React renders
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(initialTheme);
      
      return initialTheme;
    }
    return 'dark';
  });

  // Update theme class and localStorage
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Update data attribute for additional styling hooks
    root.setAttribute('data-theme', theme);
    
    // Save to localStorage
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [theme]);

  // Memoized setTheme function
  const setTheme = useCallback((newTheme: Theme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
    }
  }, []);

  // Helper function to switch theme
  const switchTheme = useCallback(() => {
    setThemeState(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      return newTheme;
    });
  }, []);

  // Memoized toggleTheme function with View Transitions API
  const toggleTheme = useCallback(() => {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      switchTheme();
      return;
    }
    
    // Use View Transitions API for smooth theme transition
    document.startViewTransition(() => {
      switchTheme();
    });
  }, [switchTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export { ThemeContext };