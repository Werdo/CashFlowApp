import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import './Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Mock data - esto se reemplazará con datos reales del backend
  const mockTransactions = useMemo(() => {
    const transactions = [];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Generar transacciones aleatorias para el mes actual
    for (let day = 1; day <= 31; day++) {
      const date = new Date(currentYear, currentMonth, day);
      if (date.getMonth() === currentMonth) {
        transactions.push({
          date: date.toISOString(),
          income: Math.random() > 0.7 ? Math.floor(Math.random() * 2000) + 500 : 0,
          expenses: Math.floor(Math.random() * 500) + 50,
        });
      }
    }
    return transactions;
  }, [currentDate]);

  // Mock data para resumen anual
  const annualData = [
    { month: 'Ene', income: 5000, expenses: 3200, balance: 1800 },
    { month: 'Feb', income: 5500, expenses: 3400, balance: 2100 },
    { month: 'Mar', income: 6000, expenses: 3800, balance: 2200 },
    { month: 'Abr', income: 5200, expenses: 3500, balance: 1700 },
    { month: 'May', income: 5800, expenses: 3600, balance: 2200 },
    { month: 'Jun', income: 6200, expenses: 4000, balance: 2200 },
    { month: 'Jul', income: 5500, expenses: 3700, balance: 1800 },
    { month: 'Ago', income: 5900, expenses: 3900, balance: 2000 },
    { month: 'Sep', income: 6100, expenses: 4100, balance: 2000 },
    { month: 'Oct', income: 5700, expenses: 3800, balance: 1900 },
    { month: 'Nov', income: 6000, expenses: 4000, balance: 2000 },
    { month: 'Dic', income: 6500, expenses: 4500, balance: 2000 },
  ];

  // Calcular días del mes
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const transaction = mockTransactions.find(t =>
        new Date(t.date).getDate() === day
      );

      days.push({
        date: dayDate,
        day,
        income: transaction?.income || 0,
        expenses: transaction?.expenses || 0,
        balance: (transaction?.income || 0) - (transaction?.expenses || 0),
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);

  // Calcular totales del mes
  const monthTotals = useMemo(() => {
    return mockTransactions.reduce((acc, t) => ({
      income: acc.income + t.income,
      expenses: acc.expenses + t.expenses,
      balance: acc.income + t.income - (acc.expenses + t.expenses),
    }), { income: 0, expenses: 0, balance: 0 });
  }, [mockTransactions]);

  // Calcular totales anuales
  const annualTotals = useMemo(() => {
    return annualData.reduce((acc, month) => ({
      income: acc.income + month.income,
      expenses: acc.expenses + month.expenses,
      balance: acc.balance + month.balance,
    }), { income: 0, expenses: 0, balance: 0 });
  }, [annualData]);

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="calendar-page">
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-header-left">
          <div className="calendar-icon-wrapper">
            <CalendarIcon size={32} />
          </div>
          <div>
            <h1 className="calendar-title">Calendario Financiero</h1>
            <p className="calendar-subtitle">Visualiza tus transacciones por día, mes y año</p>
          </div>
        </div>
      </div>

      {/* Month Stats Cards */}
      <div className="calendar-stats">
        <div className="stat-card stat-card-income">
          <div className="stat-card-header">
            <TrendingUp size={24} />
            <span className="stat-card-label">Ingresos del Mes</span>
          </div>
          <p className="stat-card-value">{formatCurrency(monthTotals.income)}</p>
        </div>

        <div className="stat-card stat-card-expense">
          <div className="stat-card-header">
            <TrendingDown size={24} />
            <span className="stat-card-label">Gastos del Mes</span>
          </div>
          <p className="stat-card-value">{formatCurrency(monthTotals.expenses)}</p>
        </div>

        <div className={`stat-card ${monthTotals.balance >= 0 ? 'stat-card-balance-positive' : 'stat-card-balance-negative'}`}>
          <div className="stat-card-header">
            <CalendarIcon size={24} />
            <span className="stat-card-label">Balance Mensual</span>
          </div>
          <p className="stat-card-value">{formatCurrency(monthTotals.balance)}</p>
        </div>
      </div>

      <div className="calendar-grid-container">
        {/* Calendar Grid */}
        <div className="calendar-section">
          <div className="calendar-controls">
            <button className="calendar-nav-btn" onClick={() => navigateMonth(-1)}>
              <ChevronLeft size={20} />
            </button>
            <h2 className="calendar-month-title">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button className="calendar-nav-btn" onClick={() => navigateMonth(1)}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="calendar-grid">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${!day ? 'calendar-day-empty' : ''} ${
                  selectedDate?.getDate() === day?.date.getDate() ? 'calendar-day-selected' : ''
                } ${day && day.balance > 0 ? 'calendar-day-positive' : ''} ${
                  day && day.balance < 0 ? 'calendar-day-negative' : ''
                }`}
                onClick={() => day && setSelectedDate(day.date)}
              >
                {day && (
                  <>
                    <span className="calendar-day-number">{day.day}</span>
                    {(day.income > 0 || day.expenses > 0) && (
                      <div className="calendar-day-data">
                        {day.income > 0 && (
                          <span className="calendar-day-income">+{formatCurrency(day.income)}</span>
                        )}
                        {day.expenses > 0 && (
                          <span className="calendar-day-expense">-{formatCurrency(day.expenses)}</span>
                        )}
                        <span className={`calendar-day-balance ${day.balance >= 0 ? 'positive' : 'negative'}`}>
                          {formatCurrency(day.balance)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="calendar-section">
          <h3 className="section-title">Evolución Mensual</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockTransactions}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).getDate()}
                  stroke="var(--text-tertiary)"
                />
                <YAxis stroke="var(--text-tertiary)" />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('es-ES')}
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Ingresos"
                  stroke="var(--accent-secondary)"
                  fill="var(--accent-secondary-light)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Gastos"
                  stroke="var(--accent-danger)"
                  fill="var(--accent-danger-light)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Annual Summary */}
      <div className="annual-summary">
        <h2 className="section-title">Resumen Anual {currentDate.getFullYear()}</h2>

        <div className="annual-stats">
          <div className="annual-stat">
            <span className="annual-stat-label">Ingresos Totales</span>
            <span className="annual-stat-value income">{formatCurrency(annualTotals.income)}</span>
          </div>
          <div className="annual-stat">
            <span className="annual-stat-label">Gastos Totales</span>
            <span className="annual-stat-value expense">{formatCurrency(annualTotals.expenses)}</span>
          </div>
          <div className="annual-stat">
            <span className="annual-stat-label">Balance Anual</span>
            <span className={`annual-stat-value ${annualTotals.balance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(annualTotals.balance)}
            </span>
          </div>
        </div>

        <div className="annual-charts">
          {/* Bar Chart - Comparison */}
          <div className="chart-wrapper">
            <h3 className="chart-title">Ingresos vs Gastos Mensuales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={annualData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="month" stroke="var(--text-tertiary)" />
                <YAxis stroke="var(--text-tertiary)" />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
                <Legend />
                <Bar dataKey="income" name="Ingresos" fill="var(--accent-secondary)" />
                <Bar dataKey="expenses" name="Gastos" fill="var(--accent-danger)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart - Balance Trend */}
          <div className="chart-wrapper">
            <h3 className="chart-title">Tendencia de Balance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={annualData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="month" stroke="var(--text-tertiary)" />
                <YAxis stroke="var(--text-tertiary)" />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name="Balance"
                  stroke="var(--accent-primary)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--accent-primary)', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
