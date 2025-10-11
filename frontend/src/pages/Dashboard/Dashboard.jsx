import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  // Mock data
  const stats = [
    {
      id: 1,
      title: 'Balance Total',
      value: '€45,231.89',
      change: '+20.1%',
      isPositive: true,
      icon: DollarSign,
      color: 'primary'
    },
    {
      id: 2,
      title: 'Ingresos del Mes',
      value: '€12,234.00',
      change: '+12.5%',
      isPositive: true,
      icon: TrendingUp,
      color: 'success'
    },
    {
      id: 3,
      title: 'Gastos del Mes',
      value: '€8,432.00',
      change: '+4.3%',
      isPositive: false,
      icon: TrendingDown,
      color: 'danger'
    },
    {
      id: 4,
      title: 'Transacciones',
      value: '156',
      change: '+8.2%',
      isPositive: true,
      icon: CreditCard,
      color: 'info'
    },
  ];

  const recentTransactions = [
    { id: 1, description: 'Salario Mensual', amount: 5000, type: 'income', date: '2025-10-05' },
    { id: 2, description: 'Supermercado', amount: -245.50, type: 'expense', date: '2025-10-04' },
    { id: 3, description: 'Freelance Proyecto', amount: 1200, type: 'income', date: '2025-10-03' },
    { id: 4, description: 'Alquiler', amount: -850, type: 'expense', date: '2025-10-01' },
    { id: 5, description: 'Restaurante', amount: -67.80, type: 'expense', date: '2025-09-30' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Vista general de tus finanzas</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className={`stat-card stat-card-${stat.color}`}>
              <div className="stat-card-header">
                <div className="stat-card-icon">
                  <Icon size={24} />
                </div>
                <span className={`stat-card-badge ${stat.isPositive ? 'positive' : 'negative'}`}>
                  {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stat.change}
                </span>
              </div>
              <div className="stat-card-body">
                <h3 className="stat-card-title">{stat.title}</h3>
                <p className="stat-card-value">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Transacciones Recientes</h2>
          <button className="btn-link">Ver todas</button>
        </div>

        <div className="transactions-list">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-info">
                <div className={`transaction-icon ${transaction.type}`}>
                  {transaction.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                <div className="transaction-details">
                  <h4 className="transaction-description">{transaction.description}</h4>
                  <p className="transaction-date">{new Date(transaction.date).toLocaleDateString('es-ES')}</p>
                </div>
              </div>
              <span className={`transaction-amount ${transaction.type}`}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
