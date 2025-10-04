import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Helper function to check if code is running in browser
const isBrowser = typeof window !== 'undefined';

type FontSize = 'normal' | 'large' | 'larger';

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  fontSize: FontSize;
  increaseFontSize: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  fontSize: 'normal',
  increaseFontSize: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Start with a default value (false) for server-side rendering
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  
  // Initialize state once in the browser
  useEffect(() => {
    if (isBrowser) {
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setDarkMode(savedTheme === 'true');
      } else {
        // Check system preference as fallback
        const prefersDark = window.matchMedia && 
          window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
      }

      // Load saved font size
      const savedFontSize = localStorage.getItem('fontSize') as FontSize;
      if (savedFontSize) {
        setFontSize(savedFontSize);
      }
    }
  }, []);

  // Update localStorage when theme changes
  useEffect(() => {
    if (isBrowser) {
      // Save to localStorage
      localStorage.setItem('darkMode', darkMode.toString());
      
      // Add or remove dark class from document.documentElement
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);

  // Update localStorage and document when font size changes
  useEffect(() => {
    if (isBrowser) {
      // Save to localStorage
      localStorage.setItem('fontSize', fontSize);
      
      // Remove all font size classes
      document.documentElement.classList.remove('font-normal', 'font-large', 'font-larger');
      
      // Add current font size class
      document.documentElement.classList.add(`font-${fontSize}`);
    }
  }, [fontSize]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const increaseFontSize = () => {
    setFontSize((current) => {
      if (current === 'normal') return 'large';
      if (current === 'large') return 'larger';
      return 'normal'; // cycle back to normal
    });
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, fontSize, increaseFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};