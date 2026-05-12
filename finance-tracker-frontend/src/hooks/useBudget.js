/**
 * Custom hook for budget operations
 * Provides budget CRUD and real-time tracking state
 */
import { useState, useEffect, useCallback } from 'react';
import { budgetService } from '../services/api';
import { getCurrentMonth } from '../utils/formatters';

const useBudget = (initialMonth = null) => {
  const [budgets, setBudgets]       = useState([]);
  const [month, setMonth]           = useState(initialMonth || getCurrentMonth());
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);

  const clearMessages = () => {
    setTimeout(() => { setError(null); setSuccess(null); }, 4000);
  };

  /**
   * Fetch budgets for current month
   */
  const fetchCurrentMonthBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await budgetService.getCurrentMonth();
      setBudgets(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch budgets for a specific month
   */
  const fetchBudgetsByMonth = useCallback(async (targetMonth) => {
    try {
      setLoading(true);
      setError(null);
      const res = await budgetService.getByMonth(targetMonth);
      setBudgets(res.data || []);
      setMonth(targetMonth);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Set or update a budget for a category
   */
  const setBudget = useCallback(async (categoryId, data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await budgetService.setOrUpdate(categoryId, data);
      // Update or add in local state
      setBudgets(prev => {
        const idx = prev.findIndex(b => b.categoryId === categoryId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = res.data;
          return updated;
        }
        return [...prev, res.data];
      });
      setSuccess('Budget saved successfully!');
      clearMessages();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save budget';
      setError(msg);
      clearMessages();
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get total budget limit for all categories
   */
  const getTotalBudget = () =>
    budgets.reduce((sum, b) => sum + (parseFloat(b.limitAmount) || 0), 0);

  /**
   * Get total spent across all budgets
   */
  const getTotalSpent = () =>
    budgets.reduce((sum, b) => sum + (parseFloat(b.spent) || 0), 0);

  /**
   * Get overall budget usage percentage
   */
  const getOverallUsage = () => {
    const total = getTotalBudget();
    const spent = getTotalSpent();
    if (total === 0) return 0;
    return Math.min(100, (spent / total) * 100);
  };

  /**
   * Get exceeded budgets
   */
  const getExceededBudgets = () =>
    budgets.filter(b => parseFloat(b.spent) > parseFloat(b.limitAmount));

  // Load on mount
  useEffect(() => {
    fetchCurrentMonthBudgets();
  }, [fetchCurrentMonthBudgets]);

  return {
    budgets,
    month,
    loading,
    error,
    success,
    fetchCurrentMonthBudgets,
    fetchBudgetsByMonth,
    setBudget,
    getTotalBudget,
    getTotalSpent,
    getOverallUsage,
    getExceededBudgets,
  };
};

export default useBudget;
