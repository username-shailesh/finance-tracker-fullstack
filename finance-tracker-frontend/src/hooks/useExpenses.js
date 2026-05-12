/**
 * Custom hook for expense operations
 * Provides CRUD operations and state management for expenses
 */
import { useState, useEffect, useCallback } from 'react';
import { expenseService, categoryService } from '../services/api';

const useExpenses = () => {
  const [expenses, setExpenses]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);

  // Clear messages after timeout
  const clearMessages = () => {
    setTimeout(() => { setError(null); setSuccess(null); }, 4000);
  };

  /**
   * Fetch all expenses for the current user
   */
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await expenseService.getAll();
      setExpenses(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch expenses by date range
   */
  const fetchExpensesByRange = useCallback(async (startDate, endDate) => {
    try {
      setLoading(true);
      const res = await expenseService.getByDateRange(startDate, endDate);
      setExpenses(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all categories for the current user
   */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  /**
   * Create a new expense
   */
  const createExpense = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await expenseService.create(data);
      setExpenses(prev => [res.data, ...prev]);
      setSuccess('Expense added successfully!');
      clearMessages();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add expense';
      setError(msg);
      clearMessages();
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing expense
   */
  const updateExpense = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await expenseService.update(id, data);
      setExpenses(prev => prev.map(e => (e.id === id ? res.data : e)));
      setSuccess('Expense updated successfully!');
      clearMessages();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update expense';
      setError(msg);
      clearMessages();
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete an expense
   */
  const deleteExpense = useCallback(async (id) => {
    try {
      setLoading(true);
      await expenseService.delete(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      setSuccess('Expense deleted successfully!');
      clearMessages();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete expense';
      setError(msg);
      clearMessages();
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [fetchExpenses, fetchCategories]);

  return {
    expenses,
    categories,
    loading,
    error,
    success,
    fetchExpenses,
    fetchExpensesByRange,
    fetchCategories,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};

export default useExpenses;
