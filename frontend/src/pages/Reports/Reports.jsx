import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, TrendingUp, TrendingDown, Download, FileText } from 'lucide-react';
import './Reports.css';
import API_URL from '../../config/api';

const Reports = () => {
  const [periodType, setPeriodType] = useState('month');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedQuarter, setSelectedQuarter] = useState(4);
  const [selectedWeek, setSelectedWeek] = useState(40);
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cashflowData, setCashflowData] = useState(null);

  // Fetch cashflow data
  useEffect(() => {
    const fetchCashflowData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_URL}/cashflow/${selectedYear}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCashflowData(data);
        }
      } catch (error) {
        console.error('Error fetching cashflow data:', error);
      }
    };

    fetchCashflowData();
  }, [selectedYear]);

  const periodTypes = [
    { value: 'day', label: 'Día' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
    { value: 'quarter', label: 'Trimestre' },
    { value: 'year', label: 'Año' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const quarters = [
    { value: 1, label: 'Q1 (Ene-Mar)' },
    { value: 2, label: 'Q2 (Abr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Oct-Dic)' }
  ];

  const handleGenerateReport = () => {
    if (!cashflowData) {
      alert('No hay datos de cashflow disponibles');
      return;
    }

    setLoading(true);

    try {
      let totalIncome = 0;
      let totalExpense = 0;
      let transactionCount = 0;
      let incomeFixedTotal = 0;
      let incomeVariableTotal = 0;
      let expenseFixedTotal = 0;
      let expenseVariableTotal = 0;

      // Determine which months to process based on period type
      let monthsToProcess = [];

      switch (periodType) {
        case 'month':
          monthsToProcess = [selectedMonth - 1];
          break;
        case 'quarter':
          const quarterStart = (selectedQuarter - 1) * 3;
          monthsToProcess = [quarterStart, quarterStart + 1, quarterStart + 2];
          break;
        case 'year':
          monthsToProcess = Array.from({ length: 12 }, (_, i) => i);
          break;
        case 'custom':
          // For custom, we'll filter by date later
          monthsToProcess = Array.from({ length: 12 }, (_, i) => i);
          break;
        default:
          monthsToProcess = [selectedMonth - 1];
      }

      // Process each month
      monthsToProcess.forEach(monthIndex => {
        if (!cashflowData.months[monthIndex]) return;

        const monthData = cashflowData.months[monthIndex];

        monthData.weeks.forEach(week => {
          week.days.forEach(day => {
            if (!day.isValid) return;

            // For custom dates, check if date is in range
            if (periodType === 'custom' && customDateFrom && customDateTo) {
              const dayDate = new Date(selectedYear, monthIndex, day.dayNumber);
              const dateStr = dayDate.toISOString().split('T')[0];
              if (dateStr < customDateFrom || dateStr > customDateTo) return;
            }

            // Count and sum fixed income
            day.ingresos.fijos.forEach(item => {
              if (item.amount > 0) {
                totalIncome += item.amount;
                incomeFixedTotal += item.amount;
                transactionCount++;
              }
            });

            // Count and sum variable income
            day.ingresos.variables.forEach(item => {
              if (item.amount > 0) {
                totalIncome += item.amount;
                incomeVariableTotal += item.amount;
                transactionCount++;
              }
            });

            // Count and sum fixed expenses
            day.gastos.fijos.forEach(item => {
              if (item.amount > 0) {
                totalExpense += item.amount;
                expenseFixedTotal += item.amount;
                transactionCount++;
              }
            });

            // Count and sum variable expenses
            day.gastos.variables.forEach(item => {
              if (item.amount > 0) {
                totalExpense += item.amount;
                expenseVariableTotal += item.amount;
                transactionCount++;
              }
            });
          });
        });
      });

      const balance = totalIncome - totalExpense;

      const generatedReport = {
        period: periodType,
        generatedAt: new Date().toISOString(),
        summary: {
          totalIncome,
          totalExpense,
          balance,
          transactionCount
        },
        breakdown: {
          incomeByCategory: [
            { category: 'Ingresos Fijos', amount: incomeFixedTotal },
            { category: 'Ingresos Variables', amount: incomeVariableTotal }
          ].filter(item => item.amount > 0),
          expenseByCategory: [
            { category: 'Gastos Fijos', amount: expenseFixedTotal },
            { category: 'Gastos Variables', amount: expenseVariableTotal }
          ].filter(item => item.amount > 0)
        },
        comparison: null // TODO: Implement comparison with previous period
      };

      setReport(generatedReport);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Export to PDF');
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log('Export to Excel');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const getPeriodLabel = () => {
    switch (periodType) {
      case 'day': return new Date().toLocaleDateString('es-ES');
      case 'week': return `Semana ${selectedWeek} - ${selectedYear}`;
      case 'month': return `${months[selectedMonth - 1]} ${selectedYear}`;
      case 'quarter': return `${quarters[selectedQuarter - 1].label} ${selectedYear}`;
      case 'year': return `Año ${selectedYear}`;
      case 'custom': return customDateFrom && customDateTo
        ? `${customDateFrom} a ${customDateTo}`
        : 'Rango personalizado';
      default: return '';
    }
  };

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-header">
        <div className="reports-header-left">
          <div className="reports-icon-wrapper">
            <BarChart3 size={32} />
          </div>
          <div>
            <h1 className="reports-title">Reportes</h1>
            <p className="reports-subtitle">Genera informes detallados de tus finanzas</p>
          </div>
        </div>
      </div>

      {/* Period Selection */}
      <div className="reports-config">
        <h2 className="reports-config-title">Configuración del Reporte</h2>

        <div className="reports-config-grid">
          {/* Period Type */}
          <div className="form-group">
            <label className="form-label">Tipo de Período</label>
            <div className="period-buttons">
              {periodTypes.map(type => (
                <button
                  key={type.value}
                  className={`period-btn ${periodType === type.value ? 'active' : ''}`}
                  onClick={() => setPeriodType(type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period-specific selectors */}
          {periodType === 'week' && (
            <div className="form-group">
              <label className="form-label">Semana y Año</label>
              <div className="form-row">
                <input
                  type="number"
                  className="form-input"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                  min="1"
                  max="53"
                  placeholder="Semana"
                />
                <input
                  type="number"
                  className="form-input"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  placeholder="Año"
                />
              </div>
            </div>
          )}

          {periodType === 'month' && (
            <div className="form-group">
              <label className="form-label">Mes y Año</label>
              <div className="form-row">
                <select
                  className="form-input"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {months.map((month, idx) => (
                    <option key={idx} value={idx + 1}>{month}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="form-input"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  placeholder="Año"
                />
              </div>
            </div>
          )}

          {periodType === 'quarter' && (
            <div className="form-group">
              <label className="form-label">Trimestre y Año</label>
              <div className="form-row">
                <select
                  className="form-input"
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                >
                  {quarters.map(q => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="form-input"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  placeholder="Año"
                />
              </div>
            </div>
          )}

          {periodType === 'year' && (
            <div className="form-group">
              <label className="form-label">Año</label>
              <input
                type="number"
                className="form-input"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                placeholder="Año"
              />
            </div>
          )}

          {periodType === 'custom' && (
            <div className="form-group">
              <label className="form-label">Rango de Fechas</label>
              <div className="form-row">
                <input
                  type="date"
                  className="form-input"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                />
                <input
                  type="date"
                  className="form-input"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <button
          className="btn btn-primary btn-generate"
          onClick={handleGenerateReport}
          disabled={loading}
        >
          <FileText size={18} />
          {loading ? 'Generando...' : 'Generar Reporte'}
        </button>
      </div>

      {/* Report Display */}
      {report && (
        <div className="reports-results">
          <div className="reports-results-header">
            <div>
              <h2 className="reports-results-title">Reporte: {getPeriodLabel()}</h2>
              <p className="reports-results-date">
                Generado el {new Date(report.generatedAt).toLocaleString('es-ES')}
              </p>
            </div>
            <div className="reports-export-buttons">
              <button className="btn btn-secondary" onClick={handleExportPDF}>
                <Download size={16} />
                PDF
              </button>
              <button className="btn btn-secondary" onClick={handleExportExcel}>
                <Download size={16} />
                Excel
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="reports-summary">
            <div className="summary-card income">
              <div className="summary-icon">
                <TrendingUp size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-label">Total Ingresos</span>
                <span className="summary-value">{formatCurrency(report.summary.totalIncome)}</span>
                {report.comparison && (
                  <span className="summary-change positive">{report.comparison.change.income}</span>
                )}
              </div>
            </div>

            <div className="summary-card expense">
              <div className="summary-icon">
                <TrendingDown size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-label">Total Gastos</span>
                <span className="summary-value">{formatCurrency(report.summary.totalExpense)}</span>
                {report.comparison && (
                  <span className="summary-change negative">{report.comparison.change.expense}</span>
                )}
              </div>
            </div>

            <div className={`summary-card balance ${report.summary.balance >= 0 ? 'positive' : 'negative'}`}>
              <div className="summary-icon">
                <BarChart3 size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-label">Balance</span>
                <span className="summary-value">{formatCurrency(report.summary.balance)}</span>
                {report.comparison && (
                  <span className="summary-change positive">{report.comparison.change.balance}</span>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="reports-breakdown">
            <div className="breakdown-section">
              <h3 className="breakdown-title">Ingresos por Categoría</h3>
              <div className="breakdown-list">
                {report.breakdown.incomeByCategory.map((item, idx) => (
                  <div key={idx} className="breakdown-item">
                    <span className="breakdown-category">{item.category}</span>
                    <span className="breakdown-amount income">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="breakdown-section">
              <h3 className="breakdown-title">Gastos por Categoría</h3>
              <div className="breakdown-list">
                {report.breakdown.expenseByCategory.map((item, idx) => (
                  <div key={idx} className="breakdown-item">
                    <span className="breakdown-category">{item.category}</span>
                    <span className="breakdown-amount expense">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison */}
          {report.comparison && (
            <div className="reports-comparison">
              <h3 className="comparison-title">Comparación con Período Anterior</h3>
              <div className="comparison-grid">
                <div className="comparison-item">
                  <span className="comparison-label">Ingresos Anteriores</span>
                  <span className="comparison-value">{formatCurrency(report.comparison.previousPeriod.totalIncome)}</span>
                </div>
                <div className="comparison-item">
                  <span className="comparison-label">Gastos Anteriores</span>
                  <span className="comparison-value">{formatCurrency(report.comparison.previousPeriod.totalExpense)}</span>
                </div>
                <div className="comparison-item">
                  <span className="comparison-label">Balance Anterior</span>
                  <span className="comparison-value">{formatCurrency(report.comparison.previousPeriod.balance)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!report && !loading && (
        <div className="reports-empty">
          <BarChart3 size={48} />
          <p>Configura los parámetros y genera tu reporte</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
