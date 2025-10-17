import React from 'react';
import AdminPlaceholder from './AdminPlaceholder';

const AdminWarehouses: React.FC = () => {
  return (
    <AdminPlaceholder
      title="Gestión de Almacenes"
      description="Administración de almacenes y ubicaciones por cliente"
      icon="🏭"
      features={[
        'Crear almacenes por cliente',
        'Gestión de ubicaciones dentro de cada almacén',
        'Importación masiva de ubicaciones desde CSV',
        'Mapeo de ubicaciones físicas',
        'Control de capacidad por ubicación',
        'Reportes de ocupación'
      ]}
    />
  );
};

export default AdminWarehouses;
