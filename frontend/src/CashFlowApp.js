import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, BarChart3, Calendar, TrendingUp,
  TrendingDown, DollarSign, Edit2, Check, GripVertical,
  Move, Save, Upload, Hash, CheckSquare, Square, StickyNote,
  ChevronLeft, ChevronRight, CalendarDays, Search, Filter, Bell, X, LogOut, User, Tag
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Layout from './components/Layout/Layout';
import FAB from './components/FAB/FAB';
import { useNotifications } from './contexts/NotificationContext';
import SaveIndicator from './components/SaveIndicator';
import API_URL from './config/api';

const CashFlowApp = () => {
  const { success: notifySuccess, error: notifyError, info: notifyInfo } = useNotifications();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authView, setAuthView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // App state
  const [currentView, setCurrentView] = useState('dashboard');
  const [calendarView, setCalendarView] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showGraphs, setShowGraphs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTags, setFilterTags] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showDailyCash, setShowDailyCash] = useState(false);
  const [showGroupedExpenses, setShowGroupedExpenses] = useState(false);

  // Year management
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [showYearModal, setShowYearModal]= useState(false);
  const [newYearInput, setNewYearInput] = useState('');

  // Save status: 'idle', 'saving', 'saved', 'error'
  const [saveStatus, setSaveStatus] = useState('idle');

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  function generateWeeksForMonth(monthIndex, totalDays) {
    const weeks = [];
    let currentDay = 1;

    for (let w = 0; w < 5; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        if (currentDay <= totalDays) {
          days.push({
            id: 'day-' + monthIndex + '-' + currentDay,
            dayNumber: currentDay,
            isValid: true,
            ingresos: { fijos: [], variables: [] },
            gastos: { fijos: [], variables: [] }
          });
          currentDay++;
        } else {
          days.push({
            id: 'empty-' + monthIndex + '-' + w + '-' + d,
            dayNumber: null,
            isValid: false,
            ingresos: { fijos: [], variables: [] },
            gastos: { fijos: [], variables: [] }
          });
        }
      }
      weeks.push({
        id: 'week-' + monthIndex + '-' + w,
        weekNumber: w + 1,
        days: days
      });
    }

    return weeks;
  }

  const initialData = {
    months: Array.from({ length: 12 }, (_, i) => ({
      name: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
             'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][i],
      days: daysInMonth[i],
      weeks: generateWeeksForMonth(i, daysInMonth[i])
    }))
  };

  const [cashflowData, setCashflowData] = useState(initialData);

  // Check if user is already logged in
  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data._id) {
          setUser(data);
          setIsAuthenticated(true);
          loadAvailableYears();
          loadCashflowData();
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      });
    }
  }, []);

  // Reload cashflow data when selectedYear changes
  useEffect(() => {
    if (isAuthenticated && selectedYear) {
      console.log('📅 Year changed to:', selectedYear);
      loadCashflowData();
    }
  }, [selectedYear, isAuthenticated]);

  // Auto-save with debounce
  useEffect(() => {
    if (!isAuthenticated || !cashflowData) return;

    setSaveStatus('saving');

    const timeoutId = setTimeout(() => {
      saveCashflowDataSilent();
    }, 1500); // Auto-save after 1.5 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [cashflowData, isAuthenticated]);

  // Load available years from backend
  const loadAvailableYears = async () => {
    try {
      console.log('📅 Loading available years...');
      const response = await fetch(`${API_URL}/years`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        console.error('❌ Failed to load years:', response.status);
        return;
      }

      const years = await response.json();
      console.log('📅 Available years:', years);
      setAvailableYears(years);

      // If current year doesn't exist, create it
      const currentYear = new Date().getFullYear();
      if (!years.find(y => y.year === currentYear)) {
        await createYear(currentYear);
      }
    } catch (err) {
      console.error('❌ Error loading years:', err);
    }
  };

  // Create a new year
  const createYear = async (year) => {
    try {
      console.log('➕ Creating new year:', year);
      const response = await fetch(`${API_URL}/years`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          year: parseInt(year),
          name: `Año ${year}`
        })
      });

      if (!response.ok) {
        console.error('❌ Failed to create year:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        alert(`Error al crear el año ${year}`);
        return;
      }

      const result = await response.json();
      console.log('✅ Year created successfully:', result);

      // Reload available years
      await loadAvailableYears();

      // Switch to the new year
      setSelectedYear(parseInt(year));

      alert(`Año ${year} creado exitosamente`);
    } catch (err) {
      console.error('❌ Error creating year:', err);
      alert(`Error al crear el año ${year}`);
    }
  };

  // Load cashflow data from backend
  const loadCashflowData = async () => {
    try {
      console.log('🔄 Loading cashflow data for year:', selectedYear);
      const response = await fetch(`${API_URL}/cashflow?year=${selectedYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        console.error('❌ Failed to load cashflow:', response.status);
        return;
      }

      const data = await response.json();
      console.log('📥 Loaded cashflow data:', data);

      if (data.months && data.months.length > 0) {
        setCashflowData({ months: data.months });
      } else {
        console.log('⚠️ No months data in response');
      }
    } catch (err) {
      console.error('❌ Error loading cashflow data:', err);
    }
  };

  // Save cashflow data to backend (silent, no notifications)
  const saveCashflowDataSilent = async () => {
    try {
      console.log('💾 Saving cashflow data for year:', selectedYear);
      console.log('📤 Data to save:', { year: selectedYear, monthsCount: cashflowData.months.length });

      const response = await fetch(`${API_URL}/cashflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          year: selectedYear,
          months: cashflowData.months
        })
      });

      if (!response.ok) {
        console.error('❌ Save failed with status:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
        return;
      }

      const result = await response.json();
      console.log('✅ Auto-guardado exitoso:', result);
      setSaveStatus('saved');

      // Hide indicator after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('❌ Error en auto-guardado:', err);
      setSaveStatus('error');

      // Hide error after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Save cashflow data to backend (with notifications)
  const saveCashflowData = async () => {
    try {
      setLoading(true);
      console.log('💾 Manual save for year:', selectedYear);

      const response = await fetch(`${API_URL}/cashflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          year: selectedYear,
          months: cashflowData.months
        })
      });

      if (!response.ok) {
        console.error('❌ Manual save failed:', response.status);
        throw new Error('Save failed');
      }

      const result = await response.json();
      console.log('✅ Manual save successful:', result);
      setError(null);
      notifySuccess('Datos guardados exitosamente');
    } catch (err) {
      console.error('❌ Error in manual save:', err);
      setError('Error al guardar datos');
      notifyError('Error al guardar datos');
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        loadCashflowData();
        notifySuccess(`Bienvenido ${data.user.name}`);
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Handle register
  const handleRegister = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        notifySuccess('Cuenta creada. Por favor inicia sesión.');
        setAuthView('login');
      } else {
        setError(data.error || 'Error al registrar');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setCashflowData(initialData);
    notifyInfo('Sesión cerrada');
  };

  // Manual function to recalculate month balances
  // Call explicitly when needed, not automatically
  const transferSaldoMensual = () => {
    setCashflowData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));

      for (let i = 1; i < 12; i++) {
        const firstValidDay = newData.months[i].weeks[0].days.find(d => d.isValid);

        if (firstValidDay) {
          // First, remove ALL existing "Saldo mes anterior" entries to avoid duplicates
          firstValidDay.ingresos.fijos = firstValidDay.ingresos.fijos.filter(
            item => item.description !== 'Saldo mes anterior'
          );
          firstValidDay.gastos.fijos = firstValidDay.gastos.fijos.filter(
            item => item.description !== 'Saldo mes anterior (negativo)'
          );

          // Now calculate previous month total and add new balance entry
          const prevMonthTotal = calculateMonthTotal(newData.months[i - 1]);

          if (prevMonthTotal.neto !== 0) {
            if (prevMonthTotal.neto > 0) {
              firstValidDay.ingresos.fijos.unshift({
                id: 'saldo-' + i,
                description: 'Saldo mes anterior',
                amount: prevMonthTotal.neto,
                date: '2025-' + String(i + 1).padStart(2, '0') + '-01',
                checked: true,
                notes: 'Transferencia automática',
                tags: ['#saldo']
              });
            } else {
              firstValidDay.gastos.fijos.unshift({
                id: 'saldo-neg-' + i,
                description: 'Saldo mes anterior (negativo)',
                amount: Math.abs(prevMonthTotal.neto),
                date: '2025-' + String(i + 1).padStart(2, '0') + '-01',
                checked: true,
                notes: 'Transferencia automática',
                tags: ['#saldo']
              });
            }
          }
        }
      }

      return newData;
    });
  };

  const calculateMonthTotal = (month) => {
    let ingresos = 0;
    let gastos = 0;

    month.weeks.forEach(week => {
      week.days.forEach(day => {
        if (day.isValid) {
          day.ingresos.fijos.forEach(i => ingresos += i.amount);
          day.ingresos.variables.forEach(i => ingresos += i.amount);
          day.gastos.fijos.forEach(g => gastos += g.amount);
          day.gastos.variables.forEach(g => gastos += g.amount);
        }
      });
    });

    return { ingresos: ingresos, gastos: gastos, neto: ingresos - gastos };
  };

  const groupExpensesByTag = () => {
    const grouped = {};

    cashflowData.months.forEach(month => {
      month.weeks.forEach(week => {
        week.days.forEach(day => {
          if (day.isValid) {
            const allGastos = [...day.gastos.fijos, ...day.gastos.variables];
            allGastos.forEach(item => {
              if (item.tags && item.tags.length > 0) {
                item.tags.forEach(tag => {
                  if (!grouped[tag]) {
                    grouped[tag] = { total: 0, items: [] };
                  }
                  grouped[tag].total += item.amount;
                  grouped[tag].items.push({ ...item, month: month.name });
                });
              } else {
                if (!grouped['Sin etiqueta']) {
                  grouped['Sin etiqueta'] = { total: 0, items: [] };
                }
                grouped['Sin etiqueta'].total += item.amount;
                grouped['Sin etiqueta'].items.push({ ...item, month: month.name });
              }
            });
          }
        });
      });
    });

    return grouped;
  };

  const calculateDailyCashPosition = (monthIdx) => {
    const month = cashflowData.months[monthIdx];
    const dailyPositions = [];
    let runningBalance = monthIdx > 0 ? totals.monthly[monthIdx - 1].acumulado : 0;

    month.weeks.forEach(week => {
      week.days.forEach(day => {
        if (day.isValid) {
          const dayIngresos = [...day.ingresos.fijos, ...day.ingresos.variables]
            .reduce((sum, item) => sum + item.amount, 0);
          const dayGastos = [...day.gastos.fijos, ...day.gastos.variables]
            .reduce((sum, item) => sum + item.amount, 0);

          runningBalance += dayIngresos - dayGastos;

          dailyPositions.push({
            dayNumber: day.dayNumber,
            ingresos: dayIngresos,
            gastos: dayGastos,
            neto: dayIngresos - dayGastos,
            balance: runningBalance,
            date: '2025-' + String(monthIdx + 1).padStart(2, '0') + '-' + String(day.dayNumber).padStart(2, '0')
          });
        }
      });
    });

    return dailyPositions;
  };

  const getTodayNotifications = () => {
    const notifications = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    cashflowData.months.forEach((month) => {
      month.weeks.forEach(week => {
        week.days.forEach(day => {
          if (day.isValid) {
            const allIngresos = [...day.ingresos.fijos, ...day.ingresos.variables];
            allIngresos.forEach(item => {
              if (item.date === todayStr) {
                notifications.push({ type: 'ingreso', ...item, month: month.name, day: day.dayNumber });
              }
            });
            const allGastos = [...day.gastos.fijos, ...day.gastos.variables];
            allGastos.forEach(item => {
              if (item.date === todayStr) {
                notifications.push({ type: 'gasto', ...item, month: month.name, day: day.dayNumber });
              }
            });
          }
        });
      });
    });

    return notifications;
  };

  const addItem = (monthIdx, weekIdx, dayIdx, category, type) => {
    const day = cashflowData.months[monthIdx].weeks[weekIdx].days[dayIdx];
    if (!day.isValid) return;

    const newItem = {
      id: 'item-' + Date.now() + '-' + Math.random(),
      description: 'Nuevo item',
      amount: 0,
      date: '2025-' + String(monthIdx + 1).padStart(2, '0') + '-' + String(day.dayNumber).padStart(2, '0'),
      checked: false,
      notes: '',
      tags: [],
      isNew: true,
      createdBy: user?.name || user?.email || 'Unknown',
      createdAt: new Date().toISOString(),
      modifiedBy: null,
      modifiedAt: null,
      history: [],
      alertEnabled: false,
      alertDays: 0
    };

    setCashflowData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      newData.months[monthIdx].weeks[weekIdx].days[dayIdx][category][type].push(newItem);
      return newData;
    });

    setEditingItem(newItem.id);
  };

  const updateItem = (monthIdx, weekIdx, dayIdx, category, type, itemId, field, value) => {
    setCashflowData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      const items = newData.months[monthIdx].weeks[weekIdx].days[dayIdx][category][type];
      const item = items.find(i => i.id === itemId);
      if (item) {
        const oldValue = item[field];

        if (field === 'amount') {
          item[field] = parseFloat(value) || 0;
        } else if (field === 'tags') {
          if (typeof value === 'string') {
            item[field] = value.split(' ').filter(t => t.startsWith('#'));
          } else if (Array.isArray(value)) {
            item[field] = value;
          } else {
            item[field] = [];
          }
        } else {
          item[field] = value;
        }

        // Track modification history (skip tracking for isNew field)
        if (field !== 'isNew' && oldValue !== value && !item.isNew) {
          if (!item.history) item.history = [];
          item.history.push({
            field: field,
            oldValue: oldValue,
            newValue: value,
            modifiedBy: user?.name || user?.email || 'Unknown',
            modifiedAt: new Date().toISOString()
          });
          item.modifiedBy = user?.name || user?.email || 'Unknown';
          item.modifiedAt = new Date().toISOString();
        }
      }
      return newData;
    });
  };

  const deleteItem = (monthIdx, weekIdx, dayIdx, category, type, itemId) => {
    setCashflowData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      newData.months[monthIdx].weeks[weekIdx].days[dayIdx][category][type] =
        newData.months[monthIdx].weeks[weekIdx].days[dayIdx][category][type].filter(i => i.id !== itemId);
      return newData;
    });
    if (hoveredItem === itemId) setHoveredItem(null);
    if (editingItem === itemId) setEditingItem(null);
  };

  const handleDeleteClick = (e, monthIdx, weekIdx, dayIdx, category, type, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('¿Eliminar este item?')) {
      deleteItem(monthIdx, weekIdx, dayIdx, category, type, itemId);
    }
  };

  const toggleCheckItem = (e, monthIdx, weekIdx, dayIdx, category, type, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    const day = cashflowData.months[monthIdx].weeks[weekIdx].days[dayIdx];
    const item = day[category][type].find(i => i.id === itemId);
    const currentChecked = item ? item.checked : false;
    updateItem(monthIdx, weekIdx, dayIdx, category, type, itemId, 'checked', !currentChecked);
  };

  const handleDragStart = (e, item, monthIdx, weekIdx, dayIdx, category, type) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem({ item: item, monthIdx: monthIdx, weekIdx: weekIdx, dayIdx: dayIdx, category: category, type: type });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetMonthIdx, targetWeekIdx, targetDayIdx, targetCategory, targetType) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem) return;

    const item = draggedItem.item;
    const monthIdx = draggedItem.monthIdx;
    const weekIdx = draggedItem.weekIdx;
    const dayIdx = draggedItem.dayIdx;
    const category = draggedItem.category;
    const type = draggedItem.type;

    if (category !== targetCategory) {
      notifyError('No puedes mover un ingreso a gastos ni un gasto a ingresos');
      setDraggedItem(null);
      return;
    }

    if (monthIdx === targetMonthIdx && weekIdx === targetWeekIdx && dayIdx === targetDayIdx &&
        category === targetCategory && type === targetType) {
      setDraggedItem(null);
      return;
    }

    setCashflowData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));

      newData.months[monthIdx].weeks[weekIdx].days[dayIdx][category][type] =
        newData.months[monthIdx].weeks[weekIdx].days[dayIdx][category][type].filter(i => i.id !== item.id);

      const targetDay = newData.months[targetMonthIdx].weeks[targetWeekIdx].days[targetDayIdx];
      if (targetDay.isValid) {
        const newDate = '2025-' + String(targetMonthIdx + 1).padStart(2, '0') + '-' + String(targetDay.dayNumber).padStart(2, '0');
        item.date = newDate;
      }

      newData.months[targetMonthIdx].weeks[targetWeekIdx].days[targetDayIdx][targetCategory][targetType].push(item);

      return newData;
    });

    setDraggedItem(null);
  };

  const createRecurringItem = (baseItem, startMonth, endMonth) => {
    setCashflowData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));

      const originalDate = new Date(baseItem.date);
      const dayOfMonth = originalDate.getDate();

      let itemCategory = null;
      let itemType = null;

      for (let mIdx = 0; mIdx < newData.months.length; mIdx++) {
        const month = newData.months[mIdx];
        for (let wIdx = 0; wIdx < month.weeks.length; wIdx++) {
          const week = month.weeks[wIdx];
          for (let dIdx = 0; dIdx < week.days.length; dIdx++) {
            const day = week.days[dIdx];
            if (day.isValid) {
              ['ingresos', 'gastos'].forEach(cat => {
                ['fijos', 'variables'].forEach(t => {
                  if (day[cat][t].some(i => i.id === baseItem.id)) {
                    itemCategory = cat;
                    itemType = t;
                  }
                });
              });
            }
          }
        }
      }

      if (!itemCategory || !itemType) {
        notifyError('No se pudo determinar la categoría del item');
        return prev;
      }

      for (let monthIdx = startMonth; monthIdx <= endMonth; monthIdx++) {
        const targetMonth = newData.months[monthIdx];
        const daysInTargetMonth = targetMonth.days;

        let targetDay = dayOfMonth;
        if (targetDay > daysInTargetMonth) {
          targetDay = daysInTargetMonth;
        }

        let found = false;
        for (let wIdx = 0; wIdx < targetMonth.weeks.length && !found; wIdx++) {
          const week = targetMonth.weeks[wIdx];
          for (let dIdx = 0; dIdx < week.days.length && !found; dIdx++) {
            const day = week.days[dIdx];
            if (day.isValid && day.dayNumber === targetDay) {
              const exists = day[itemCategory][itemType].some(
                it => it.description === baseItem.description && it.amount === baseItem.amount
              );

              if (!exists) {
                const newItem = {
                  id: 'item-' + Date.now() + '-' + Math.random() + '-' + monthIdx,
                  description: baseItem.description,
                  amount: baseItem.amount,
                  date: '2025-' + String(monthIdx + 1).padStart(2, '0') + '-' + String(targetDay).padStart(2, '0'),
                  checked: baseItem.checked || false,
                  notes: baseItem.notes || '',
                  tags: [...(baseItem.tags || []), '#recurrente']
                };

                day[itemCategory][itemType].push(newItem);
              }
              found = true;
            }
          }
        }
      }

      return newData;
    });
  };

  const calculateTotals = () => {
    const totals = {
      monthly: [],
      quarterly: [],
      annual: { ingresos: 0, gastos: 0, neto: 0 }
    };

    cashflowData.months.forEach((month) => {
      let monthIngresos = 0;
      let monthGastos = 0;

      month.weeks.forEach(week => {
        week.days.forEach(day => {
          if (day.isValid) {
            day.ingresos.fijos.forEach(i => monthIngresos += i.amount);
            day.ingresos.variables.forEach(i => monthIngresos += i.amount);
            day.gastos.fijos.forEach(g => monthGastos += g.amount);
            day.gastos.variables.forEach(g => monthGastos += g.amount);
          }
        });
      });

      totals.monthly.push({
        month: month.name,
        ingresos: monthIngresos,
        gastos: monthGastos,
        neto: monthIngresos - monthGastos
      });
    });

    for (let i = 0; i < 4; i++) {
      const start = i * 3;
      const qMonths = totals.monthly.slice(start, start + 3);
      totals.quarterly.push({
        quarter: i + 1,
        ingresos: qMonths.reduce((sum, m) => sum + m.ingresos, 0),
        gastos: qMonths.reduce((sum, m) => sum + m.gastos, 0),
        neto: qMonths.reduce((sum, m) => sum + m.neto, 0)
      });
    }

    totals.annual = {
      ingresos: totals.monthly.reduce((sum, m) => sum + m.ingresos, 0),
      gastos: totals.monthly.reduce((sum, m) => sum + m.gastos, 0),
      neto: totals.monthly.reduce((sum, m) => sum + m.neto, 0)
    };

    let acumulado = 0;
    totals.monthly.forEach(m => {
      acumulado += m.neto;
      m.acumulado = acumulado;
    });

    return totals;
  };

  const totals = calculateTotals();

  const exportData = () => {
    const dataStr = JSON.stringify(cashflowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = 'cashflow-v3.0-' + new Date().toISOString().split('T')[0] + '.json';
    link.download = fileName;
    link.click();
    notifySuccess('Datos exportados correctamente');
  };

  const handleMouseEnter = (e, itemId) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setHoveredItem(itemId);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const handleFABAction = (actionId) => {
    notifyInfo(`Acción ${actionId} seleccionada`);

    if (actionId === 'add-income') {
      // Add income to current month
      const today = new Date();
      const monthIdx = today.getMonth();
      const day = today.getDate();

      // Change to calendar view first
      setSelectedMonth(monthIdx);
      setCurrentView('calendar');

      // Find the day and add income
      const month = cashflowData.months[monthIdx];
      for (let wIdx = 0; wIdx < month.weeks.length; wIdx++) {
        const week = month.weeks[wIdx];
        for (let dIdx = 0; dIdx < week.days.length; dIdx++) {
          const dayObj = week.days[dIdx];
          if (dayObj.isValid && dayObj.dayNumber === day) {
            // Add a slight delay to ensure view has changed
            setTimeout(() => {
              addItem(monthIdx, wIdx, dIdx, 'ingresos', 'variables');
            }, 100);
            return;
          }
        }
      }
    } else if (actionId === 'add-expense') {
      // Add expense to current month
      const today = new Date();
      const monthIdx = today.getMonth();
      const day = today.getDate();

      // Change to calendar view first
      setSelectedMonth(monthIdx);
      setCurrentView('calendar');

      const month = cashflowData.months[monthIdx];
      for (let wIdx = 0; wIdx < month.weeks.length; wIdx++) {
        const week = month.weeks[wIdx];
        for (let dIdx = 0; dIdx < week.days.length; dIdx++) {
          const dayObj = week.days[dIdx];
          if (dayObj.isValid && dayObj.dayNumber === day) {
            // Add a slight delay to ensure view has changed
            setTimeout(() => {
              addItem(monthIdx, wIdx, dIdx, 'gastos', 'variables');
            }, 100);
            return;
          }
        }
      }
    }
  };

  const renderItemBubble = (item, monthIdx, weekIdx, dayIdx, category, type) => {
    const bgColor = item.checked
      ? (category === 'ingresos' ? 'bg-green-300 border-green-500' : 'bg-red-300 border-red-500')
      : (category === 'ingresos' ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300');

    const isDragging = draggedItem && draggedItem.item.id === item.id;

    return (
      <div
        key={item.id}
        draggable
        onDragStart={(e) => handleDragStart(e, item, monthIdx, weekIdx, dayIdx, category, type)}
        onDragEnd={() => setDraggedItem(null)}
        className={'relative inline-block m-0.5 ' + (isDragging ? 'opacity-30' : '')}
        onMouseEnter={(e) => handleMouseEnter(e, item.id)}
        onMouseLeave={handleMouseLeave}
      >
        <div className={bgColor + ' px-2 py-1 rounded-full text-xs border-2 cursor-move hover:shadow-lg transition-all flex items-center gap-1'}>
          <button
            onMouseDown={(e) => toggleCheckItem(e, monthIdx, weekIdx, dayIdx, category, type, item.id)}
            className="hover:scale-110 transition-transform cursor-pointer"
            title={item.checked ? "Despuntear" : "Puntear"}
            type="button"
          >
            {item.checked ? <CheckSquare size={10} /> : <Square size={10} />}
          </button>
          <span
            onClick={() => setEditingItem(item.id)}
            className="cursor-pointer"
          >
            €{item.amount.toFixed(0)}
          </span>
          <button
            onMouseDown={(e) => handleDeleteClick(e, monthIdx, weekIdx, dayIdx, category, type, item.id)}
            className="hover:scale-110 transition-transform text-red-600 hover:text-red-800 cursor-pointer"
            title="Eliminar"
            type="button"
          >
            <X size={10} />
          </button>
        </div>
      </div>
    );
  };

  const renderTooltip = () => {
    if (!hoveredItem) return null;

    const allItems = [];
    cashflowData.months.forEach(m => {
      m.weeks.forEach(w => {
        w.days.forEach(d => {
          if (d.isValid) {
            allItems.push(...d.ingresos.fijos, ...d.ingresos.variables, ...d.gastos.fijos, ...d.gastos.variables);
          }
        });
      });
    });

    const item = allItems.find(i => i.id === hoveredItem);

    if (!item) return null;

    const leftPos = tooltipPosition.x + 'px';
    const topPos = tooltipPosition.y + 'px';

    return (
      <div
        className="fixed z-50 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-3 w-64 pointer-events-none"
        style={{
          left: leftPos,
          top: topPos,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <div className="font-bold text-sm mb-1">{item.description}</div>
        <div className="text-xs text-gray-600 mb-1">
          <strong>Monto:</strong> €{item.amount.toFixed(2)}
        </div>
        <div className="text-xs text-gray-600 mb-1">
          <strong>Fecha:</strong> {item.date}
        </div>
        <div className="text-xs text-gray-600 mb-1">
          <strong>Estado:</strong> {item.checked ? '✓ Punteado' : '○ Sin puntear'}
        </div>
        {item.notes && (
          <div className="text-xs text-gray-600 mb-1">
            <strong>Nota:</strong> {item.notes}
          </div>
        )}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.tags.map((tag, idx) => (
              <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="text-xs text-gray-400 mt-2 italic">
          Click en el monto para editar
        </div>
      </div>
    );
  };

  const renderGraphs = () => {
    const monthlyData = totals.monthly.map((m) => ({
      name: m.month.substring(0, 3),
      ingresos: m.ingresos,
      gastos: m.gastos,
      neto: m.neto,
      acumulado: m.acumulado
    }));

    return (
      <div className="space-y-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Flujo de Caja Mensual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => '€' + value.toFixed(0)} />
              <Legend />
              <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
              <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">CashFlow Acumulado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => '€' + value.toFixed(0)} />
              <Legend />
              <Area type="monotone" dataKey="acumulado" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Acumulado" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // LOGIN/REGISTER VIEW
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">💰 CashFlow</h1>
            <p className="text-gray-600">v3.0 - Mobile First + AI Assistant</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {authView === 'login' ? (
            <form onSubmit={handleLogin}>
              <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
              </button>

              <p className="text-center mt-4 text-gray-600">
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setAuthView('register')}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Regístrate
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <h2 className="text-2xl font-bold mb-6 text-center">Crear Cuenta</h2>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Nombre</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tu nombre"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Cargando...' : 'Registrarse'}
              </button>

              <p className="text-center mt-4 text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setAuthView('login')}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Inicia sesión
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // DASHBOARD VIEW
  if (currentView === 'dashboard') {
    return (
      <Layout user={user}>
        <SaveIndicator status={saveStatus} />
        {renderTooltip()}
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard CashFlow {selectedYear}</h1>
                <p className="text-gray-600">Versión 3.0 - Mobile First + AI</p>
              </div>
              <div className="flex gap-2 items-center">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-lg font-semibold text-gray-800 hover:border-blue-500 focus:outline-none focus:border-blue-500 shadow-sm"
                >
                  {availableYears.map(yearObj => (
                    <option key={yearObj.year} value={yearObj.year}>
                      {yearObj.year}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowYearModal(true)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg text-lg font-bold"
                  title="Crear nuevo año"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 shadow-lg relative"
              >
                <Bell size={20} />
                Notificaciones
                {getTodayNotifications().length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {getTodayNotifications().length}
                  </span>
                )}
              </button>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-lg"
              >
                <Upload size={20} />
                Exportar
              </button>
              <button
                onClick={() => setShowGraphs(!showGraphs)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-lg"
              >
                <BarChart3 size={20} />
                {showGraphs ? 'Ocultar' : 'Ver'} Gráficos
              </button>
              <button
                onClick={() => setShowGroupedExpenses(!showGroupedExpenses)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2 shadow-lg"
              >
                <Tag size={20} />
                {showGroupedExpenses ? 'Ocultar' : 'Ver'} Gastos Agrupados
              </button>
              <button
                onClick={() => setCurrentView('calendar')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg"
              >
                <CalendarDays size={20} />
                Vista Calendario
              </button>
            </div>
          </div>

          {showNotifications && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-yellow-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Bell size={24} />
                  Notificaciones de Hoy
                </h3>
                <button onClick={() => setShowNotifications(false)}>
                  <X size={20} />
                </button>
              </div>
              {getTodayNotifications().length === 0 ? (
                <p className="text-gray-500">No hay ingresos ni gastos programados para hoy</p>
              ) : (
                <div className="space-y-2">
                  {getTodayNotifications().map((notif, idx) => (
                    <div key={idx} className={notif.type === 'ingreso' ? 'p-3 rounded bg-green-50 border-l-4 border-green-500' : 'p-3 rounded bg-red-50 border-l-4 border-red-500'}>
                      <div className="font-semibold">{notif.description}</div>
                      <div className="text-sm text-gray-600">
                        {notif.month} - Día {notif.day} | €{notif.amount.toFixed(2)}
                      </div>
                      {notif.notes && <div className="text-xs text-gray-500 mt-1">{notif.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showYearModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Crear Nuevo Año</h3>
                  <button onClick={() => setShowYearModal(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año
                  </label>
                  <input
                    type="number"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    placeholder="ej. 2027"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    min="2020"
                    max="2050"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (newYearInput && parseInt(newYearInput) > 2020 && parseInt(newYearInput) < 2050) {
                        createYear(newYearInput);
                        setShowYearModal(false);
                        setNewYearInput('');
                      } else {
                        alert('Por favor, introduce un año válido entre 2020 y 2050');
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Crear Año
                  </button>
                  <button
                    onClick={() => {
                      setShowYearModal(false);
                      setNewYearInput('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {showGraphs && renderGraphs()}

          {showGroupedExpenses && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Tag size={24} className="text-amber-600" />
                Gastos Agrupados por Etiqueta
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(groupExpensesByTag())
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([tag, data]) => (
                    <div key={tag} className="border-2 rounded-lg p-4 hover:border-amber-400 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-lg font-bold text-amber-700">{tag}</div>
                        <div className="text-xl font-bold text-red-600">€{data.total.toFixed(2)}</div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{data.items.length} gastos</div>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Ver detalles</summary>
                        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                          {data.items.map((item, idx) => (
                            <div key={idx} className="border-t pt-1">
                              <div className="font-semibold">{item.description}</div>
                              <div className="text-gray-600">
                                {item.month} - €{item.amount.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">Ingresos Totales</span>
                <TrendingUp className="text-green-500" size={28} />
              </div>
              <div className="text-3xl font-bold text-green-600">
                €{totals.annual.ingresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">Gastos Totales</span>
                <TrendingDown className="text-red-500" size={28} />
              </div>
              <div className="text-3xl font-bold text-red-600">
                €{totals.annual.gastos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">CashFlow Neto</span>
                <DollarSign className="text-blue-500" size={28} />
              </div>
              <div className={'text-3xl font-bold ' + (totals.annual.neto >= 0 ? 'text-blue-600' : 'text-red-600')}>
                €{totals.annual.neto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={24} className="text-blue-600" />
              Resumen Trimestral
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {totals.quarterly.map((q, idx) => (
                <div key={idx} className="border-2 rounded-xl p-4 hover:border-blue-300 transition-colors">
                  <h3 className="font-bold text-xl mb-3 text-blue-600">T{q.quarter}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ingresos:</span>
                      <span className="font-semibold text-green-600">€{q.ingresos.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gastos:</span>
                      <span className="font-semibold text-red-600">€{q.gastos.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2">
                      <span className="font-semibold">Neto:</span>
                      <span className={'font-bold ' + (q.neto >= 0 ? 'text-blue-600' : 'text-red-600')}>
                        €{q.neto.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CalendarDays size={24} className="text-blue-600" />
              Calendario Anual - Vista Rápida
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {totals.monthly.map((m, idx) => (
                <div
                  key={idx}
                  className="border-2 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => { setSelectedMonth(idx); setCurrentView('calendar'); }}
                >
                  <div className="font-bold text-center mb-2 text-blue-700">{m.month}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ingresos:</span>
                      <span className="font-semibold text-green-600">€{m.ingresos.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gastos:</span>
                      <span className="font-semibold text-red-600">€{m.gastos.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t">
                      <span className="font-semibold">Neto:</span>
                      <span className={'font-bold ' + (m.neto >= 0 ? 'text-blue-600' : 'text-red-600')}>
                        €{m.neto.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t">
                      <span className="font-semibold text-purple-600">Acum:</span>
                      <span className={'font-bold ' + (m.acumulado >= 0 ? 'text-purple-600' : 'text-red-600')}>
                        €{m.acumulado.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Desglose Mensual</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left p-3">Mes</th>
                  <th className="text-right p-3 text-green-600">Ingresos</th>
                  <th className="text-right p-3 text-red-600">Gastos</th>
                  <th className="text-right p-3 text-blue-600">Neto</th>
                  <th className="text-right p-3 text-purple-600">Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {totals.monthly.map((m, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-blue-50 cursor-pointer"
                    onClick={() => { setSelectedMonth(idx); setCurrentView('calendar'); }}
                  >
                    <td className="p-3 font-medium">{m.month}</td>
                    <td className="p-3 text-right text-green-600 font-semibold">€{m.ingresos.toFixed(0)}</td>
                    <td className="p-3 text-right text-red-600 font-semibold">€{m.gastos.toFixed(0)}</td>
                    <td className={'p-3 text-right font-bold ' + (m.neto >= 0 ? 'text-blue-600' : 'text-red-600')}>
                      €{m.neto.toFixed(0)}
                    </td>
                    <td className={'p-3 text-right font-bold ' + (m.acumulado >= 0 ? 'text-purple-600' : 'text-red-600')}>
                      €{m.acumulado.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <FAB onAction={handleFABAction} />
      </Layout>
    );
  }

  // CALENDAR VIEW
  return (
    <Layout user={user}>
      <SaveIndicator status={saveStatus} />
      {renderTooltip()}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              {cashflowData.months[selectedMonth].name} {selectedYear}
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDailyCash(!showDailyCash)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <TrendingUp size={20} />
              {showDailyCash ? 'Ocultar' : 'Ver'} Caja Diaria
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Upload size={20} />
              Exportar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Ingresos del Mes</div>
            <div className="text-2xl font-bold text-green-600">
              €{totals.monthly[selectedMonth].ingresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-red-500">
            <div className="text-sm text-gray-600 mb-1">Gastos del Mes</div>
            <div className="text-2xl font-bold text-red-600">
              €{totals.monthly[selectedMonth].gastos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">CashFlow del Mes</div>
            <div className={'text-2xl font-bold ' + (totals.monthly[selectedMonth].neto >= 0 ? 'text-blue-600' : 'text-red-600')}>
              €{totals.monthly[selectedMonth].neto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Acumulado hasta {totals.monthly[selectedMonth].month}</div>
              <div className={'text-xl font-bold ' + (totals.monthly[selectedMonth].acumulado >= 0 ? 'text-purple-600' : 'text-red-600')}>
                €{totals.monthly[selectedMonth].acumulado.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Saldo Anterior</div>
              <div className="text-lg font-semibold text-gray-700">
                €{(selectedMonth > 0 ? totals.monthly[selectedMonth - 1].acumulado : 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {showDailyCash && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={24} className="text-indigo-600" />
              Posición de Caja Día a Día
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-2">Día</th>
                    <th className="text-right p-2 text-green-600">Ingresos</th>
                    <th className="text-right p-2 text-red-600">Gastos</th>
                    <th className="text-right p-2 text-blue-600">Neto Día</th>
                    <th className="text-right p-2 text-purple-600">Balance Acum.</th>
                  </tr>
                </thead>
                <tbody>
                  {calculateDailyCashPosition(selectedMonth).map((day, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">Día {day.dayNumber}</td>
                      <td className="p-2 text-right text-green-600">€{day.ingresos.toFixed(2)}</td>
                      <td className="p-2 text-right text-red-600">€{day.gastos.toFixed(2)}</td>
                      <td className={'p-2 text-right font-semibold ' + (day.neto >= 0 ? 'text-blue-600' : 'text-red-600')}>
                        €{day.neto.toFixed(2)}
                      </td>
                      <td className={'p-2 text-right font-bold ' + (day.balance >= 0 ? 'text-purple-600' : 'text-red-600')}>
                        €{day.balance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {cashflowData.months[selectedMonth].weeks.map((week, weekIdx) => (
          <div key={week.id} className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-blue-600">
              Semana {week.weekNumber}
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {week.days.map((day, dayIdx) => (
                <div
                  key={day.id}
                  className={
                    day.isValid
                      ? 'border-2 rounded-lg p-3 min-h-[200px] bg-gray-50 hover:bg-blue-50 transition-colors'
                      : 'border-2 border-dashed rounded-lg p-3 min-h-[200px] bg-gray-100 opacity-50'
                  }
                  onDragOver={day.isValid ? handleDragOver : null}
                  onDrop={day.isValid ? (e) => handleDrop(e, selectedMonth, weekIdx, dayIdx, 'ingresos', 'fijos') : null}
                >
                  {day.isValid && (
                    <>
                      <div className="font-bold text-center mb-2 text-lg">
                        Día {day.dayNumber}
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-green-700">Ingresos Fijos</span>
                          <button
                            onClick={() => addItem(selectedMonth, weekIdx, dayIdx, 'ingresos', 'fijos')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div
                          className="min-h-[40px] p-1 rounded bg-green-50 border border-green-200"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, selectedMonth, weekIdx, dayIdx, 'ingresos', 'fijos')}
                        >
                          {day.ingresos.fijos.map(item => renderItemBubble(item, selectedMonth, weekIdx, dayIdx, 'ingresos', 'fijos'))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-green-700">Ingresos Variables</span>
                          <button
                            onClick={() => addItem(selectedMonth, weekIdx, dayIdx, 'ingresos', 'variables')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div
                          className="min-h-[40px] p-1 rounded bg-green-50 border border-green-200"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, selectedMonth, weekIdx, dayIdx, 'ingresos', 'variables')}
                        >
                          {day.ingresos.variables.map(item => renderItemBubble(item, selectedMonth, weekIdx, dayIdx, 'ingresos', 'variables'))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-red-700">Gastos Fijos</span>
                          <button
                            onClick={() => addItem(selectedMonth, weekIdx, dayIdx, 'gastos', 'fijos')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div
                          className="min-h-[40px] p-1 rounded bg-red-50 border border-red-200"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, selectedMonth, weekIdx, dayIdx, 'gastos', 'fijos')}
                        >
                          {day.gastos.fijos.map(item => renderItemBubble(item, selectedMonth, weekIdx, dayIdx, 'gastos', 'fijos'))}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-red-700">Gastos Variables</span>
                          <button
                            onClick={() => addItem(selectedMonth, weekIdx, dayIdx, 'gastos', 'variables')}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div
                          className="min-h-[40px] p-1 rounded bg-red-50 border border-red-200"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, selectedMonth, weekIdx, dayIdx, 'gastos', 'variables')}
                        >
                          {day.gastos.variables.map(item => renderItemBubble(item, selectedMonth, weekIdx, dayIdx, 'gastos', 'variables'))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {editingItem && (() => {
          let foundItem = null;
          let foundMonthIdx = null;
          let foundWeekIdx = null;
          let foundDayIdx = null;
          let foundCategory = null;
          let foundType = null;

          for (let mIdx = 0; mIdx < cashflowData.months.length && !foundItem; mIdx++) {
            const month = cashflowData.months[mIdx];
            for (let wIdx = 0; wIdx < month.weeks.length && !foundItem; wIdx++) {
              const week = month.weeks[wIdx];
              for (let dIdx = 0; dIdx < week.days.length && !foundItem; dIdx++) {
                const day = week.days[dIdx];
                if (day.isValid) {
                  ['ingresos', 'gastos'].forEach(cat => {
                    ['fijos', 'variables'].forEach(t => {
                      const item = day[cat][t].find(i => i.id === editingItem);
                      if (item) {
                        foundItem = item;
                        foundMonthIdx = mIdx;
                        foundWeekIdx = wIdx;
                        foundDayIdx = dIdx;
                        foundCategory = cat;
                        foundType = t;
                      }
                    });
                  });
                }
              }
            }
          }

          if (!foundItem) return null;

          return (
            <EditModal
              item={foundItem}
              onClose={() => {
                if (foundItem.isNew) {
                  deleteItem(foundMonthIdx, foundWeekIdx, foundDayIdx, foundCategory, foundType, editingItem);
                }
                setEditingItem(null);
              }}
              onSave={(updatedItem) => {
                Object.keys(updatedItem).forEach(key => {
                  updateItem(foundMonthIdx, foundWeekIdx, foundDayIdx, foundCategory, foundType, editingItem, key, updatedItem[key]);
                });
                updateItem(foundMonthIdx, foundWeekIdx, foundDayIdx, foundCategory, foundType, editingItem, 'isNew', false);
                setEditingItem(null);
              }}
              onDelete={() => {
                deleteItem(foundMonthIdx, foundWeekIdx, foundDayIdx, foundCategory, foundType, editingItem);
                setEditingItem(null);
              }}
              onCreateRecurring={(item, startMonth, endMonth) => {
                createRecurringItem(item, startMonth, endMonth);
              }}
            />
          );
        })()}
      </div>
      <FAB onAction={handleFABAction} />
    </Layout>
  );
};

const EditModal = ({ item, onClose, onSave, onDelete, onCreateRecurring }) => {
  const [formData, setFormData] = useState(item);
  const [showRecurring, setShowRecurring] = useState(false);
  const [recurringMonths, setRecurringMonths] = useState({ start: 0, end: 11 });

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const handleCreateRecurring = () => {
    if (recurringMonths.start > recurringMonths.end) {
      alert('El mes de inicio debe ser anterior al mes de fin');
      return;
    }

    onCreateRecurring(formData, recurringMonths.start, recurringMonths.end);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">Editar Item</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Descripción"
          />
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Cantidad (€)"
          />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value.slice(0, 30) })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Notas (max 30 caracteres)"
            maxLength={30}
          />
          <input
            type="text"
            value={(formData.tags || []).join(' ')}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(' ').filter(t => t.startsWith('#')) })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Tags: #categoria #otro"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.checked || false}
              onChange={(e) => setFormData({ ...formData, checked: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm">Punteado con el banco</label>
          </div>

          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Alertas</label>
              <input
                type="checkbox"
                checked={formData.alertEnabled || false}
                onChange={(e) => setFormData({ ...formData, alertEnabled: e.target.checked })}
                className="w-4 h-4"
              />
            </div>
            {formData.alertEnabled && (
              <div className="flex items-center gap-2">
                <label className="text-xs">Días de anticipación:</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.alertDays || 0}
                  onChange={(e) => setFormData({ ...formData, alertDays: parseInt(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 border rounded text-sm"
                />
              </div>
            )}
          </div>

          {formData.createdBy && (
            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
              <div className="font-semibold text-gray-700">Información de Auditoría</div>
              <div className="text-gray-600">
                Creado por: <span className="font-semibold">{formData.createdBy}</span>
              </div>
              {formData.createdAt && (
                <div className="text-gray-600">
                  Fecha creación: {new Date(formData.createdAt).toLocaleString('es-ES')}
                </div>
              )}
              {formData.modifiedBy && (
                <>
                  <div className="text-gray-600">
                    Última modificación: <span className="font-semibold">{formData.modifiedBy}</span>
                  </div>
                  {formData.modifiedAt && (
                    <div className="text-gray-600">
                      {new Date(formData.modifiedAt).toLocaleString('es-ES')}
                    </div>
                  )}
                </>
              )}
              {formData.history && formData.history.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Ver historial ({formData.history.length} cambios)
                  </summary>
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {formData.history.slice(-5).reverse().map((h, idx) => (
                      <div key={idx} className="border-t pt-1">
                        <div className="font-semibold">{h.field}</div>
                        <div className="text-gray-500">
                          {String(h.oldValue)} → {String(h.newValue)}
                        </div>
                        <div className="text-gray-400">
                          {h.modifiedBy} - {new Date(h.modifiedAt).toLocaleString('es-ES')}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          <div className="border-t-2 pt-4 mt-4">
            <button
              onClick={() => setShowRecurring(!showRecurring)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <Calendar size={16} />
              {showRecurring ? 'Ocultar' : 'Crear como Recurrente'}
            </button>
          </div>

          {showRecurring && (
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 space-y-3">
              <h4 className="font-bold text-purple-900">Configurar Recurrencia</h4>
              <p className="text-xs text-purple-700">
                Este item se creará automáticamente en todos los meses seleccionados, el mismo día.
              </p>

              <div>
                <label className="text-sm font-semibold text-purple-900 block mb-1">
                  Mes de Inicio:
                </label>
                <select
                  value={recurringMonths.start}
                  onChange={(e) => setRecurringMonths({ ...recurringMonths, start: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg"
                >
                  {monthNames.map((month, idx) => (
                    <option key={idx} value={idx}>{month}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-purple-900 block mb-1">
                  Mes de Fin:
                </label>
                <select
                  value={recurringMonths.end}
                  onChange={(e) => setRecurringMonths({ ...recurringMonths, end: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg"
                >
                  {monthNames.map((month, idx) => (
                    <option key={idx} value={idx}>{month}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white rounded p-2 text-xs">
                <strong>Resumen:</strong> Se crearán {recurringMonths.end - recurringMonths.start + 1} items desde{' '}
                <strong>{monthNames[recurringMonths.start]}</strong> hasta{' '}
                <strong>{monthNames[recurringMonths.end]}</strong>
              </div>

              <button
                onClick={handleCreateRecurring}
                className="w-full px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 font-bold"
              >
                ✓ Crear Recurrentes
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t-2 mt-4">
            <button
              onClick={() => onSave(formData)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Guardar
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Eliminar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowApp;
