/**
 * Custom hook for currency selection
 * Persists selected currency in localStorage
 */
import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

const useCurrency = () => {
  const user = useAuthStore((state) => state.user);
  
  const [currency, setCurrencyState] = useState(() => {
    return user?.currency || localStorage.getItem('currency') || 'INR';
  });

  // Keep state in sync if user currency preference changes
  useEffect(() => {
    if (user?.currency) {
      setCurrencyState(user.currency);
      localStorage.setItem('currency', user.currency);
    }
  }, [user?.currency]);

  const setCurrency = useCallback((code) => {
    localStorage.setItem('currency', code);
    setCurrencyState(code);
  }, []);

  const getCurrencyInfo = () =>
    CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const format = (amount) => {
    const info = getCurrencyInfo();
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: info.code,
        minimumFractionDigits: info.code === 'JPY' ? 0 : 2,
        maximumFractionDigits: info.code === 'JPY' ? 0 : 2,
      }).format(amount || 0);
    } catch (e) {
      // Fallback if Intl fails for some reason
      const val = parseFloat(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return `${info.symbol}${val}`;
    }
  };

  return { currency, setCurrency, getCurrencyInfo, format, CURRENCIES };
};

export default useCurrency;
