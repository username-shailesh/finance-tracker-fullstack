// RecurringPage – Manage recurring/automated expenses
import React, { useState, useEffect, useCallback } from 'react';
import { recurringService, categoryService } from '../services/api';
import useCurrency from '../hooks/useCurrency';
import { formatDate } from '../utils/formatters';
import './RecurringPage.css';

const FREQUENCIES = [
  { value: 'DAILY',   label: 'Daily' },
  { value: 'WEEKLY',  label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY',  label: 'Yearly' },
];

const emptyForm = {
  name: '', amount: '', categoryId: '', frequency: 'MONTHLY',
  startDate: new Date().toISOString().split('T')[0],
  description: '', paymentMethod: 'CASH', isActive: true,
};

const RecurringPage = () => {
  const [items, setItems]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm]             = useState({ ...emptyForm, manualCategory: '' });
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const { format }                  = useCurrency();

  const showMsg = (type, msg) => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); }
    else                    { setError(msg);   setTimeout(() => setError(''),   4000); }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, cRes] = await Promise.all([
        recurringService.getAll(),
        categoryService.getAll(),
      ]);
      const uniqueCategories = (cRes.data || []).reduce((acc, current) => {
        const x = acc.find(item => item.name === current.name);
        if (!x) return acc.concat([current]);
        return acc;
      }, []);
      setItems(rRes.data || []);
      setCategories(uniqueCategories);
    } catch {
      showMsg('error', 'Failed to load data');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { 
    setEditItem(null); 
    setForm({ ...emptyForm, manualCategory: '' }); 
    setShowModal(true); 
  };
  
  const openEdit   = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, 
      amount: item.amount, 
      categoryId: item.categoryId,
      manualCategory: '',
      frequency: item.frequency, 
      startDate: item.startDate,
      description: item.description || '', 
      paymentMethod: item.paymentMethod || 'CASH',
      isActive: item.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.amount || !form.categoryId) {
      showMsg('error', 'Name, amount and category are required'); return;
    }
    try {
      setLoading(true);
      let categoryId = form.categoryId;

      // Handle "Other" category
      if (categoryId === 'other') {
        if (!form.manualCategory.trim()) {
          showMsg('error', 'Please enter a category name');
          setLoading(false);
          return;
        }
        const catRes = await categoryService.create({ name: form.manualCategory });
        categoryId = catRes.data.id;
        load(); // Refresh categories
      }

      const payload = { ...form, categoryId };

      if (editItem) {
        await recurringService.update(editItem.id, payload);
        showMsg('success', 'Recurring expense updated!');
      } else {
        await recurringService.create(payload);
        showMsg('success', 'Recurring expense created!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Save failed');
    } finally { setLoading(false); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await recurringService.toggle(id);
      // Backend returns the updated item — use it directly
      setItems(prev => prev.map(i => i.id === id ? { ...i, isActive: res.data.isActive } : i));
    } catch { showMsg('error', 'Toggle failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring expense?')) return;
    try {
      await recurringService.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
      showMsg('success', 'Deleted successfully');
    } catch { showMsg('error', 'Delete failed'); }
  };

  const handleProcessNow = async () => {
    try {
      const res = await recurringService.processNow();
      showMsg('success', res.data.message);
      load();
    } catch { showMsg('error', 'Process failed'); }
  };

  const freqLabel = (f) => FREQUENCIES.find(x => x.value === f)?.label || f;

  const isProcessedForCurrentPeriod = (item) => {
    if (!item.lastProcessedDate) return false;
    const lp = new Date(item.lastProcessedDate);
    const today = new Date();
    
    switch (item.frequency) {
      case 'DAILY':
        return lp.toDateString() === today.toDateString();
      case 'MONTHLY':
        return lp.getMonth() === today.getMonth() && lp.getFullYear() === today.getFullYear();
      case 'YEARLY':
        return lp.getFullYear() === today.getFullYear();
      default:
        return false;
    }
  };

  return (
    <div className="recurring-page animate-in">
      <div className="page-header">
        <div>
          <h1>Recurring Expenses</h1>
          <p>Automate regular bills, subscriptions and rent payments</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleProcessNow} title="Process due recurring expenses now">
            ⚡ Process Now
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Recurring
          </button>
        </div>
      </div>

      {error   && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading && !items.length ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🔁</div>
          <h3>No recurring expenses yet</h3>
          <p>Add your rent, subscriptions and bills to auto-track them monthly.</p>
          <button className="btn btn-primary mt-16" onClick={openCreate}>Add First Recurring</button>
        </div>
      ) : (
        <div className="recurring-grid">
          {items.map(item => (
            <div key={item.id} className={`recurring-card card ${!item.isActive ? 'inactive' : ''}`}>
              <div className="rc-header">
                <div className="rc-icon">{item.categoryIcon || '🔁'}</div>
                <div className="rc-info">
                  <div className="rc-name">{item.name}</div>
                  <div className="rc-category">{item.categoryName}</div>
                </div>
                <div className="rc-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={!!item.isActive}
                      onChange={() => handleToggle(item.id)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>

              <div className="rc-amount">{format(item.amount)}</div>
              <div className="rc-meta">
                <span className={`badge badge-primary`}>{freqLabel(item.frequency)}</span>
                {isProcessedForCurrentPeriod(item) && (
                  <span className="badge badge-success">✅ Done for {item.frequency === 'MONTHLY' ? 'Month' : 'Today'}</span>
                )}
                {item.nextDueDate && (
                  <span className="rc-due">
                    {isProcessedForCurrentPeriod(item) ? 'Next Cycle: ' : 'Next Deduction: '}
                    <strong>{formatDate(item.nextDueDate)}</strong>
                  </span>
                )}
              </div>
              {item.description && <p className="rc-description">{item.description}</p>}

              <div className="rc-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Edit Recurring' : 'New Recurring Expense'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid grid-2" style={{ gap: '16px' }}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Name *</label>
                    <input className="form-input" placeholder="e.g. Netflix, Rent, Gym"
                      autoComplete="off"
                      value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount *</label>
                    <input className="form-input" type="number" step="0.01" min="0.01" placeholder="0.00"
                      autoComplete="off"
                      value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-select"
                      value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} required>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                      <option value="other" className="other-option">+ Other (Manual Entry)</option>
                    </select>
                  </div>
                  
                  {form.categoryId === 'other' && (
                    <div className="form-group animate-in" style={{ gridColumn: '1/-1' }}>
                      <label className="form-label">New Category Name *</label>
                      <input 
                        className="form-input" 
                        placeholder="Enter new category name"
                        autoComplete="off"
                        value={form.manualCategory} 
                        onChange={e => setForm(p => ({ ...p, manualCategory: e.target.value }))} 
                        required 
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Frequency</label>
                    <select className="form-select"
                      value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}>
                      {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input className="form-input" type="date"
                      value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select"
                      value={form.paymentMethod} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="CARD">Debit/Credit Card</option>
                      <option value="ONLINE">Online Banking</option>
                      <option value="MOBILE_WALLET">Mobile Wallet</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" rows={2} placeholder="Optional note..."
                      autoComplete="off"
                      value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringPage;
