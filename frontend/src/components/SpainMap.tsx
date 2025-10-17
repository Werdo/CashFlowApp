import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PostalOffice } from '../types';
import { postalOffices, getProvinces } from '../data/postalOffices';

// Fix para iconos de Leaflet en build de producción
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Crear iconos personalizados según la ocupación
const createCustomIcon = (occupancyPercentage: number): L.Icon => {
  let color = '#28a745'; // Verde - baja ocupación
  if (occupancyPercentage > 80) {
    color = '#dc3545'; // Rojo - alta ocupación
  } else if (occupancyPercentage > 60) {
    color = '#ffc107'; // Amarillo - ocupación media
  }

  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 1.9 0.4 3.7 1.2 5.3L12.5 41l11.3-23.2c0.8-1.6 1.2-3.4 1.2-5.3C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `;

  return L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

interface SpainMapProps {
  offices?: PostalOffice[];
  height?: string;
  showFilters?: boolean;
  onOfficeClick?: (office: PostalOffice) => void;
}

// Componente para re-centrar el mapa cuando cambian los filtros
const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

/**
 * Componente de mapa interactivo de España
 * Muestra oficinas de Correos con información detallada
 */
const SpainMap: React.FC<SpainMapProps> = ({
  offices = postalOffices,
  height = '600px',
  showFilters = true,
  onOfficeClick
}) => {
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const provinces = useMemo(() => getProvinces(), []);

  // Filtrar oficinas según provincia y búsqueda
  const filteredOffices = useMemo(() => {
    return offices.filter(office => {
      const matchesProvince = !selectedProvince || office.province === selectedProvince;
      const matchesSearch = !searchTerm ||
        office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.officeCode.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesProvince && matchesSearch;
    });
  }, [offices, selectedProvince, searchTerm]);

  // Calcular centro del mapa según las oficinas filtradas
  const mapCenter = useMemo<[number, number]>(() => {
    if (filteredOffices.length === 0) {
      return [40.4168, -3.7038]; // Madrid por defecto
    }

    if (filteredOffices.length === 1 && filteredOffices[0].coordinates) {
      return [filteredOffices[0].coordinates.lat, filteredOffices[0].coordinates.lng];
    }

    const officesWithCoords = filteredOffices.filter(o => o.coordinates);
    if (officesWithCoords.length === 0) {
      return [40.4168, -3.7038];
    }

    const avgLat = officesWithCoords.reduce((sum, o) => sum + (o.coordinates?.lat || 0), 0) / officesWithCoords.length;
    const avgLng = officesWithCoords.reduce((sum, o) => sum + (o.coordinates?.lng || 0), 0) / officesWithCoords.length;

    return [avgLat, avgLng];
  }, [filteredOffices]);

  // Ajustar zoom según el número de oficinas
  const mapZoom = useMemo(() => {
    if (filteredOffices.length === 1) return 13;
    if (selectedProvince) return 9;
    return 6;
  }, [filteredOffices.length, selectedProvince]);

  const handleMarkerClick = (office: PostalOffice) => {
    if (onOfficeClick) {
      onOfficeClick(office);
    }
  };

  const resetFilters = () => {
    setSelectedProvince('');
    setSearchTerm('');
  };

  const occupancyPercentage = (office: PostalOffice): number => {
    return Math.round((office.currentOccupancy / office.capacity) * 100);
  };

  return (
    <div className="spain-map-container">
      {showFilters && (
        <div className="map-filters mb-3">
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="provinceFilter" className="form-label">
                Filtrar por Provincia
              </label>
              <select
                id="provinceFilter"
                className="form-select"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
              >
                <option value="">Todas las provincias</option>
                {provinces.map(province => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-5">
              <label htmlFor="searchFilter" className="form-label">
                Buscar Oficina
              </label>
              <input
                id="searchFilter"
                type="text"
                className="form-control"
                placeholder="Buscar por nombre, ciudad o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label d-block">&nbsp;</label>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={resetFilters}
                disabled={!selectedProvince && !searchTerm}
              >
                <i className="bi bi-x-circle me-1"></i>
                Limpiar Filtros
              </button>
            </div>
          </div>

          <div className="mt-3 d-flex align-items-center gap-3 flex-wrap">
            <small className="text-muted">
              <strong>{filteredOffices.length}</strong> oficina(s) mostrada(s)
            </small>

            <div className="d-flex align-items-center gap-3 ms-auto">
              <small className="text-muted">Ocupación:</small>
              <div className="d-flex align-items-center gap-1">
                <span className="badge" style={{ backgroundColor: '#28a745' }}>Baja (&lt;60%)</span>
                <span className="badge" style={{ backgroundColor: '#ffc107', color: '#000' }}>Media (60-80%)</span>
                <span className="badge" style={{ backgroundColor: '#dc3545' }}>Alta (&gt;80%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="map-wrapper" style={{ height, position: 'relative' }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          scrollWheelZoom={true}
        >
          <MapRecenter center={mapCenter} zoom={mapZoom} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredOffices
            .filter(office => office.coordinates)
            .map(office => {
              const occupancy = occupancyPercentage(office);

              return (
                <Marker
                  key={office.id}
                  position={[office.coordinates!.lat, office.coordinates!.lng]}
                  icon={createCustomIcon(occupancy)}
                  eventHandlers={{
                    click: () => handleMarkerClick(office)
                  }}
                >
                  <Popup maxWidth={300}>
                    <div className="office-popup">
                      <h6 className="mb-2 fw-bold">{office.name}</h6>

                      <div className="mb-2">
                        <small className="text-muted">Código:</small>
                        <strong className="ms-1">{office.officeCode}</strong>
                      </div>

                      <div className="mb-2">
                        <i className="bi bi-geo-alt me-1"></i>
                        <small>{office.address}</small><br />
                        <small>{office.city}, {office.province} - {office.postalCode}</small>
                      </div>

                      {office.phone && (
                        <div className="mb-1">
                          <i className="bi bi-telephone me-1"></i>
                          <small>{office.phone}</small>
                        </div>
                      )}

                      {office.email && (
                        <div className="mb-2">
                          <i className="bi bi-envelope me-1"></i>
                          <small>{office.email}</small>
                        </div>
                      )}

                      <div className="mb-2">
                        <small className="text-muted">Capacidad:</small>
                        <div className="progress mt-1" style={{ height: '20px' }}>
                          <div
                            className={`progress-bar ${
                              occupancy > 80 ? 'bg-danger' :
                              occupancy > 60 ? 'bg-warning' :
                              'bg-success'
                            }`}
                            role="progressbar"
                            style={{ width: `${occupancy}%` }}
                            aria-valuenow={occupancy}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <small className="fw-bold">{occupancy}%</small>
                          </div>
                        </div>
                        <small className="text-muted">
                          {office.currentOccupancy} / {office.capacity} items
                        </small>
                      </div>

                      {office.operatingHours && (
                        <div className="mb-2">
                          <i className="bi bi-clock me-1"></i>
                          <small>{office.operatingHours}</small>
                        </div>
                      )}

                      {office.services && office.services.length > 0 && (
                        <div className="mt-2">
                          <small className="text-muted d-block mb-1">Servicios:</small>
                          <div className="d-flex flex-wrap gap-1">
                            {office.services.map((service, idx) => (
                              <span key={idx} className="badge bg-info text-dark" style={{ fontSize: '0.7rem' }}>
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {office.manager && (
                        <div className="mt-2 pt-2 border-top">
                          <small className="text-muted">Responsable:</small>
                          <small className="ms-1 fw-bold">{office.manager}</small>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>

      <style>{`
        .spain-map-container {
          width: 100%;
        }

        .map-wrapper {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .office-popup {
          font-size: 0.9rem;
        }

        .office-popup h6 {
          color: #2c3e50;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 5px;
        }

        .office-popup i {
          color: #3b82f6;
        }

        .leaflet-popup-content {
          margin: 10px;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .map-filters .row > div {
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SpainMap;
