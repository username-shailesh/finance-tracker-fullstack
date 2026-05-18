import React, { useState } from 'react';
import { reportService, downloadBlob } from '../services/api';
import { getPastMonths, getMonthDisplayName } from '../utils/formatters';
import useCurrency from '../hooks/useCurrency';
import './ReportsPage.css';

const ReportsPage = () => {
  const months = getPastMonths(12);
  const [month, setMonth]         = useState(months[0].value);
  const [loading, setLoading]     = useState({ pdf: false, excel: false });
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const { getCurrencyInfo }       = useCurrency();

  const showMsg = (type, msg) => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); }
    else                    { setError(msg);   setTimeout(() => setError(''),   4000); }
  };

  const handleDownload = async (type) => {
    setLoading(p => ({ ...p, [type]: true }));
    setError('');
    try {
      let res;
      if (type === 'pdf') {
        const symbol = getCurrencyInfo().symbol;
        res = await reportService.generatePDF(month, symbol);
        downloadBlob(res.data, `detailed_expense_report_${month}.pdf`);
      } else {
        res = await reportService.generateExcel(month);
        downloadBlob(res.data, `expense_transactions_ledger_${month}.xlsx`);
      }
      showMsg('success', `${type.toUpperCase()} report downloaded!`);
    } catch {
      showMsg('error', `Failed to generate ${type.toUpperCase()} report. Make sure you have expenses for this month.`);
    } finally {
      setLoading(p => ({ ...p, [type]: false }));
    }
  };

  return (
    <div className="reports-page animate-in">
      <div className="page-header">
        <div>
          <h1>📄 Detailed Expense Reports</h1>
          <p>Download your raw transactional ledgers and category breakdowns</p>
        </div>
      </div>

      {error   && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Month selector */}
      <div className="card report-selector">
        <h2>Select Month</h2>
        <p className="text-muted">Choose a month to generate your report</p>
        <div className="month-grid mt-16">
          {months.map(m => (
            <button
              key={m.value}
              className={`month-btn ${month === m.value ? 'active' : ''}`}
              onClick={() => setMonth(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected month preview */}
      <div className="selected-month-banner">
        <span className="banner-icon">📅</span>
        <div>
          <div className="banner-title">Generating report for</div>
          <div className="banner-month">{getMonthDisplayName(month)}</div>
        </div>
      </div>

      {/* Download options */}
      <div className="download-cards grid grid-2">
        {/* PDF */}
        <div className="download-card card">
          <div className="download-icon pdf-icon">📕</div>
          <h3>Detailed Expense Summary PDF</h3>
          <p>
            A formatted PDF document including your expense summary,
            category breakdown, budget status, and transaction list for the month.
          </p>
          <ul className="feature-list">
            <li>✅ Expense summary table</li>
            <li>✅ Category breakdown</li>
            <li>✅ Budget vs. actual</li>
            <li>✅ Clean, shareable formatting</li>
          </ul>
          <button
            className="btn btn-primary w-full mt-16"
            onClick={() => handleDownload('pdf')}
            disabled={loading.pdf}
          >
            {loading.pdf ? <><span className="spinner-inline" /> Generating…</> : '⬇️ Download Summary PDF'}
          </button>
        </div>

        {/* Excel */}
        <div className="download-card card">
          <div className="download-icon excel-icon">📗</div>
          <h3>Transactions Ledger Excel</h3>
          <p>
            A structured Excel spreadsheet with raw expense data, formulas,
            and category summaries — perfect for custom auditing.
          </p>
          <ul className="feature-list">
            <li>✅ All transactions listed</li>
            <li>✅ Category summary sheet</li>
            <li>✅ Daily totals</li>
            <li>✅ Filterable columns</li>
          </ul>
          <button
            className="btn btn-success w-full mt-16"
            onClick={() => handleDownload('excel')}
            disabled={loading.excel}
          >
            {loading.excel ? <><span className="spinner-inline" /> Generating…</> : '⬇️ Download Ledger Excel'}
          </button>
        </div>
      </div>

      {/* Info note */}
      <div className="alert alert-info" style={{ marginTop: '24px' }}>
        ℹ️ Reports contain all confirmed expenses for the selected month.
        Make sure MySQL is running and you have data for the chosen month.
      </div>
    </div>
  );
};

export default ReportsPage;
