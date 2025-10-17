import React from 'react';
import AdminPlaceholder from './AdminPlaceholder';

const AdminStock: React.FC = () => {
  return (
    <AdminPlaceholder
      title="Control de Stock"
      description="Gestión de inventario y movimientos de stock"
      icon="📊"
      features={[
        'Visualización de stock por ubicación',
        'Movimientos de entrada y salida',
        'Transferencias entre almacenes',
        'Reservas de stock',
        'Aging report (antigüedad de stock)',
        'Alertas de stock mínimo',
        'Trazabilidad completa de movimientos'
      ]}
    />
  );
};

export default AdminStock;
