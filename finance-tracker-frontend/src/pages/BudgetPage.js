// Budget Page
import React, { useEffect, useState, useCallback } from 'react';
import { budgetService, categoryService } from '../services/api';
import useCurrency from '../hooks/useCurrency';
import './BudgetPage.css';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

/**
 * BudgetPage - Manage budgets
 */
const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Filtering states
  const [filterMode, setFilterMode] = useState('current'); // 'current', 'month', 'year'
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().substring(0, 7));
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  const [formData, setFormData] = useState({
    categoryId: '',
    manualCategory: '',
    limitAmount: '',
    month: new Date().toISOString().substring(0, 7),
    alertThreshold: '80',
  });
  
  const { format } = useCurrency();

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      if (filterMode === 'year') {
        response = await budgetService.getByMonth(filterYear); 
      } else if (filterMode === 'month') {
        response = await budgetService.getByMonth(filterMonth);
      } else {
        response = await budgetService.getCurrentMonth();
      }
      setBudgets(response.data);
    } catch (err) {
      setError('Failed to load budgets for this period');
    } finally {
      setLoading(false);
    }
  }, [filterMode, filterMonth, filterYear]);

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
      console.error('Failed to load categories');
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, [filterMode, filterMonth, filterYear, fetchBudgets, fetchCategories]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showMsg = (type, msg) => {
    if (type === 'success') {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let categoryId = formData.categoryId;

      // Handle "Other" category
      if (categoryId === 'other') {
        if (!formData.manualCategory.trim()) {
          showMsg('error', 'Please enter a category name');
          return;
        }
        const catRes = await categoryService.create({ name: formData.manualCategory });
        categoryId = catRes.data.id;
        fetchCategories(); // Refresh list
      }

      await budgetService.setOrUpdate(categoryId, {
        limitAmount: parseFloat(formData.limitAmount),
        month: formData.month,
        alertThreshold: parseFloat(formData.alertThreshold),
      });

      showMsg('success', 'Budget set successfully!');
      fetchBudgets();
      
      // Reset form but keep month and threshold for "Add Another" convenience
      setFormData(prev => ({
        ...prev,
        categoryId: '',
        manualCategory: '',
        limitAmount: '',
      }));
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      await budgetService.delete(id);
      showMsg('success', 'Budget deleted successfully');
      fetchBudgets();
    } catch {
      showMsg('error', 'Failed to delete budget');
    }
  };

  const openEdit = (budget) => {
    setFormData({
      categoryId: budget.categoryId,
      manualCategory: '',
      limitAmount: budget.limitAmount.toString(),
      month: budget.month,
      alertThreshold: budget.alertThreshold?.toString() || '80',
    });
    setShowForm(true);
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      categoryId: '',
      manualCategory: '',
      limitAmount: '',
      month: new Date().toISOString().substring(0, 7),
      alertThreshold: '80',
    });
    setShowForm(false);
  };

  if (loading && budgets.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="budget-page">
      <div className="page-header">
        <h1>Budget Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <FiPlus /> {showForm ? 'Close Form' : 'Set Budget'}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar card">
        <div className="filter-group">
          <label>View Mode:</label>
          <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} className="form-select">
            <option value="current">Current Month</option>
            <option value="month">Month Wise</option>
            <option value="year">Year Wise</option>
          </select>
        </div>

        {filterMode === 'month' && (
          <div className="filter-group">
            <label>Select Month:</label>
            <input 
              type="month" 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)} 
              className="form-input" 
            />
          </div>
        )}

        {filterMode === 'year' && (
          <div className="filter-group">
            <label>Select Year:</label>
            <input 
              type="number" 
              min="2020" 
              max="2100" 
              value={filterYear} 
              onChange={(e) => setFilterYear(e.target.value)} 
              className="form-input" 
            />
          </div>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Form */}
      {showForm && (
        <div className="budget-form card">
          <h2>Set Budget Limit</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
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
                  <option value="other" className="other-option">+ Other (Manual Entry)</option>
                </select>
              </div>

              {formData.categoryId === 'other' && (
                <div className="form-group animate-in">
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    name="manualCategory"
                    value={formData.manualCategory}
                    onChange={handleFormChange}
                    className="form-input"
                    placeholder="Enter category name"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Budget Limit</label>
                <input
                  type="number"
                  name="limitAmount"
                  value={formData.limitAmount}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Month</label>
                <input
                  type="month"
                  name="month"
                  value={formData.month}
                  onChange={handleFormChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Alert Threshold (%)</label>
              <input
                type="number"
                name="alertThreshold"
                value={formData.alertThreshold}
                onChange={handleFormChange}
                className="form-input"
                min="0"
                max="100"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Add Budget
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Done
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budgets List */}
      <div className="budgets-grid">
        {budgets.length === 0 && !loading && (
          <div className="empty-state">No budgets found for this period.</div>
        )}
        {budgets.map((budget) => (
          <div key={budget.id} className="budget-card card animate-in">
            <div className="budget-header">
              <div className="budget-title-area">
                <h3>{budget.categoryName}</h3>
                <span className="badge">{budget.month}</span>
              </div>
              <div className="budget-card-actions">
                <button className="btn-icon" onClick={() => openEdit(budget)} title="Edit Budget">
                  <FiEdit2 />
                </button>
                <button className="btn-icon danger" onClick={() => handleDeleteBudget(budget.id)} title="Delete Budget">
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className={`progress-fill ${
                    budget.usagePercentage > 100 ? 'danger' : ''
                  }`}
                  style={{ width: `${Math.min(100, budget.usagePercentage)}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {budget.usagePercentage.toFixed(1)}%
              </div>
            </div>

            <div className="budget-details">
              <div className="detail-item">
                <span>Limit:</span>
                <strong>{format(budget.limitAmount)}</strong>
              </div>
              <div className="detail-item">
                <span>Spent:</span>
                <strong>{format(budget.spent)}</strong>
              </div>
              {budget.projectedAmount > 0 && (
                <div className="detail-item projected">
                  <span>Projected (Auto):</span>
                  <strong>{format(budget.projectedAmount)}</strong>
                </div>
              )}
              <div className="detail-item">
                <span>Remaining:</span>
                <strong className={budget.remaining >= 0 ? '' : 'danger'}>
                  {format(budget.remaining)}
                </strong>
              </div>
            </div>

            {budget.usagePercentage > 100 && (
              <div className="alert alert-danger">
                Budget exceeded by {format(Math.abs(budget.remaining))}!
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetPage;
