import { useState } from 'react';
import { mockMovements } from '../../data/mockData';

export default function MovementsModule() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredMovements = mockMovements.filter(mov => {
    const matchesStatus = filterStatus === 'all' || mov.status === filterStatus;
    const matchesType = filterType === 'all' || mov.type === filterType;
    return matchesStatus && matchesType;
  });

  const pendingCount = mockMovements.filter(m => m.status === 'pending').length;
  const inTransitCount = mockMovements.filter(m => m.status === 'in-transit').length;
  const completedCount = mockMovements.filter(m => m.status === 'completed').length;

  const statusColors: Record<string, string> = {
    'pending': 'warning',
    'in-transit': 'info',
    'completed': 'success',
    'cancelled': 'secondary',
  };

  const statusLabels: Record<string, string> = {
    'pending': 'Pendiente',
    'in-transit': 'En Tránsito',
    'completed': 'Completado',
    'cancelled': 'Cancelado',
  };

  const typeLabels: Record<string, string> = {
    'transfer': 'Transferencia',
    'assignment': 'Asignación',
    'return': 'Devolución',
    'disposal': 'Desecho',
    'deposit-entry': 'Entrada Depósito',
    'deposit-exit': 'Salida Depósito',
  };

  const typeIcons: Record<string, string> = {
    'transfer': '🔄',
    'assignment': '👤',
    'return': '↩️',
    'disposal': '🗑️',
    'deposit-entry': '📥',
    'deposit-exit': '📤',
  };

  return (
    <div>
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Pendientes</h6>
                  <h3 className="mb-0">{pendingCount}</h3>
                </div>
                <div className="text-warning" style={{ fontSize: '2rem' }}>⏳</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">En Tránsito</h6>
                  <h3 className="mb-0">{inTransitCount}</h3>
                </div>
                <div className="text-info" style={{ fontSize: '2rem' }}>🚚</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
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
                <option value="pending">Pendiente</option>
                <option value="in-transit">En Tránsito</option>
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
                <option value="transfer">Transferencia</option>
                <option value="assignment">Asignación</option>
                <option value="return">Devolución</option>
                <option value="disposal">Desecho</option>
                <option value="deposit-entry">Entrada Depósito</option>
                <option value="deposit-exit">Salida Depósito</option>
              </select>
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100">
                ➕ Nuevo Movimiento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h6 className="mb-0">🔄 Movimientos ({filteredMovements.length})</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Tipo</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Fecha</th>
                  <th>Motivo</th>
                  <th>Autorizado por</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map(movement => (
                  <tr key={movement.id}>
                    <td>
                      <span>
                        {typeIcons[movement.type]} {typeLabels[movement.type]}
                      </span>
                    </td>
                    <td>
                      <strong>{movement.fromLocation.name}</strong>
                      <br />
                      <small className="text-muted">{movement.fromLocation.city}</small>
                    </td>
                    <td>
                      <strong>{movement.toLocation.name}</strong>
                      <br />
                      <small className="text-muted">{movement.toLocation.city}</small>
                    </td>
                    <td>{new Date(movement.date).toLocaleDateString('es-ES')}</td>
                    <td>
                      {movement.reason.length > 40
                        ? `${movement.reason.substring(0, 40)}...`
                        : movement.reason}
                    </td>
                    <td>{movement.authorizedBy}</td>
                    <td>
                      <span className={`badge bg-${statusColors[movement.status]}`}>
                        {statusLabels[movement.status]}
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

      {/* Timeline View */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">📊 Línea de Tiempo de Movimientos</h6>
            </div>
            <div className="card-body">
              <div className="alert alert-info mb-0">
                <strong>Vista de Línea de Tiempo</strong>
                <br />
                Próximamente: Vista de línea de tiempo con todos los movimientos en orden cronológico.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
