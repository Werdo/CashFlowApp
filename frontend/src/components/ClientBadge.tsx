import React from 'react';

interface ClientBadgeProps {
  clientName: string;
  color?: string;
  className?: string;
  showDot?: boolean;
}

export const ClientBadge: React.FC<ClientBadgeProps> = ({
  clientName,
  color = '#3B82F6',
  className = '',
  showDot = true
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${color}20`, // 20% opacity
        color: color,
        borderColor: color,
        borderWidth: '1px'
      }}
    >
      {showDot && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {clientName}
    </span>
  );
};

export default ClientBadge;
