import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, PieChart } from 'lucide-react';
import './Analytics.css';
import API_URL from '../../config/api';

const Analytics = () => {
  const [viewMode, setViewMode] = useState('weekly');
  const [cashflowData, setCashflowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear] = useState(2025);

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
      } finally {
        setLoading(false);
      }
    };

    fetchCashflowData();
  }, [selectedYear]);

  // Calculate weekly data (last 7 days)
  const weeklyData = useMemo(() => {
    if (!cashflowData?.months) {
      return {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        income: [0, 0, 0, 0, 0, 0, 0],
        expense: [0, 0, 0, 0, 0, 0, 0],
      };
    }

    const today = new Date();
    const last7Days = [];
    const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const income = new Array(7).fill(0);
    const expense = new Array(7).fill(0);

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date);
    }

    last7Days.forEach((date, idx) => {
      const monthIndex = date.getMonth();
      const dayNumber = date.getDate();
      const monthData = cashflowData.months[monthIndex];

      if (monthData) {
        monthData.weeks.forEach(week => {
          week.days.forEach(day => {
            if (day.isValid && day.dayNumber === dayNumber) {
              const dayIncome = [
                ...day.ingresos.fijos,
                ...day.ingresos.variables
              ].reduce((sum, item) => sum + (item.amount || 0), 0);

              const dayExpense = [
                ...day.gastos.fijos,
                ...day.gastos.variables
              ].reduce((sum, item) => sum + (item.amount || 0), 0);

              income[idx] = dayIncome;
              expense[idx] = dayExpense;
            }
          });
        });
      }
    });

    return { labels, income, expense };
  }, [cashflowData]);

  // Calculate monthly data (last 4 weeks)
  const monthlyData = useMemo(() => {
    if (!cashflowData?.months) {
      return {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        income: [0, 0, 0, 0],
        expense: [0, 0, 0, 0],
      };
    }

    const currentMonth = new Date().getMonth();
    const monthData = cashflowData.months[currentMonth];
    const labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    const income = [0, 0, 0, 0];
    const expense = [0, 0, 0, 0];

    if (monthData) {
      monthData.weeks.forEach((week, weekIdx) => {
        if (weekIdx < 4) {
          week.days.forEach(day => {
            if (day.isValid) {
              const dayIncome = [
                ...day.ingresos.fijos,
                ...day.ingresos.variables
              ].reduce((sum, item) => sum + (item.amount || 0), 0);

              const dayExpense = [
                ...day.gastos.fijos,
                ...day.gastos.variables
              ].reduce((sum, item) => sum + (item.amount || 0), 0);

              income[weekIdx] += dayIncome;
              expense[weekIdx] += dayExpense;
            }
          });
        }
      });
    }

    return { labels, income, expense };
  }, [cashflowData]);

  // Calculate yearly data (all 12 months)
  const yearlyData = useMemo(() => {
    if (!cashflowData?.months) {
      return {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        income: new Array(12).fill(0),
        expense: new Array(12).fill(0),
      };
    }

    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const income = new Array(12).fill(0);
    const expense = new Array(12).fill(0);

    cashflowData.months.forEach((monthData, monthIdx) => {
      monthData.weeks.forEach(week => {
        week.days.forEach(day => {
          if (day.isValid) {
            const dayIncome = [
              ...day.ingresos.fijos,
              ...day.ingresos.variables
            ].reduce((sum, item) => sum + (item.amount || 0), 0);

            const dayExpense = [
              ...day.gastos.fijos,
              ...day.gastos.variables
            ].reduce((sum, item) => sum + (item.amount || 0), 0);

            income[monthIdx] += dayIncome;
            expense[monthIdx] += dayExpense;
          }
        });
      });
    });

    return { labels, income, expense };
  }, [cashflowData]);

  // Calculate top categories from real data
  const topCategories = useMemo(() => {
    if (!cashflowData?.months) {
      return [];
    }

    const categoryTotals = {};

    cashflowData.months.forEach(monthData => {
      monthData.weeks.forEach(week => {
        week.days.forEach(day => {
          if (day.isValid) {
            // Process all expenses and group by hashtags
            [...day.gastos.fijos, ...day.gastos.variables].forEach(item => {
              if (item.amount > 0) {
                const category = item.hashtags?.[0] || item.description || 'Otros';
                categoryTotals[category] = (categoryTotals[category] || 0) + item.amount;
              }
            });
          }
        });
      });
    });

    // Convert to array and sort by amount
    const categories = Object.entries(categoryTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Assign colors
    const colors = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#6b7280'];
    return categories.map((cat, idx) => ({
      ...cat,
      color: colors[idx % colors.length]
    }));
  }, [cashflowData]);

  const currentData = viewMode === 'weekly' ? weeklyData : viewMode === 'monthly' ? monthlyData : yearlyData;

  const totalIncome = currentData.income.reduce((a, b) => a + b, 0);
  const totalExpense = currentData.expense.reduce((a, b) => a + b, 0);
  const balance = totalIncome - totalExpense;
  const avgIncome = (totalIncome / currentData.income.length).toFixed(2);
  const avgExpense = (totalExpense / currentData.expense.length).toFixed(2);

  const maxValue = Math.max(...currentData.income, ...currentData.expense);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <div className="analytics-header-left">
            <div className="analytics-icon-wrapper">
              <PieChart size={32} />
            </div>
            <div>
              <h1 className="analytics-title">Analytics</h1>
              <p className="analytics-subtitle">Cargando datos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
