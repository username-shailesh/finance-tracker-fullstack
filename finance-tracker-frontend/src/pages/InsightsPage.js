import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { insightService, reportService, downloadBlob } from '../services/api';
import useCurrency from '../hooks/useCurrency';
import './InsightsPage.css';
import { FiDownload } from 'react-icons/fi';
import { getMonthDisplayName } from '../utils/formatters';
import { barOptions } from '../utils/chartConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * InsightsPage - Display AI insights and financial analysis
 */
const InsightsPage = () => {
  const [insights, setInsights] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const { getCurrencyInfo } = useCurrency();

  const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthlySpendingValues = [11200, 14800, 19000, 23000, 21000, 18400];
  const selectedMonthIndex = Math.min(new Date(`${month}-01`).getMonth(), monthlyLabels.length - 1);

  const insightsBarData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Monthly Expenses',
        data: monthlySpendingValues,
        backgroundColor: monthlySpendingValues.map((_, index) =>
          index === selectedMonthIndex ? 'rgba(108, 99, 255, 0.95)' : 'rgba(108, 99, 255, 0.45)'
        ),
        borderColor: monthlySpendingValues.map((_, index) =>
          index === selectedMonthIndex ? '#6C63FF' : 'rgba(108, 99, 255, 0.7)'
        ),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const [insightsRes, healthRes] = await Promise.all([
        insightService.getAIInsights(),
        insightService.getHealthScore(),
      ]);

      setInsights(insightsRes.data);
      setHealthScore(healthRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const symbol = getCurrencyInfo().symbol;
      const res = await reportService.generateAIPDF(month, symbol);
      const formattedDateForFile = getMonthDisplayName(month).replace(/\s+/g, '_'); // e.g. "May_2026"
      downloadBlob(res.data, `monthly_ai_insights_report_${formattedDateForFile}.pdf`);
    } catch (err) {
      setError('Failed to download AI Insights PDF report');
    }
  };


  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="insights-page">
      <h1>📊 Financial Insights & Analysis</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Financial Health Score */}
      {healthScore && (
        <div className="health-score-section card">
          <h2>Financial Health Score</h2>
          <div className="score-display">
            <div className="score-circle">
              <div className="score-value">{healthScore.overallScore}</div>
              <div className="score-label">/ 100</div>
            </div>
            <div className="score-details">
              <div className="detail">
                <span>Rating:</span>
                <strong>{healthScore.scoreRating}</strong>
              </div>
              <div className="detail">
                <span>Savings Ratio:</span>
                <strong>{(healthScore.savingsRatio * 100).toFixed(1)}%</strong>
              </div>
              <div className="detail">
                <span>Budget Adherence:</span>
                <strong>{healthScore.budgetAdherencePercentage}%</strong>
              </div>
              <div className="detail">
                <span>Overspending Months:</span>
                <strong>{healthScore.overspendingFrequency}</strong>
              </div>
            </div>
          </div>
          <div className="recommendation-box">
            <h3>💡 Recommendation</h3>
            <p>{healthScore.recommendation}</p>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="ai-insights card">
          <h2>🤖 AI-Powered Insights</h2>
          <div className="insights-container">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`insight-card insight-type-${insight.type.toLowerCase()}`}
              >
                <div className="insight-header">
                  <div className="insight-category-badge">{insight.category}</div>
                  <div className="insight-type-badge">{insight.type}</div>
                </div>
                <div className="insight-content">
                  <h3>{insight.insight}</h3>
                  <p className="recommendation">{insight.recommendation}</p>
                  {insight.impact && (
                    <div className={`impact-indicator ${insight.impact > 0 ? 'positive' : 'negative'}`}>
                      Impact: {insight.impact > 0 ? '+' : ''}{insight.impact}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Bar Chart Preview */}
      <div className="chart-preview card">
        <div className="chart-preview-header">
          <h2>📈 Monthly Spending Snapshot</h2>
          <p className="text-muted">
            Preview your selected month against recent spending trends before exporting the report.
          </p>
        </div>
        <div className="chart-preview-body">
          <Bar data={insightsBarData} options={barOptions} />
        </div>
      </div>

      {/* Report Generation */}
      <div className="reports-section card">
        <h2>🤖 Download Monthly AI Insights Report</h2>
        <p className="text-muted" style={{ marginBottom: '16px' }}>
          Export a monthly report for {getMonthDisplayName(month)}, including your financial health score, AI recommendations, and spending insights.
        </p>
        <div className="report-controls">
          <div className="form-group">
            <label className="form-label">Select Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="button-group">
            <button className="btn btn-primary" onClick={handleDownloadPDF} style={{ width: '100%', justifyContent: 'center' }}>
              <FiDownload /> Download AI Insights PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
