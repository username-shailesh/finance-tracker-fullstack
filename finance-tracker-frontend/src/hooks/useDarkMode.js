/**
 * Custom hook for dark mode support
 * Persists preference in localStorage and applies to document root
 */
import { useState, useEffect } from 'react';

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage or system preference
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return JSON.parse(stored);
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
  });

  useEffect(() => {
    // Apply dark mode class to root element
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark-mode');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);
  const enable = () => setIsDark(true);
  const disable = () => setIsDark(false);

  return { isDark, toggle, enable, disable };
};

export default useDarkMode;
