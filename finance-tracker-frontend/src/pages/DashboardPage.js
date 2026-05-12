// Dashboard Page
import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { dashboardService, insightService, budgetService } from '../services/api';
import useCurrency from '../hooks/useCurrency';
import './DashboardPage.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

/**
 * DashboardPage - Main dashboard with statistics and charts
 */
const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [insights, setInsights] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [filterMode, setFilterMode] = useState('month'); // 'month', 'year', 'range'
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().substring(0, 7));
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { format } = useCurrency();

  useEffect(() => {
    fetchDashboardData();
  }, [filterMode, filterMonth, filterYear, dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (filterMode === 'month') params.month = filterMonth;
      else if (filterMode === 'year') params.year = filterYear;
      else if (filterMode === 'range' && dateRange.start && dateRange.end) {
        params.startDate = dateRange.start;
        params.endDate = dateRange.end;
      }

      const [dashboardRes, healthRes, insightsRes, budgetRes] = await Promise.all([
        dashboardService.getAll(params),
        insightService.getHealthScore(),
        insightService.getAIInsights(),
        filterMode === 'range' ? { data: [] } : budgetService.getByMonth(filterMode === 'year' ? filterYear : filterMonth),
      ]);

      setDashboard(dashboardRes.data);
      setHealthScore(healthRes.data);
      setInsights(insightsRes.data);
      setBudgets(budgetRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const pieChartData = dashboard?.categoryDistribution ? {
    labels: Object.keys(dashboard.categoryDistribution).map(key => {
      const value = dashboard.categoryDistribution[key];
      const total = Object.values(dashboard.categoryDistribution).reduce((a, b) => a + b, 0);
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
      return `${key} (${percentage}%)`;
    }),
    datasets: [
      {
        data: Object.values(dashboard.categoryDistribution),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#F7464A', '#46BFBD'
        ],
        borderWidth: 1,
        borderColor: 'var(--border)'
      },
    ],
  } : null;

  const getFormattedDateTitle = () => {
    if (filterMode === 'year') return filterYear;
    if (filterMode === 'range') return 'Custom Range';
    
    // Format YYYY-MM to "Month Year"
    const [year, month] = filterMonth.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="dashboard-page animate-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <div className="dashboard-filters card">
          <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} className="form-select">
            <option value="month">Monthly View</option>
            <option value="year">Yearly View</option>
            <option value="range">Custom Range</option>
          </select>

          {filterMode === 'month' && (
            <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="form-input" />
          )}

          {filterMode === 'year' && (
            <input type="number" value={filterYear} min="2020" max="2100" onChange={(e) => setFilterYear(e.target.value)} className="form-input" />
          )}

          {filterMode === 'range' && (
            <div className="range-inputs">
              <input type="date" value={dateRange.start} onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))} className="form-input" />
              <span>to</span>
              <input type="date" value={dateRange.end} onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))} className="form-input" />
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card card">
          <div className="metric-label">{filterMode === 'year' ? 'Yearly' : 'Selected Period'} Expenses</div>
          <div className="metric-value">{format(dashboard?.monthlyExpenses || 0)}</div>
        </div>

        <div className="metric-card card">
          <div className="metric-label">Full Year Expenses</div>
          <div className="metric-value">{format(dashboard?.totalExpenses || 0)}</div>
        </div>

        <div className="metric-card card">
          <div className="metric-label">Top Category</div>
          <div className="metric-value">{dashboard?.topExpenseCategory || 'N/A'}</div>
          <div className="metric-subtext">{format(dashboard?.topCategoryAmount || 0)}</div>
        </div>

        {healthScore && (
          <div className="metric-card health-score card">
            <div className="health-score-header">
              <div className="metric-label">Health Score</div>
              <div className="health-circle-container">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="circle" strokeDasharray={`${healthScore.overallScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <text x="18" y="20.35" className="percentage">{healthScore.overallScore}</text>
                </svg>
              </div>
            </div>
            <div className="metric-subtext">{healthScore.scoreRating}</div>
          </div>
        )}
      </div>

      {/* Budget Overview */}
      <div className="budget-overview card">
        <h2>Budget Progress ({getFormattedDateTitle()})</h2>
        {budgets.length > 0 ? (
          <div className="budget-list">
            {budgets.map((budget) => (
              <div key={budget.id} className="budget-item">
                <div className="budget-info">
                  <div className="budget-name">{budget.categoryName}</div>
                  <div className="budget-progress-bar">
                    <div
                      className="budget-progress-fill"
                      style={{
                        width: `${Math.min(100, budget.usagePercentage)}%`,
                        backgroundColor: budget.usagePercentage > 100 ? '#e74c3c' : '#3498db',
                      }}
                    ></div>
                  </div>
                </div>
                <div className="budget-amount">
                  <div className="actual-spent">{format(budget.spent || 0)} / {format(budget.limitAmount || 0)}</div>
                  {budget.projectedAmount > 0 && (
                    <div className="projected-tag">Incl. {format(budget.projectedAmount)} Recurring</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No budget limits found for this period. Go to 'Budgets' to set one!</div>
        )}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {pieChartData && (
          <div className="card chart-container">
            <h2>Spending Distribution</h2>
            <div style={{ height: '350px', width: '100%', display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Pie 
                data={pieChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { color: 'var(--text-primary)' }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || '';
                          const value = context.parsed || 0;
                          const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${format(value)} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* AI Insights & Health */}
      <div className="insights-health-grid">
        {insights.length > 0 && (
          <div className="insights-section card">
            <h2>💡 AI Insights</h2>
            <div className="insights-list">
              {insights.slice(0, 3).map((insight, index) => (
                <div key={index} className={`insight-item insight-${insight.type.toLowerCase()}`}>
                  <div className="insight-category">{insight.category}</div>
                  <div className="insight-message">{insight.insight}</div>
                  <div className="insight-recommendation">{insight.recommendation}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {healthScore && (
          <div className="health-card card">
            <h2>Financial Health</h2>
            <div className="health-metrics">
              <div className="health-item">
                <span>Savings Ratio:</span>
                <strong>{(healthScore.savingsRatio * 100).toFixed(1)}%</strong>
              </div>
              <div className="health-item">
                <span>Budget Adherence:</span>
                <strong>{healthScore.budgetAdherencePercentage}%</strong>
              </div>
              <div className="health-item">
                <span>Overspending Frequency:</span>
                <strong>{healthScore.overspendingFrequency} months</strong>
              </div>
            </div>
            <div className="health-recommendation">
              <p><strong>Recommendation:</strong> {healthScore.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
