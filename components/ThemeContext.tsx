/**
 * @file This file provides theme context for the application, including the ThemeProvider component and the useTheme hook.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Defines the possible theme types.
 */
type Theme = 'light' | 'dark';

/**
 * Defines the shape of the theme context.
 */
interface ThemeContextType {
  /** The current theme. */
  theme: Theme;
  /** Function to toggle the theme. */
  toggleTheme: () => void;
}

/**
 * React context for the theme.
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Provides theme state to its children components.
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components to render.
 */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('vtg_theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('vtg_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook for accessing the theme context.
 * @returns {ThemeContextType} The theme context.
 * @throws {Error} If used outside of a ThemeProvider.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};