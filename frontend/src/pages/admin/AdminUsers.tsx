import React from 'react';
import AdminPlaceholder from './AdminPlaceholder';

const AdminUsers: React.FC = () => {
  return (
    <AdminPlaceholder
      title="Gestión de Usuarios"
      description="Administración de usuarios y permisos del sistema"
      icon="👤"
      features={[
        'Crear y editar usuarios',
        'Asignación de roles (Admin, Manager, Viewer)',
        'Gestión de permisos por rol',
        'Historial de accesos',
        'Reseteo de contraseñas',
        'Activar/desactivar usuarios',
        'Auditoría de acciones'
      ]}
    />
  );
};

export default AdminUsers;
