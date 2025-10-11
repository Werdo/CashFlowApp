import React, { useState } from 'react';
import {
  Plus, X, TrendingUp, TrendingDown, Receipt,
  Camera, Mic, MessageSquare
} from 'lucide-react';
import './FAB.css';

const FAB = ({ onAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      id: 'add-income',
      icon: TrendingUp,
      label: 'Nuevo Ingreso',
      color: 'success',
    },
    {
      id: 'add-expense',
      icon: TrendingDown,
      label: 'Nuevo Gasto',
      color: 'danger',
    },
    {
      id: 'scan-receipt',
      icon: Camera,
      label: 'Escanear Recibo',
      color: 'info',
    },
    {
      id: 'voice-command',
      icon: Mic,
      label: 'Comando de Voz',
      color: 'purple',
    },
    {
      id: 'quick-transaction',
      icon: Receipt,
      label: 'Transacción Rápida',
      color: 'warning',
    },
    {
      id: 'ask-assistant',
      icon: MessageSquare,
      label: 'Preguntar al Asistente',
      color: 'primary',
    },
  ];

  const handleActionClick = (actionId) => {
    setIsExpanded(false);
    onAction?.(actionId);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fab-backdrop"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* FAB Container */}
      <div className={`fab-container ${isExpanded ? 'expanded' : ''}`}>
        {/* Quick Actions */}
        {isExpanded && (
          <div className="fab-actions">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  className={`fab-action fab-action-${action.color}`}
                  onClick={() => handleActionClick(action.id)}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                  title={action.label}
                >
                  <Icon size={20} />
                  <span className="fab-action-label">{action.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main FAB Button */}
        <button
          className={`fab-button ${isExpanded ? 'rotated' : ''}`}
          onClick={toggleExpanded}
          aria-label={isExpanded ? 'Close menu' : 'Open quick actions'}
        >
          {isExpanded ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>
    </>
  );
};

export default FAB;
