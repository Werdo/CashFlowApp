/**
 * Exportaciones centralizadas de datos AssetFlow
 */

// Oficinas de Correos
export {
  postalOffices,
  getPostalOfficeByCode,
  getPostalOfficesByProvince,
  getProvinces,
  getCapacityStats
} from './postalOffices';

// Mock Data
export {
  mockData,
  mockClients,
  mockAssets,
  mockDepositItems,
  mockMaintenances,
  mockMovements,
  mockInvoices,
  assetCategories
} from './mockData';

// Default export
export { default } from './mockData';
