import { useState } from 'react';
import { mockMaintenances } from '../../data/mockData';

export default function MaintenanceModule() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredMaintenances = mockMaintenances.filter(maint => {
    const matchesStatus = filterStatus === 'all' || maint.status === filterStatus;
    const matchesType = filterType === 'all' || maint.type === filterType;
    return matchesStatus && matchesType;
  });

  const scheduledCount = mockMaintenances.filter(m => m.status === 'scheduled').length;
  const inProgressCount = mockMaintenances.filter(m => m.status === 'in-progress').length;
  const completedCount = mockMaintenances.filter(m => m.status === 'completed').length;
  const totalCost = mockMaintenances
    .filter(m => m.cost)
    .reduce((sum, m) => sum + (m.cost || 0), 0);

  const statusColors: Record<string, string> = {
    'scheduled': 'info',
    'in-progress': 'warning',
    'completed': 'success',
    'cancelled': 'secondary',
  };

  const statusLabels: Record<string, string> = {
    'scheduled': 'Programado',
    'in-progress': 'En Progreso',
    'completed': 'Completado',
    'cancelled': 'Cancelado',
  };

  const typeLabels: Record<string, string> = {
    'preventive': 'Preventivo',
    'corrective': 'Correctivo',
    'inspection': 'Inspección',
  };

  const typeIcons: Record<string, string> = {
    'preventive': '🛡️',
    'corrective': '🔧',
    'inspection': '🔍',
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Programados</h6>
                  <h3 className="mb-0">{scheduledCount}</h3>
                </div>
                <div className="text-info" style={{ fontSize: '2rem' }}>📅</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">En Progreso</h6>
                  <h3 className="mb-0">{inProgressCount}</h3>
                </div>
                <div className="text-warning" style={{ fontSize: '2rem' }}>🔧</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Completados</h6>
                  <h3 className="mb-0">{completedCount}</h3>
                </div>
                <div className="text-success" style={{ fontSize: '2rem' }}>✅</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Coste Total</h6>
                  <h3 className="mb-0">{totalCost.toLocaleString('es-ES')}€</h3>
                </div>
                <div className="text-primary" style={{ fontSize: '2rem' }}>💰</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="scheduled">Programado</option>
                <option value="in-progress">En Progreso</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="preventive">Preventivo</option>
                <option value="corrective">Correctivo</option>
                <option value="inspection">Inspección</option>
              </select>
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100">
                ➕ Programar Mantenimiento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenances Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h6 className="mb-0">🔧 Mantenimientos ({filteredMaintenances.length})</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tipo</th>
                  <th>Activo</th>
                  <th>Descripción</th>
                  <th>Fecha Programada</th>
                  <th>Técnico</th>
                  <th>Coste</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaintenances.map(maint => (
                  <tr key={maint.id}>
                    <td>
                      <span>
                        {typeIcons[maint.type]} {typeLabels[maint.type]}
                      </span>
                    </td>
                    <td>
                      <strong>{maint.asset.code}</strong>
                      <br />
                      <small className="text-muted">{maint.asset.name}</small>
                    </td>
                    <td>{maint.description}</td>
                    <td>
                      {new Date(maint.scheduledDate).toLocaleDateString('es-ES')}
                      {maint.completedDate && (
                        <>
                          <br />
                          <small className="text-success">
                            Completado: {new Date(maint.completedDate).toLocaleDateString('es-ES')}
                          </small>
                        </>
                      )}
                    </td>
                    <td>{maint.technician || '-'}</td>
                    <td>{maint.cost ? `${maint.cost.toLocaleString('es-ES')}€` : '-'}</td>
                    <td>
                      <span className={`badge bg-${statusColors[maint.status]}`}>
                        {statusLabels[maint.status]}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary">
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Calendar View Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">📅 Calendario de Mantenimientos</h6>
            </div>
            <div className="card-body">
              <div className="alert alert-info mb-0">
                <strong>Vista de Calendario</strong>
                <br />
                Próximamente: Vista de calendario con mantenimientos programados por fecha.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
