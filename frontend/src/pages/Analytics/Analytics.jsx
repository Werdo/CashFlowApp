import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, PieChart } from 'lucide-react';
import './Analytics.css';

const Analytics = () => {
  const [viewMode, setViewMode] = useState('weekly');

  // Mock data
  const weeklyData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    income: [500, 0, 300, 0, 0, 200, 150],
    expense: [50, 80, 45, 120, 95, 150, 200],
  };

  const monthlyData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    income: [1800, 2200, 1950, 2100],
    expense: [850, 920, 780, 1050],
  };

  const yearlyData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    income: [3500, 3800, 4200, 3900, 4500, 4100, 4300, 4000, 4600, 4700, 4400, 4800],
    expense: [1800, 2100, 1950, 2200, 2000, 2300, 2150, 2400, 2250, 2350, 2100, 2500],
  };

  const currentData = viewMode === 'weekly' ? weeklyData : viewMode === 'monthly' ? monthlyData : yearlyData;

  const totalIncome = currentData.income.reduce((a, b) => a + b, 0);
  const totalExpense = currentData.expense.reduce((a, b) => a + b, 0);
  const balance = totalIncome - totalExpense;
  const avgIncome = (totalIncome / currentData.income.length).toFixed(2);
  const avgExpense = (totalExpense / currentData.expense.length).toFixed(2);

  const maxValue = Math.max(...currentData.income, ...currentData.expense);

  const topCategories = [
    { name: 'Alimentación', amount: 450, color: '#ef4444' },
    { name: 'Transporte', amount: 320, color: '#f59e0b' },
    { name: 'Entretenimiento', amount: 280, color: '#8b5cf6' },
    { name: 'Servicios', amount: 250, color: '#3b82f6' },
    { name: 'Otros', amount: 180, color: '#6b7280' },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="analytics-header-left">
          <div className="analytics-icon-wrapper">
            <PieChart size={32} />
          </div>
          <div>
            <h1 className="analytics-title">Analytics</h1>
            <p className="analytics-subtitle">Analiza tus patrones de gasto e ingresos</p>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="analytics-view-selector">
        <button
          className={`view-btn ${viewMode === 'weekly' ? 'active' : ''}`}
          onClick={() => setViewMode('weekly')}
        >
          <Calendar size={16} />
          Semanal
        </button>
        <button
          className={`view-btn ${viewMode === 'monthly' ? 'active' : ''}`}
          onClick={() => setViewMode('monthly')}
        >
          <Calendar size={16} />
          Mensual
        </button>
        <button
          className={`view-btn ${viewMode === 'yearly' ? 'active' : ''}`}
          onClick={() => setViewMode('yearly')}
        >
          <Calendar size={16} />
          Anual
        </button>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="summary-card income">
          <div className="summary-icon">
            <TrendingUp size={24} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Total Ingresos</span>
            <span className="summary-value">{formatCurrency(totalIncome)}</span>
            <span className="summary-detail">Promedio: {formatCurrency(avgIncome)}</span>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="summary-icon">
            <TrendingDown size={24} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Total Gastos</span>
            <span className="summary-value">{formatCurrency(totalExpense)}</span>
            <span className="summary-detail">Promedio: {formatCurrency(avgExpense)}</span>
          </div>
        </div>

        <div className={`summary-card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
          <div className="summary-icon">
            <DollarSign size={24} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Balance</span>
            <span className="summary-value">{formatCurrency(balance)}</span>
            <span className="summary-detail">
              {balance >= 0 ? 'Superávit' : 'Déficit'}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="analytics-chart-card">
        <h2 className="chart-title">Ingresos vs Gastos</h2>
        <div className="chart-container">
          {currentData.labels.map((label, idx) => (
            <div key={idx} className="chart-bar-group">
              <div className="chart-bars">
                <div
                  className="chart-bar income"
                  style={{ height: `${(currentData.income[idx] / maxValue) * 200}px` }}
                  title={`Ingresos: ${formatCurrency(currentData.income[idx])}`}
                />
                <div
                  className="chart-bar expense"
                  style={{ height: `${(currentData.expense[idx] / maxValue) * 200}px` }}
                  title={`Gastos: ${formatCurrency(currentData.expense[idx])}`}
                />
              </div>
              <span className="chart-label">{label}</span>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color income"></span>
            <span>Ingresos</span>
          </div>
          <div className="legend-item">
            <span className="legend-color expense"></span>
            <span>Gastos</span>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="analytics-categories">
        <h2 className="categories-title">Top Categorías de Gasto</h2>
        <div className="categories-list">
          {topCategories.map((cat, idx) => (
            <div key={idx} className="category-item">
              <div className="category-info">
                <span className="category-color" style={{ backgroundColor: cat.color }}></span>
                <span className="category-name">{cat.name}</span>
              </div>
              <div className="category-bar-container">
                <div
                  className="category-bar"
                  style={{
                    width: `${(cat.amount / topCategories[0].amount) * 100}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
              <span className="category-amount">{formatCurrency(cat.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
