// NotificationsPage – View and manage in-app alerts
import React, { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/api';
import { formatDate } from '../utils/formatters';
import './NotificationsPage.css';

const TYPE_ICONS = {
  BUDGET_ALERT     : { icon: '🚨', color: 'var(--danger)'  },
  UNUSUAL_SPENDING : { icon: '🔍', color: 'var(--info)'    },
  SAVINGS_GOAL     : { icon: '💰', color: 'var(--success)' },
  SUBSCRIPTION_REMINDER: { icon: '✅', color: 'var(--accent)' },
  SYSTEM_MESSAGE   : { icon: 'ℹ️', color: 'var(--text-muted)' },
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [filter, setFilter]               = useState('ALL'); // ALL | UNREAD
  const [error, setError]                 = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data || []);
    } catch {
      setError('Failed to load notifications');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { setError('Failed to mark as read'); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { setError('Failed to mark all as read'); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { setError('Failed to delete notification'); }
  };

  const filtered = filter === 'UNREAD'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getStyle = (type) => TYPE_ICONS[type] || TYPE_ICONS.SYSTEM_MESSAGE;

  return (
    <div className="notifications-page animate-in">
      <div className="page-header">
        <div>
          <h1>🔔 Notifications</h1>
          <p>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
              ✅ Mark All Read
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter tabs */}
      <div className="notif-tabs">
        {['ALL', 'UNREAD'].map(f => (
          <button
            key={f}
            className={`tab-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'UNREAD' ? `Unread (${unreadCount})` : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <h3>{filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}</h3>
          <p>We'll notify you about budget limits, processed bills, and AI-driven savings tips!</p>
        </div>
      ) : (
        <div className="notif-list">
          {filtered.map(n => {
            const style = getStyle(n.type);
            return (
              <div
                key={n.id}
                className={`notif-item card ${!n.isRead ? 'unread' : ''}`}
                style={{ borderLeft: `4px solid ${style.color}` }}
              >
                <div className="notif-icon" style={{ color: style.color }}>{style.icon}</div>
                <div className="notif-body">
                  <div className="notif-message">{n.message}</div>
                  <div className="notif-time">{formatDate(n.createdAt, 'relative')}</div>
                </div>
                <div className="notif-actions">
                  {!n.isRead && (
                    <button
                      className="btn-icon"
                      title="Mark as read"
                      onClick={() => handleMarkRead(n.id)}
                    >✓</button>
                  )}
                  <button
                    className="btn-icon"
                    title="Delete"
                    onClick={() => handleDelete(n.id)}
                  >🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
