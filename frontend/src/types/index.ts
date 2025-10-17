// Types for AssetFlow Application

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  avatar?: string;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: AssetCategory;
  status: AssetStatus;
  location: Location;
  purchaseDate: string;
  purchaseValue: number;
  currentValue: number;
  serialNumber?: string;
  qrCode?: string;
  images?: string[];
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type AssetStatus = 'active' | 'inactive' | 'maintenance' | 'retired' | 'in-deposit';

export interface Location {
  id: string;
  name: string;
  type: 'office' | 'warehouse' | 'postal-office' | 'other';
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PostalOffice extends Location {
  officeCode: string; // Código oficial de Correos
  type: 'postal-office';
  capacity: number;
  currentOccupancy: number;
  manager?: string;
  phone?: string;
  email?: string;
  operatingHours?: string;
  services?: string[];
}

export interface Client {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  taxId: string; // NIF/CIF
  contactPerson?: string;
  locations?: Location[];
  active: boolean;
  createdAt: string;
}

export interface DepositItem {
  id: string;
  clientId: string;
  client: Client;
  itemType: 'box' | 'pallet' | 'document' | 'other';
  itemCode: string;
  qrCode: string;
  description: string;
  quantity: number;
  location: PostalOffice;
  entryDate: string;
  exitDate?: string;
  status: 'stored' | 'in-transit' | 'delivered' | 'returned';
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  photos?: string[];
  notes?: string;
  weeklyReportId?: string;
}

export interface WeeklyReport {
  id: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  location: PostalOffice;
  items: DepositItem[];
  totalItems: number;
  newItems: number;
  deliveredItems: number;
  status: 'draft' | 'submitted' | 'approved';
  createdBy: string;
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
}

export interface Maintenance {
  id: string;
  assetId: string;
  asset: Asset;
  type: 'preventive' | 'corrective' | 'inspection';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  completedDate?: string;
  description: string;
  technician?: string;
  cost?: number;
  notes?: string;
  nextMaintenanceDate?: string;
  createdAt: string;
}

export interface Movement {
  id: string;
  assetId?: string;
  depositItemId?: string;
  type: 'transfer' | 'assignment' | 'return' | 'disposal' | 'deposit-entry' | 'deposit-exit';
  fromLocation: Location;
  toLocation: Location;
  date: string;
  reason: string;
  authorizedBy: string;
  status: 'pending' | 'in-transit' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'storage' | 'handling' | 'transport' | 'other';
  period?: {
    from: string;
    to: string;
  };
}

export interface DashboardStats {
  totalAssets: number;
  assetsChange: number;
  totalValue: number;
  valueChange: number;
  maintenancePending: number;
  maintenanceChange: number;
  depositItems: number;
  depositChange: number;
  postalOffices: number;
  activeClients: number;
}

export interface MapMarker {
  id: string;
  position: [number, number]; // [lat, lng]
  type: 'postal-office' | 'client' | 'asset';
  name: string;
  data: PostalOffice | Client | Asset;
  status?: string;
  count?: number;
}
