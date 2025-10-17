import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  user: any;
  onLogout: () => void;
  children: ReactNode;
}

export default function Layout({ user, onLogout, children }: LayoutProps) {
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'assets', path: '/assets', name: 'Activos', icon: '📦' },
    { id: 'maintenance', path: '/maintenance', name: 'Mantenimiento', icon: '🔧' },
    { id: 'movements', path: '/movements', name: 'Movimientos', icon: '🔄' },
    { id: 'deposit', path: '/deposit', name: 'Depósito', icon: '🏢' },
    { id: 'reports', path: '/reports', name: 'Reportes', icon: '📈' },
    { id: 'invoicing', path: '/invoicing', name: 'Facturación', icon: '💰' },
    { id: 'settings', path: '/settings', name: 'Configuración', icon: '⚙️' },
  ];

  const adminMenuItems = [
    { id: 'admin-clients', path: '/admin/clients', name: 'Clientes', icon: '👥', description: 'Gestión de clientes y jerarquía' },
    { id: 'admin-articles', path: '/admin/articles', name: 'Artículos', icon: '📦', description: 'Catálogo de productos' },
    { id: 'admin-warehouses', path: '/admin/warehouses', name: 'Almacenes', icon: '🏭', description: 'Gestión de almacenes' },
    { id: 'admin-stock', path: '/admin/stock', name: 'Stock', icon: '📊', description: 'Control de inventario' },
    { id: 'admin-lots', path: '/admin/lots', name: 'Lotes', icon: '🏷️', description: 'Trazabilidad de lotes' },
    { id: 'admin-users', path: '/admin/users', name: 'Usuarios', icon: '👤', description: 'Gestión de usuarios' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="d-flex" style={{ height: '100vh' }}>
      {/* Sidebar */}
      <div className="bg-dark text-white" style={{ width: '250px', overflowY: 'auto' }}>
        <div className="p-4">
          <h4 className="fw-bold mb-0">AssetFlow</h4>
          <small className="text-muted">v2.1.0</small>
        </div>

        <div className="px-3">
          <div className="mb-3">
            <div className="d-flex align-items-center p-2 bg-secondary bg-opacity-25 rounded">
              <div className="me-2">
                <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                  <span className="fw-bold">{user?.name?.charAt(0) || 'U'}</span>
                </div>
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold small">{user?.name || 'Usuario'}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.role || 'Usuario'}</div>
              </div>
            </div>
          </div>

          <nav className="nav flex-column">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-link text-white text-decoration-none ${isActive(item.path) ? 'bg-primary rounded' : ''}`}
              >
                <span className="me-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}

            {isAdmin && (
              <>
                <hr className="bg-secondary my-3" />
                <div className="px-2 mb-2">
                  <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Administración Backend
                  </small>
                </div>
                {adminMenuItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`nav-link text-white text-decoration-none ${isActive(item.path) ? 'bg-danger rounded' : ''}`}
                    title={item.description}
                  >
                    <span className="me-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </>
            )}

            <hr className="bg-secondary mt-3" />

            <a
              href="#"
              className="nav-link text-white text-decoration-none"
              onClick={(e) => {
                e.preventDefault();
                onLogout();
              }}
            >
              <span className="me-2">🚪</span>
              Cerrar Sesión
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light" style={{ overflowY: 'auto' }}>
        {/* Header */}
        <div className="bg-white border-bottom p-3">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">
                  {(() => {
                    const currentMenuItem = menuItems.find(item => isActive(item.path));
                    const currentAdminItem = isAdmin ? adminMenuItems.find(item => isActive(item.path)) : null;

                    if (currentAdminItem) {
                      return (
                        <>
                          {currentAdminItem.icon} {currentAdminItem.name}
                          <span className="badge bg-danger ms-2" style={{ fontSize: '0.6rem' }}>ADMIN</span>
                        </>
                      );
                    }

                    return (
                      <>
                        {currentMenuItem?.icon} {currentMenuItem?.name || 'AssetFlow'}
                      </>
                    );
                  })()}
                </h5>
                <small className="text-muted">Bienvenido, {user?.name}</small>
              </div>
              <div>
                <span className="badge bg-success me-2">API: Activo</span>
                <span className="badge bg-success">DB: Conectada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-fluid p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
