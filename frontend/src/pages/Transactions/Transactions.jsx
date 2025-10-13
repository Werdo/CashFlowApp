import React, { useState, useMemo, useEffect } from 'react';
import { Receipt, Filter, X, Edit2, Check, TrendingUp, TrendingDown, Calendar, Hash, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Transactions.css';
import API_URL from '../../config/api';

const Transactions = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'income', 'expense'
    dateFrom: '',
    dateTo: '',
    hashtag: '',
    group: '',
    search: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [cashflowData, setCashflowData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch cashflow data from API
  useEffect(() => {
    const fetchCashflowData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_URL}/cashflow/2025`, {
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
  }, []);

  // Transform cashflow data into transactions list
  const transactions = useMemo(() => {
    if (!cashflowData || !cashflowData.months) return [];

    const transactionsList = [];
    let transactionId = 1;

    cashflowData.months.forEach((monthData, monthIndex) => {
      monthData.weeks.forEach(week => {
        week.days.forEach(day => {
          if (day.isValid) {
            const dayDate = new Date(2025, monthIndex, day.dayNumber);
            const dateStr = dayDate.toISOString().split('T')[0];

            // Add fixed income transactions
            day.ingresos.fijos.forEach(item => {
              if (item.amount > 0) {
                transactionsList.push({
                  id: transactionId++,
                  type: 'income',
                  description: item.description || 'Ingreso Fijo',
                  amount: item.amount,
                  date: dateStr,
                  checked: item.checked || false,
                  hashtags: item.hashtags || ['fijo'],
                  group: 'Ingresos Fijos',
                  notes: item.notes || '',
                });
              }
            });

            // Add variable income transactions
            day.ingresos.variables.forEach(item => {
              if (item.amount > 0) {
                transactionsList.push({
                  id: transactionId++,
                  type: 'income',
                  description: item.description || 'Ingreso Variable',
                  amount: item.amount,
                  date: dateStr,
                  checked: item.checked || false,
                  hashtags: item.hashtags || ['variable'],
                  group: 'Ingresos Variables',
                  notes: item.notes || '',
                });
              }
            });

            // Add fixed expense transactions
            day.gastos.fijos.forEach(item => {
              if (item.amount > 0) {
                transactionsList.push({
                  id: transactionId++,
                  type: 'expense',
                  description: item.description || 'Gasto Fijo',
                  amount: item.amount,
                  date: dateStr,
                  checked: item.checked || false,
                  hashtags: item.hashtags || ['fijo'],
                  group: 'Gastos Fijos',
                  notes: item.notes || '',
                });
              }
            });

            // Add variable expense transactions
            day.gastos.variables.forEach(item => {
              if (item.amount > 0) {
                transactionsList.push({
                  id: transactionId++,
                  type: 'expense',
                  description: item.description || 'Gasto Variable',
                  amount: item.amount,
                  date: dateStr,
                  checked: item.checked || false,
                  hashtags: item.hashtags || ['variable'],
                  group: 'Gastos Variables',
                  notes: item.notes || '',
                });
              }
            });
          }
        });
      });
    });

    // Sort by date descending (newest first)
    return transactionsList.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [cashflowData]);

  // Mock data - se reemplazará con datos del backend
  const mockTransactions = [
    {
      id: 1,
      type: 'income',
      description: 'Salario Mensual',
      amount: 3500,
      date: '2025-10-01',
      checked: true,
      hashtags: ['salario', 'fijo'],
      group: 'Ingresos Fijos',
      notes: 'Pago mensual empresa',
    },
    {
      id: 2,
      type: 'expense',
      description: 'Alquiler',
      amount: 900,
      date: '2025-10-01',
      checked: true,
      hashtags: ['vivienda', 'fijo'],
      group: 'Gastos Fijos',
      notes: '',
    },
    {
      id: 3,
      type: 'expense',
      description: 'Supermercado',
      amount: 85.50,
      date: '2025-10-02',
      checked: false,
      hashtags: ['alimentacion', 'variable'],
      group: 'Gastos Variables',
      notes: 'Compra semanal',
    },
    {
      id: 4,
      type: 'income',
      description: 'Freelance proyecto web',
      amount: 1200,
      date: '2025-10-03',
      checked: false,
      hashtags: ['freelance', 'variable'],
      group: 'Ingresos Variables',
      notes: 'Cliente ABC',
    },
    {
      id: 5,
      type: 'expense',
      description: 'Gasolina',
      amount: 60,
      date: '2025-10-04',
      checked: true,
      hashtags: ['transporte', 'variable'],
      group: 'Gastos Variables',
      notes: '',
    },
  ];

  // Filtrado de transacciones
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filtro por tipo
      if (filters.type !== 'all' && transaction.type !== filters.type) {
        return false;
      }

      // Filtro por fecha desde
      if (filters.dateFrom && transaction.date < filters.dateFrom) {
        return false;
      }

      // Filtro por fecha hasta
      if (filters.dateTo && transaction.date > filters.dateTo) {
        return false;
      }

      // Filtro por hashtag
      if (filters.hashtag && !transaction.hashtags.includes(filters.hashtag)) {
        return false;
      }

      // Filtro por grupo
      if (filters.group && transaction.group !== filters.group) {
        return false;
      }

      // Filtro por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          transaction.description.toLowerCase().includes(searchLower) ||
          transaction.notes.toLowerCase().includes(searchLower) ||
          transaction.hashtags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, [filters, transactions]);

  // Calcular totales
  const totals = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => ({
      income: acc.income + (t.type === 'income' ? t.amount : 0),
      expense: acc.expense + (t.type === 'expense' ? t.amount : 0),
    }), { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      dateFrom: '',
      dateTo: '',
      hashtag: '',
      group: '',
      search: '',
    });
  };

  const handleToggleCheck = (id) => {
    // TODO: Call API to update transaction
    console.log('Toggle check:', id);
  };

  const handleEditStart = (transaction) => {
    setEditingId(transaction.id);
    setEditForm({ ...transaction });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditSave = () => {
    // TODO: Call API to save transaction
    console.log('Save transaction:', editForm);
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Get unique hashtags and groups for filters
  const uniqueHashtags = [...new Set(transactions.flatMap(t => t.hashtags))];
  const uniqueGroups = [...new Set(transactions.map(t => t.group))];

  if (loading) {
    return (
      <div className="transactions-page">
        <div className="transactions-header">
          <div className="transactions-header-left">
            <div className="transactions-icon-wrapper">
              <Receipt size={32} />
            </div>
            <div>
              <h1 className="transactions-title">Transacciones</h1>
              <p className="transactions-subtitle">Cargando transacciones...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      {/* Header */}
      <div className="transactions-header">
        <div className="transactions-header-left">
          <div className="transactions-icon-wrapper">
            <Receipt size={32} />
          </div>
          <div>
            <h1 className="transactions-title">Transacciones</h1>
            <p className="transactions-subtitle">
              {filteredTransactions.length} transacciones encontradas
            </p>
          </div>
        </div>
        <button
          className={`btn btn-filter ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="transactions-filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="filters-grid">
              {/* Type Filter */}
              <div className="filter-group">
                <label className="filter-label">Tipo</label>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${filters.type === 'all' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('type', 'all')}
                  >
                    Todos
                  </button>
                  <button
                    className={`filter-btn income ${filters.type === 'income' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('type', 'income')}
                  >
                    <TrendingUp size={16} />
                    Ingresos
                  </button>
                  <button
                    className={`filter-btn expense ${filters.type === 'expense' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('type', 'expense')}
                  >
                    <TrendingDown size={16} />
                    Gastos
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div className="filter-group">
                <label className="filter-label">
                  <Calendar size={16} />
                  Desde
                </label>
                <input
                  type="date"
                  className="filter-input"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  <Calendar size={16} />
                  Hasta
                </label>
                <input
                  type="date"
                  className="filter-input"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>

              {/* Hashtag Filter */}
              <div className="filter-group">
                <label className="filter-label">
                  <Hash size={16} />
                  Hashtag
                </label>
                <select
                  className="filter-input"
                  value={filters.hashtag}
                  onChange={(e) => handleFilterChange('hashtag', e.target.value)}
                >
                  <option value="">Todos</option>
                  {uniqueHashtags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              {/* Group Filter */}
              <div className="filter-group">
                <label className="filter-label">
                  <Folder size={16} />
                  Grupo
                </label>
                <select
                  className="filter-input"
                  value={filters.group}
                  onChange={(e) => handleFilterChange('group', e.target.value)}
                >
                  <option value="">Todos</option>
                  {uniqueGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="filter-group filter-group-wide">
                <label className="filter-label">Buscar</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Buscar en descripción, notas o hashtags..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            <div className="filters-actions">
              <button className="btn btn-secondary" onClick={clearFilters}>
                <X size={18} />
                Limpiar Filtros
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <div className="transactions-summary">
        <div className="summary-card income">
          <div className="summary-icon">
            <TrendingUp size={24} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Total Ingresos</span>
            <span className="summary-value">{formatCurrency(totals.income)}</span>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="summary-icon">
            <TrendingDown size={24} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Total Gastos</span>
            <span className="summary-value">{formatCurrency(totals.expense)}</span>
          </div>
        </div>

        <div className={`summary-card balance ${totals.income - totals.expense >= 0 ? 'positive' : 'negative'}`}>
          <div className="summary-icon">
            <Receipt size={24} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Balance</span>
            <span className="summary-value">{formatCurrency(totals.income - totals.expense)}</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table-wrapper">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Grupo</th>
              <th>Hashtags</th>
              <th>Importe</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => (
              <tr key={transaction.id} className={transaction.checked ? 'checked' : ''}>
                <td>
                  <button
                    className={`check-btn ${transaction.checked ? 'checked' : ''}`}
                    onClick={() => handleToggleCheck(transaction.id)}
                    title={transaction.checked ? 'Marcar como pendiente' : 'Marcar como completada'}
                  >
                    {transaction.checked && <Check size={16} />}
                  </button>
                </td>
                <td>{formatDate(transaction.date)}</td>
                <td>
                  {editingId === transaction.id ? (
                    <input
                      type="text"
                      className="edit-input"
                      value={editForm.description}
                      onChange={(e) => handleEditChange('description', e.target.value)}
                    />
                  ) : (
                    <div>
                      <span className="transaction-description">{transaction.description}</span>
                      {transaction.notes && (
                        <span className="transaction-notes">{transaction.notes}</span>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`type-badge ${transaction.type}`}>
                    {transaction.type === 'income' ? (
                      <>
                        <TrendingUp size={14} />
                        Ingreso
                      </>
                    ) : (
                      <>
                        <TrendingDown size={14} />
                        Gasto
                      </>
                    )}
                  </span>
                </td>
                <td>{transaction.group}</td>
                <td>
                  <div className="hashtags">
                    {transaction.hashtags.map(tag => (
                      <span key={tag} className="hashtag">#{tag}</span>
                    ))}
                  </div>
                </td>
                <td>
                  {editingId === transaction.id ? (
                    <input
                      type="number"
                      className="edit-input"
                      value={editForm.amount}
                      onChange={(e) => handleEditChange('amount', parseFloat(e.target.value))}
                      step="0.01"
                    />
                  ) : (
                    <span className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  )}
                </td>
                <td>
                  {editingId === transaction.id ? (
                    <div className="edit-actions">
                      <button className="btn-icon btn-success" onClick={handleEditSave} title="Guardar">
                        <Check size={16} />
                      </button>
                      <button className="btn-icon btn-danger" onClick={handleEditCancel} title="Cancelar">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-icon"
                      onClick={() => handleEditStart(transaction)}
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTransactions.length === 0 && (
          <div className="transactions-empty">
            <Receipt size={48} />
            <p>No se encontraron transacciones</p>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
