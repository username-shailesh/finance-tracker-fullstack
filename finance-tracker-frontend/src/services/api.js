// API Service - Handles all API calls to the backend
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});



// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => { localStorage.removeItem('authToken'); localStorage.removeItem('user'); },
};

// Expenses
export const expenseService = {
  getAll:         ()                   => api.get('/expenses'),
  getByDateRange: (start, end)         => api.get('/expenses/range', { params: { startDate: start, endDate: end } }),
  create:         (data)               => api.post('/expenses', data),
  update:         (id, data)           => api.put(`/expenses/${id}`, data),
  delete:         (id)                 => api.delete(`/expenses/${id}`),
  uploadReceipt:  (id, formData)       => api.post(`/expenses/${id}/receipt`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Categories
export const categoryService = {
  getAll:  ()          => api.get('/categories'),
  create:  (data)      => api.post('/categories', data),
  update:  (id, data)  => api.put(`/categories/${id}`, data),
  delete:  (id)        => api.delete(`/categories/${id}`),
};

// Budgets
export const budgetService = {
  getCurrentMonth: ()                   => api.get('/budgets/current'),
  getByMonth:      (month)              => api.get(`/budgets/${month}`),
  setOrUpdate:     (categoryId, data)   => api.post(`/budgets/category/${categoryId}`, data),
  checkExceeded:   (categoryId, month)  => api.get(`/budgets/check/${categoryId}/${month}`),
};

// Dashboard
export const dashboardService = {
  getAll: (params) => api.get('/dashboard', { params }),
};

// AI Insights
export const insightService = {
  getAIInsights:  () => api.get('/insights/ai'),
  getHealthScore: () => api.get('/insights/health-score'),
  getPrediction:  () => api.get('/insights/prediction'),
};

// Reports
export const reportService = {
  generatePDF:   (month, symbol) => api.get(`/reports/pdf/${month}`,   { params: { symbol }, responseType: 'blob' }),
  generateExcel: (month)         => api.get(`/reports/excel/${month}`, { responseType: 'blob' }),
};

// Recurring Expenses
export const recurringService = {
  getAll:     ()          => api.get('/recurring'),
  create:     (data)      => api.post('/recurring', data),
  update:     (id, data)  => api.put(`/recurring/${id}`, data),
  delete:     (id)        => api.delete(`/recurring/${id}`),
  toggle:     (id)        => api.patch(`/recurring/${id}/toggle`),
  processNow: ()          => api.post('/recurring/process'),
};

// Users
export const userService = {
  getMe:                ()         => api.get('/users/me'),
  updateProfile:        (data)     => api.put('/users/profile', data),
  uploadProfilePicture: (formData) => api.post('/users/profile-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Notifications
export const notificationService = {
  getAll:      ()    => api.get('/notifications'),
  getUnread:   ()    => api.get('/notifications/unread'),
  markRead:    (id)  => api.put(`/notifications/${id}/read`),
  markAllRead: ()    => api.put('/notifications/read-all'),
  delete:      (id)  => api.delete(`/notifications/${id}`),
};

// Helper: download a blob as a file
export const downloadBlob = (blobData, filename) => {
  const url  = window.URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default api;
