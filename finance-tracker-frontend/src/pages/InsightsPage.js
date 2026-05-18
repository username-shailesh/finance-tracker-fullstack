import React, { useEffect, useState } from 'react';
import { insightService, reportService, downloadBlob } from '../services/api';
import useCurrency from '../hooks/useCurrency';
import './InsightsPage.css';
import { FiDownload } from 'react-icons/fi';

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
      downloadBlob(res.data, `monthly_ai_insights_report_${month}.pdf`);
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

      {/* Report Generation */}
      <div className="reports-section card">
        <h2>🤖 Download AI Insights & Financial Analysis Report</h2>
        <p className="text-muted" style={{ marginBottom: '16px' }}>
          Export a comprehensive analysis report including your financial health score, personalized AI recommendations, category trends, and saving advice.
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
