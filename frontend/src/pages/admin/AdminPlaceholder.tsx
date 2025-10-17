import React from 'react';

interface AdminPlaceholderProps {
  title: string;
  description: string;
  icon: string;
  features?: string[];
}

const AdminPlaceholder: React.FC<AdminPlaceholderProps> = ({ title, description, icon, features = [] }) => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card border-danger">
            <div className="card-body text-center py-5">
              <div style={{ fontSize: '4rem' }} className="mb-3">{icon}</div>
              <h2 className="mb-3">{title}</h2>
              <p className="text-muted mb-4">{description}</p>

              <div className="alert alert-warning" role="alert">
                <strong>Módulo en Desarrollo</strong>
                <br />
                Esta funcionalidad estará disponible próximamente.
              </div>

              {features.length > 0 && (
                <div className="mt-4">
                  <h5 className="mb-3">Funcionalidades Planificadas:</h5>
                  <ul className="list-unstyled">
                    {features.map((feature, index) => (
                      <li key={index} className="mb-2">
                        <i className="bi bi-check-circle text-success me-2"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4">
                <a href="/admin/clients" className="btn btn-danger me-2">
                  Ver Gestión de Clientes
                </a>
                <a href="/settings" className="btn btn-outline-secondary">
                  Ir a Configuración
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPlaceholder;
