export default function Dashboard({ user }: any) {
  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2>Dashboard AssetFlow</h2>
          <p className="text-muted">Bienvenido, {user?.name || 'Usuario'}</p>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Total Activos</h6>
              <h3 className="mb-0">1,234</h3>
              <small className="text-success">+12% vs mes anterior</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Valor Total</h6>
              <h3 className="mb-0">$2.5M</h3>
              <small className="text-success">+8% vs mes anterior</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Mantenimientos</h6>
              <h3 className="mb-0">45</h3>
              <small className="text-warning">-3% vs mes anterior</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">En Depósito</h6>
              <h3 className="mb-0">89</h3>
              <small className="text-info">+5% vs mes anterior</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0">Bienvenido a AssetFlow v2.0</h6>
            </div>
            <div className="card-body">
              <p>Sistema completo de gestión de activos con:</p>
              <ul>
                <li>📦 Módulo de Activos</li>
                <li>🔧 Módulo de Mantenimiento</li>
                <li>🔄 Módulo de Movimientos</li>
                <li>🏢 Módulo de Depósito con Mapa de España</li>
                <li>📈 Módulo de Reportes</li>
                <li>💰 Módulo de Facturación</li>
              </ul>
              <p className="mb-0">Navega por los módulos usando el menú lateral.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
