import React, { useState, useEffect } from 'react';
import { Database, Trash2, Download, Upload, RefreshCw, HardDrive } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import API_URL from '../../config/api';
import './AdminDatabase.css';

const AdminDatabase = () => {
  const { success, error: notifyError } = useNotifications();
  const [dbStats, setDbStats] = useState({
    totalUsers: 0,
    totalCashflows: 0,
    totalYears: 0,
    dbSize: '---',
    lastBackup: '---'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const fetchDatabaseStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/database/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDbStats(data);
      } else {
        notifyError('Error al cargar estadísticas de la base de datos');
      }
    } catch (error) {
      console.error('Error fetching database stats:', error);
      notifyError('Error al cargar estadísticas de la base de datos');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/database/backup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        success('Backup creado exitosamente');
        fetchDatabaseStats();
      } else {
        notifyError('Error al crear backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      notifyError('Error al crear backup');
    }
  };

  const handleOptimize = async () => {
    if (!window.confirm('¿Estás seguro de optimizar la base de datos? Esta operación puede tardar unos minutos.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/database/optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        success('Base de datos optimizada');
        fetchDatabaseStats();
      } else {
        notifyError('Error al optimizar la base de datos');
      }
    } catch (error) {
      console.error('Error optimizing database:', error);
      notifyError('Error al optimizar la base de datos');
    }
  };

  if (loading) {
    return (
      <div className="admin-database-page">
        <div className="loading-state">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="admin-database-page">
      {/* Header */}
      <div className="admin-database-header">
        <div className="admin-database-title-section">
          <div className="admin-database-icon-wrapper">
            <Database size={32} />
          </div>
          <div>
            <h1 className="admin-database-title">Database Management</h1>
            <p className="admin-database-subtitle">Manage database operations and backups</p>
          </div>
        </div>
        <button className="btn-primary" onClick={fetchDatabaseStats}>
          <RefreshCw size={20} />
          Actualizar
        </button>
      </div>

      {/* Stats Grid */}
      <div className="database-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Database size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Usuarios</div>
            <div className="stat-value">{dbStats.totalUsers}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <HardDrive size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Cashflows</div>
            <div className="stat-value">{dbStats.totalCashflows}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Database size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Años Configurados</div>
            <div className="stat-value">{dbStats.totalYears}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <HardDrive size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Tamaño DB</div>
            <div className="stat-value">{dbStats.dbSize}</div>
          </div>
        </div>
      </div>

      {/* Operations */}
      <div className="database-operations">
        <h2 className="section-title">Operaciones</h2>
        <div className="operations-grid">
          <div className="operation-card">
            <div className="operation-icon backup-icon">
              <Download size={32} />
            </div>
            <h3>Crear Backup</h3>
            <p>Crea una copia de seguridad completa de la base de datos</p>
            <button className="btn-operation btn-backup" onClick={handleBackup}>
              <Download size={20} />
              Crear Backup
            </button>
          </div>

          <div className="operation-card">
            <div className="operation-icon restore-icon">
              <Upload size={32} />
            </div>
            <h3>Restaurar Backup</h3>
            <p>Restaura la base de datos desde un backup anterior</p>
            <button className="btn-operation btn-restore" disabled>
              <Upload size={20} />
              Próximamente
            </button>
          </div>

          <div className="operation-card">
            <div className="operation-icon optimize-icon">
              <RefreshCw size={32} />
            </div>
            <h3>Optimizar BD</h3>
            <p>Optimiza y limpia la base de datos para mejor rendimiento</p>
            <button className="btn-operation btn-optimize" onClick={handleOptimize}>
              <RefreshCw size={20} />
              Optimizar
            </button>
          </div>

          <div className="operation-card">
            <div className="operation-icon danger-icon">
              <Trash2 size={32} />
            </div>
            <h3>Limpiar Datos</h3>
            <p>Elimina datos antiguos o innecesarios (¡Cuidado!)</p>
            <button className="btn-operation btn-danger" disabled>
              <Trash2 size={20} />
              Próximamente
            </button>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="backup-history">
        <h2 className="section-title">Historial de Backups</h2>
        <div className="backup-card">
          <div className="backup-info">
            <div className="backup-date">Último backup: {dbStats.lastBackup}</div>
            <div className="backup-note">
              Los backups automáticos se realizan diariamente a las 3:00 AM
            </div>
          </div>
        </div>
      </div>

      {/* Collections Info */}
      <div className="collections-section">
        <h2 className="section-title">Colecciones de MongoDB</h2>
        <div className="collections-grid">
          <div className="collection-card">
            <div className="collection-name">users</div>
            <div className="collection-count">{dbStats.totalUsers} documentos</div>
          </div>
          <div className="collection-card">
            <div className="collection-name">cashflows</div>
            <div className="collection-count">{dbStats.totalCashflows} documentos</div>
          </div>
          <div className="collection-card">
            <div className="collection-name">years</div>
            <div className="collection-count">{dbStats.totalYears} documentos</div>
          </div>
          <div className="collection-card">
            <div className="collection-name">sessions</div>
            <div className="collection-count">--- documentos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDatabase;
