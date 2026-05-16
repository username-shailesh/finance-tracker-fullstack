// Expenses Page
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { expenseService, categoryService } from '../services/api';
import useCurrency from '../hooks/useCurrency';
import './ExpensesPage.css';
import { FiEdit2, FiTrash2, FiPlus, FiFilter, FiSearch } from 'react-icons/fi';
import { formatDate } from '../utils/formatters';

/**
 * ExpensesPage - Manage expenses
 */
const ExpensesPage = () => {
  const location = useLocation();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'CASH',
  });
  const [customCategory, setCustomCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { format } = useCurrency();
 
  // Filtering state
  const [filterType, setFilterType] = useState('ALL'); // ALL, MONTH, YEAR, RANGE
  const [filterValues, setFilterValues] = useState({
    month: new Date().toISOString().substring(0, 7), // YYYY-MM
    year: new Date().getFullYear().toString(),
    startDate: '',
    endDate: '',
  });

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      let response;
 
      if (filterType === 'ALL') {
        response = await expenseService.getAll();
      } else {
        let start, end;
        if (filterType === 'MONTH') {
          const [y, m] = filterValues.month.split('-');
          start = `${y}-${m}-01`;
          end = new Date(y, m, 0).toISOString().split('T')[0];
        } else if (filterType === 'YEAR') {
          start = `${filterValues.year}-01-01`;
          end = `${filterValues.year}-12-31`;
        } else if (filterType === 'RANGE') {
          start = filterValues.startDate;
          end = filterValues.endDate;
        }
 
        if (start && end) {
          response = await expenseService.getByDateRange(start, end);
        } else {
          response = await expenseService.getAll();
        }
      }
 
      setExpenses(response.data);
    } catch (err) {
      console.error('Failed to load expenses', err);
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterValues]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getAll();
      const uniqueCategories = (response.data || []).reduce((acc, current) => {
        const x = acc.find(item => item.name === current.name);
        if (!x) return acc.concat([current]);
        return acc;
      }, []);
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  const showMsg = (type, msg) => {
    if (type === 'success') {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    
    if (location.state?.openForm) {
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location, fetchExpenses, fetchCategories]);

  const filteredExpenses = expenses.filter(exp => 
    exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFilteredAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalCategoryId = formData.categoryId;

      if (finalCategoryId === 'OTHER') {
        if (!customCategory.trim()) {
          setError('Please enter a custom category name');
          return;
        }
        // Create new category via API
        const catRes = await categoryService.create({
          name: customCategory.trim(),
          color: '#808080',
          icon: 'folder'
        });
        finalCategoryId = catRes.data.id;
        fetchCategories(); // Refresh categories list
      }

      const payload = { ...formData, categoryId: finalCategoryId };

      if (editingId) {
        await expenseService.update(editingId, payload);
      } else {
        await expenseService.create(payload);
      }
      
      fetchExpenses();
      showMsg('success', 'Expense saved successfully!');
      
      if (!keepOpen || editingId) {
        resetForm();
      } else {
        // Keep form open, just clear the amount and description
        setFormData(prev => ({
          ...prev,
          amount: '',
          description: '',
        }));
        setCustomCategory('');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      showMsg('error', err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleDelete = async (id) => {
    console.log('Attempting to delete expense with ID:', id);
    if (!id || typeof id === 'undefined') {
      console.error('Delete failed: Invalid ID provided');
      return;
    }

    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        console.log('Sending delete request for ID:', id);
        await expenseService.delete(id);
        console.log('Delete successful, refreshing list...');
        fetchExpenses();
      } catch (err) {
        console.error('Delete API call failed:', err);
        setError('Failed to delete expense');
      }
    } else {
      console.log('Delete cancelled by user');
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      amount: expense.amount,
      categoryId: expense.categoryId,
      expenseDate: expense.expenseDate,
      description: expense.description,
      paymentMethod: expense.paymentMethod,
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      categoryId: '',
      expenseDate: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'CASH',
    });
    setCustomCategory('');
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="expenses-page">
      <div className="page-header">
        <h1>Expenses</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <FiPlus /> Add Expense
        </button>
      </div>
 
      {/* Filter Bar */}
      <div className="filter-bar card">
        <div className="filter-group">
          <label><FiFilter /> Filter By:</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="form-select sm"
          >
            <option value="ALL">All Expenses</option>
            <option value="MONTH">Month Wise</option>
            <option value="YEAR">Year Wise</option>
            <option value="RANGE">Specific Date Range</option>
          </select>
        </div>
 
        {filterType === 'MONTH' && (
          <div className="filter-group">
            <input 
              type="month" 
              value={filterValues.month}
              onChange={(e) => setFilterValues(p => ({...p, month: e.target.value}))}
              className="form-input sm"
            />
          </div>
        )}
 
        {filterType === 'YEAR' && (
          <div className="filter-group">
            <select 
              value={filterValues.year}
              onChange={(e) => setFilterValues(p => ({...p, year: e.target.value}))}
              className="form-select sm"
            >
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
 
        {filterType === 'RANGE' && (
          <div className="filter-group range">
            <input 
              type="date" 
              value={filterValues.startDate}
              onChange={(e) => setFilterValues(p => ({...p, startDate: e.target.value}))}
              className="form-input sm"
            />
            <span>to</span>
            <input 
              type="date" 
              value={filterValues.endDate}
              onChange={(e) => setFilterValues(p => ({...p, endDate: e.target.value}))}
              className="form-input sm"
            />
          </div>
        )}
 
        <button className="btn btn-primary btn-sm" onClick={fetchExpenses}>
          <FiSearch /> Apply Filter
        </button>

        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search descriptions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input sm"
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className="expenses-summary card animate-in">
        <div className="summary-item">
          <span className="label">Total Expenses</span>
          <span className="value">{format(totalFilteredAmount)}</span>
        </div>
        <div className="summary-item">
          <span className="label">Count</span>
          <span className="value">{filteredExpenses.length} items</span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Form */}
      {showForm && (
        <div className="expense-form card">
          <h2>{editingId ? 'Edit' : 'Add New'} Expense</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleFormChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                  <option value="OTHER">+ Other (Add New)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleFormChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {formData.categoryId === 'OTHER' && (
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">New Category Name</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="form-input"
                  placeholder="E.g., Pet Supplies, Gym, etc."
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="form-input"
                placeholder="Enter description"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleFormChange}
                className="form-select"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="CARD">Debit/Credit Card</option>
                <option value="ONLINE">Online Banking</option>
                <option value="MOBILE_WALLET">Mobile Wallet</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            {!editingId && (
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <input 
                  type="checkbox" 
                  id="keepOpen" 
                  checked={keepOpen} 
                  onChange={(e) => setKeepOpen(e.target.checked)} 
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                <label htmlFor="keepOpen" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Keep form open to add multiple expenses quickly
                </label>
              </div>
            )}

            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Save'} Expense
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center" style={{ padding: '40px' }}>
                    <div className="empty-state">
                      <p>No expenses found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{formatDate(expense.expenseDate)}</td>
                  <td>{expense.categoryName}</td>
                  <td>{expense.description || '-'}</td>
                  <td className="amount">{format(expense.amount)}</td>
                  <td>{expense.paymentMethod}</td>
                  <td className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(expense)}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(expense.id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
