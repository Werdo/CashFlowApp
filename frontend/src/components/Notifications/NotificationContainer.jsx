import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import './NotificationContainer.css';

const NotificationItem = ({ notification, onClose }) => {
  const { id, type, title, message, action } = notification;

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[type] || Info;

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-icon">
        <Icon size={20} />
      </div>

      <div className="notification-content">
        {title && <div className="notification-title">{title}</div>}
        {message && <div className="notification-message">{message}</div>}
        {action && (
          <button
            className="notification-action-btn"
            onClick={() => {
              action.onClick();
              onClose(id);
            }}
          >
            {action.label}
          </button>
        )}
      </div>

      <button
        className="notification-close-btn"
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
