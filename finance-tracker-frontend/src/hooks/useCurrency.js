/**
 * Custom hook for currency selection
 * Persists selected currency in localStorage
 */
import { useState, useCallback } from 'react';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
];

const useCurrency = () => {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('currency') || 'USD';
  });

  const setCurrency = useCallback((code) => {
    localStorage.setItem('currency', code);
    setCurrencyState(code);
  }, []);

  const getCurrencyInfo = () =>
    CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const format = (amount) => {
    const info = getCurrencyInfo();
    if (amount === null || amount === undefined || isNaN(amount)) return `${info.symbol}0.00`;
    return `${info.symbol}${parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  return { currency, setCurrency, getCurrencyInfo, format, CURRENCIES };
};

export default useCurrency;
