import React from 'react';
import AdminPlaceholder from './AdminPlaceholder';

const AdminLots: React.FC = () => {
  return (
    <AdminPlaceholder
      title="Gestión de Lotes"
      description="Trazabilidad de lotes maestros, lotes expo y códigos individuales"
      icon="🏷️"
      features={[
        'Creación de lotes maestros',
        'Generación de lotes de exportación',
        'Códigos de trazabilidad individuales',
        'Control de fechas de vencimiento',
        'Calendario de vencimientos',
        'Alertas de caducidad',
        'Trazabilidad completa desde origen hasta destino',
        'Reportes por lote'
      ]}
    />
  );
};

export default AdminLots;
