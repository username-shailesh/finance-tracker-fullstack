// Main App Component – routing, dark mode, and layout
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import useDarkMode from './hooks/useDarkMode';

// Pages
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage      from './pages/DashboardPage';
import ExpensesPage     from './pages/ExpensesPage';
import BudgetPage       from './pages/BudgetPage';
import InsightsPage     from './pages/InsightsPage';
import RecurringPage    from './pages/RecurringPage';
import ReportsPage      from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage      from './pages/ProfilePage';

// Components
import PrivateRoute from './components/PrivateRoute';
import Navbar       from './components/Navbar';
import ScrollToTop  from './components/ScrollToTop';

import './App.css';

/**
 * Root App Component
 * Sets up routing, auth-guard, and dark-mode class on mount
 */
function App() {
  const { initializeAuth, isAuthenticated, initialized } = useAuthStore();
  // initialise dark mode from localStorage (applies data-theme to <html>)
  useDarkMode();
 
  useEffect(() => {
    initializeAuth();
  }, []); // eslint-disable-line
 
  if (!initialized) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your finances...</p>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        {isAuthenticated && <Navbar />}
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/login"           element={!isAuthenticated ? <LoginPage />          : <Navigate to="/dashboard" />} />
            <Route path="/register"        element={!isAuthenticated ? <RegisterPage />       : <Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/dashboard" />} />
 
            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard"     element={<DashboardPage />} />
              <Route path="/expenses"      element={<ExpensesPage />} />
              <Route path="/budget"        element={<BudgetPage />} />
              <Route path="/insights"      element={<InsightsPage />} />
              <Route path="/recurring"     element={<RecurringPage />} />
              <Route path="/reports"       element={<ReportsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile"       element={<ProfilePage />} />
              <Route path="/"              element={<Navigate to="/dashboard" />} />
            </Route>
 
            {/* Catch-all */}
            <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
