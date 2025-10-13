import React, { useState, useEffect } from 'react';
import { Server, Activity, Database, Code, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import API_URL from '../../config/api';
import './AdminBackend.css';

const AdminBackend = () => {
  const [backendStatus, setBackendStatus] = useState({
    status: 'loading',
    version: '---',
    uptime: '---',
    memory: '---',
    cpu: '---'
  });

  const [services, setServices] = useState([
    { name: 'API Server', status: 'checking', port: '5000' },
    { name: 'MongoDB', status: 'checking', port: '27017' },
    { name: 'Authentication', status: 'checking', service: 'JWT' },
    { name: 'File Storage', status: 'checking', service: 'Local' }
  ]);

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const checkBackendHealth = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/health`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBackendStatus({
          status: 'online',
          version: data.version || '4.0.0',
          uptime: data.uptime || '---',
          memory: data.memory || '---',
          cpu: data.cpu || '---'
        });

        // Update services status
        setServices(prev => prev.map(service => ({
          ...service,
          status: 'online'
        })));
      } else {
        setBackendStatus(prev => ({ ...prev, status: 'error' }));
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus(prev => ({ ...prev, status: 'offline' }));
      setServices(prev => prev.map(service => ({
        ...service,
        status: 'offline'
      })));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle size={20} className="status-icon-online" />;
      case 'offline':
        return <XCircle size={20} className="status-icon-offline" />;
      case 'checking':
      case 'loading':
        return <Activity size={20} className="status-icon-checking" />;
      default:
        return <AlertTriangle size={20} className="status-icon-warning" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'online':
        return 'status-online';
      case 'offline':
        return 'status-offline';
      case 'checking':
      case 'loading':
        return 'status-checking';
      default:
        return 'status-warning';
    }
  };

  return (
    <div className="admin-backend-page">
      {/* Header */}
      <div className="admin-backend-header">
        <div className="admin-backend-title-section">
          <div className="admin-backend-icon-wrapper">
            <Server size={32} />
          </div>
          <div>
            <h1 className="admin-backend-title">Backend Management</h1>
            <p className="admin-backend-subtitle">Monitor and manage backend services</p>
          </div>
        </div>
      </div>

      {/* Main Status Card */}
      <div className="backend-status-card">
        <div className="status-card-header">
          <div className="status-card-title">
            <Activity size={24} />
            <h2>Backend Status</h2>
          </div>
          <div className={`status-badge ${getStatusClass(backendStatus.status)}`}>
            {getStatusIcon(backendStatus.status)}
            <span>{backendStatus.status}</span>
          </div>
        </div>

        <div className="status-metrics">
          <div className="metric">
            <div className="metric-label">Version</div>
            <div className="metric-value">{backendStatus.version}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Uptime</div>
            <div className="metric-value">{backendStatus.uptime}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Memory Usage</div>
            <div className="metric-value">{backendStatus.memory}</div>
          </div>
          <div className="metric">
            <div className="metric-label">CPU Usage</div>
            <div className="metric-value">{backendStatus.cpu}</div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-section">
        <h2 className="section-title">Services Status</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-card-header">
                <div className="service-name">
                  {service.name === 'API Server' && <Server size={20} />}
                  {service.name === 'MongoDB' && <Database size={20} />}
                  {service.name === 'Authentication' && <CheckCircle size={20} />}
                  {service.name === 'File Storage' && <Code size={20} />}
                  <span>{service.name}</span>
                </div>
                <div className={`service-status ${getStatusClass(service.status)}`}>
                  {getStatusIcon(service.status)}
                </div>
              </div>
              <div className="service-info">
                {service.port && <div className="service-detail">Port: {service.port}</div>}
                {service.service && <div className="service-detail">Type: {service.service}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="endpoints-section">
        <h2 className="section-title">API Endpoints</h2>
        <div className="endpoints-list">
          <div className="endpoint-item">
            <span className="endpoint-method method-get">GET</span>
            <span className="endpoint-path">/api/health</span>
            <span className="endpoint-description">Health check endpoint</span>
          </div>
          <div className="endpoint-item">
            <span className="endpoint-method method-get">GET</span>
            <span className="endpoint-path">/api/cashflow</span>
            <span className="endpoint-description">Get cashflow data</span>
          </div>
          <div className="endpoint-item">
            <span className="endpoint-method method-post">POST</span>
            <span className="endpoint-path">/api/cashflow</span>
            <span className="endpoint-description">Save cashflow data</span>
          </div>
          <div className="endpoint-item">
            <span className="endpoint-method method-get">GET</span>
            <span className="endpoint-path">/api/admin/users</span>
            <span className="endpoint-description">List all users</span>
          </div>
          <div className="endpoint-item">
            <span className="endpoint-method method-post">POST</span>
            <span className="endpoint-path">/api/admin/users</span>
            <span className="endpoint-description">Create new user</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBackend;
