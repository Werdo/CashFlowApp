import React from 'react';
import AdminPlaceholder from './AdminPlaceholder';

const AdminArticles: React.FC = () => {
  return (
    <AdminPlaceholder
      title="Gestión de Artículos"
      description="Catálogo completo de productos con SKU, EAN, familias y fotos"
      icon="📦"
      features={[
        'Crear y editar artículos con SKU y EAN',
        'Organización por familias y sub-familias',
        'Gestión de precios y costos',
        'Upload de fotos de productos',
        'Búsqueda y filtrado avanzado',
        'Importación masiva desde CSV'
      ]}
    />
  );
};

export default AdminArticles;
