import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

/**
 * @interface ThemeContextType
 * @description Represents the shape of the theme context.
 * @property {Theme} theme The current theme.
 * @property {() => void} toggleTheme Toggles the theme.
 */
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * @component ThemeProvider
 * @description Provides theme context to its children.
 * @param {{ children: ReactNode }} props The component's props.
 * @returns {JSX.Element} The rendered component.
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

  /**
   * Toggles the theme between light and dark.
   */
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
 * @hook useTheme
 * @description A custom hook for accessing the theme context.
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