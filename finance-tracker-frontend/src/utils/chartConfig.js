/**
 * Chart configuration utilities
 * Centralized chart.js configuration for consistent chart styling
 */

// Color palette for charts
export const CHART_COLORS = [
  '#6C63FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#82E0AA',
  '#F0B27A', '#AED6F1', '#A9DFBF', '#FAD7A0', '#D2B4DE',
];

export const CHART_COLORS_ALPHA = CHART_COLORS.map(c => c + 'CC');

/**
 * Default chart options for all charts
 */
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        font: { family: "'Inter', sans-serif", size: 12 },
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(17, 25, 40, 0.95)',
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,0.8)',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
    },
  },
};

/**
 * Build a Doughnut chart data object from category expenses
 * @param {Array} categoryData - [{ name, total }]
 * @returns {object} Chart.js data config
 */
export const buildDoughnutData = (categoryData) => ({
  labels: categoryData.map(c => c.name || c.categoryName),
  datasets: [{
    data: categoryData.map(c => parseFloat(c.total || c.amount || 0)),
    backgroundColor: CHART_COLORS.slice(0, categoryData.length),
    borderColor: CHART_COLORS.slice(0, categoryData.length).map(c => c + 'FF'),
    borderWidth: 2,
    hoverOffset: 8,
  }],
});

/**
 * Build a Line chart for spending trend
 * @param {string[]} labels - Month/date labels
 * @param {number[]} data - Spending amounts
 * @param {string} label - Dataset label
 * @returns {object} Chart.js data config
 */
export const buildLineData = (labels, data, label = 'Spending') => ({
  labels,
  datasets: [{
    label,
    data,
    borderColor: '#6C63FF',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    fill: true,
    tension: 0.4,
    pointBackgroundColor: '#6C63FF',
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
    pointRadius: 5,
    pointHoverRadius: 8,
  }],
});

/**
 * Build a Bar chart for category comparison
 * @param {string[]} labels
 * @param {number[]} current - Current month data
 * @param {number[]} previous - Previous month data
 * @returns {object} Chart.js data config
 */
export const buildBarData = (labels, current, previous) => ({
  labels,
  datasets: [
    {
      label: 'This Month',
      data: current,
      backgroundColor: 'rgba(108, 99, 255, 0.8)',
      borderColor: '#6C63FF',
      borderWidth: 1,
      borderRadius: 6,
    },
    {
      label: 'Last Month',
      data: previous,
      backgroundColor: 'rgba(78, 205, 196, 0.8)',
      borderColor: '#4ECDC4',
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
});

/**
 * Doughnut specific chart options
 */
export const doughnutOptions = {
  ...defaultChartOptions,
  cutout: '65%',
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins.legend,
      position: 'right',
    },
  },
};

/**
 * Line chart specific options
 */
export const lineOptions = {
  ...defaultChartOptions,
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: 'rgba(255,255,255,0.6)', font: { family: "'Inter', sans-serif" } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: {
        color: 'rgba(255,255,255,0.6)',
        font: { family: "'Inter', sans-serif" },
        callback: (value) => `$${value.toLocaleString()}`,
      },
    },
  },
};

/**
 * Bar chart specific options
 */
export const barOptions = {
  ...defaultChartOptions,
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: 'rgba(255,255,255,0.6)', font: { family: "'Inter', sans-serif" } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: {
        color: 'rgba(255,255,255,0.6)',
        callback: (value) => `$${value.toLocaleString()}`,
      },
    },
  },
};
