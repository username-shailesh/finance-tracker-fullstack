/**
 * Utility functions for formatting currency, dates, and percentages
 */

/**
 * Format a number as currency string
 * @param {number|string} amount - The amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  const symbols = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹',
    JPY: '¥', CAD: 'C$', AUD: 'A$', CHF: 'CHF',
  };
  const symbol = symbols[currency] || '$';
  return `${symbol}${parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * Format a date string to readable format
 * @param {string|Date} date - Date to format
 * @param {string} format - 'short' | 'long' | 'relative'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  if (format === 'long') {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (format === 'relative') {
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  // Default: short format DD/MM/YYYY
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Get current month in "YYYY-MM" format
 * @returns {string}
 */
export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Get month display name from "YYYY-MM" string
 * @param {string} monthStr - "YYYY-MM" format
 * @returns {string} Month display name
 */
export const getMonthDisplayName = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Get start and end dates of a month
 * @param {string} monthStr - "YYYY-MM" format
 * @returns {{ startDate: string, endDate: string }}
 */
export const getMonthDateRange = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

/**
 * Format a percentage value
 * @param {number} value - Percentage value
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Clamp a value between min and max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);

/**
 * Get color for a budget usage percentage
 * @param {number} percent - 0-100+
 * @returns {string} CSS color
 */
export const getBudgetColor = (percent) => {
  if (percent >= 100) return '#e74c3c'; // red - exceeded
  if (percent >= 80) return '#f39c12';  // orange - warning
  if (percent >= 60) return '#f1c40f';  // yellow - caution
  return '#2ecc71';                      // green - healthy
};

/**
 * Get health score color
 * @param {number} score - 0-100
 * @returns {string} CSS color
 */
export const getHealthScoreColor = (score) => {
  if (score >= 80) return '#2ecc71';  // green - excellent
  if (score >= 60) return '#f1c40f';  // yellow - good
  if (score >= 40) return '#f39c12';  // orange - fair
  return '#e74c3c';                    // red - poor
};

/**
 * Get insight type color and icon
 * @param {string} type - 'WARNING' | 'OPPORTUNITY' | 'INFO'
 * @returns {{ color: string, icon: string }}
 */
export const getInsightStyle = (type) => {
  const styles = {
    WARNING: { color: '#e74c3c', icon: '⚠️', bg: 'rgba(231,76,60,0.1)' },
    OPPORTUNITY: { color: '#2ecc71', icon: '💡', bg: 'rgba(46,204,113,0.1)' },
    INFO: { color: '#3498db', icon: 'ℹ️', bg: 'rgba(52,152,219,0.1)' },
  };
  return styles[type] || styles.INFO;
};

/**
 * Truncate text to a given length
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * Generate a list of months for the past N months
 * @param {number} count - Number of months
 * @returns {Array<{ value: string, label: string }>}
 */
export const getPastMonths = (count = 6) => {
  const months = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    months.push({ value, label });
  }
  return months;
};

/**
 * Get category emoji for display
 * @param {string} categoryName
 * @returns {string}
 */
export const getCategoryEmoji = (categoryName) => {
  const emojis = {
    'Food': '🍔', 'Travel': '✈️', 'Bills': '📄', 'Shopping': '🛍️',
    'Health': '💊', 'Entertainment': '🎬', 'Education': '📚',
    'Rent': '🏠', 'Utilities': '💡', 'Groceries': '🛒',
    'Transport': '🚗', 'Savings': '💰', 'Insurance': '🛡️',
    'Other': '📦',
  };
  return emojis[categoryName] || '📦';
};

/**
 * Deep clone an object
 * @param {object} obj
 * @returns {object}
 */
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Debounce a function call
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
